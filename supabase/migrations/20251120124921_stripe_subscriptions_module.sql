-- Location: supabase/migrations/20251120124921_stripe_subscriptions_module.sql
-- Schema Analysis: Existing user_profiles, snippets tables with contributor levels
-- Integration Type: NEW subscription billing module for HyvHub
-- Dependencies: user_profiles(id), snippets table for usage tracking

-- ========================================
-- 1. ENUMS AND TYPES
-- ========================================

CREATE TYPE public.subscription_plan AS ENUM ('free', 'premium', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
CREATE TYPE public.payment_method_type AS ENUM ('card', 'bank_account', 'other');

-- ========================================
-- 2. SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan public.subscription_plan NOT NULL DEFAULT 'free'::public.subscription_plan,
    status public.subscription_status NOT NULL DEFAULT 'active'::public.subscription_status,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    snippets_this_month INTEGER DEFAULT 0,
    snippet_limit INTEGER DEFAULT 50,
    price_amount DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'GBP',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. PAYMENT METHODS TABLE
-- ========================================

CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    type public.payment_method_type NOT NULL,
    card_brand TEXT,
    card_last_four TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. PAYMENT TRANSACTIONS TABLE
-- ========================================

CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id TEXT,
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 5. INDEXES
-- ========================================

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);

-- ========================================
-- 6. FUNCTIONS
-- ========================================

-- Function to check if user can create snippets
CREATE OR REPLACE FUNCTION public.can_create_snippet(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = user_uuid
    AND s.status = 'active'
    AND (
        s.plan != 'free'
        OR (s.plan = 'free' AND s.snippets_this_month < s.snippet_limit)
    )
)
$$;

-- Function to increment snippet usage
CREATE OR REPLACE FUNCTION public.increment_snippet_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.subscriptions
    SET snippets_this_month = snippets_this_month + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP)
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP);
    
    RETURN NEW;
END;
$$;

-- Function to reset monthly snippet count
CREATE OR REPLACE FUNCTION public.reset_monthly_snippet_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.subscriptions
    SET snippets_this_month = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE EXTRACT(DAY FROM CURRENT_TIMESTAMP) = 1;
END;
$$;

-- ========================================
-- 7. ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Pattern 2: Simple User Ownership for subscriptions
CREATE POLICY "users_manage_own_subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for payment methods
CREATE POLICY "users_manage_own_payment_methods"
ON public.payment_methods
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for transactions
CREATE POLICY "users_view_own_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- 8. TRIGGERS
-- ========================================

CREATE TRIGGER trigger_increment_snippet_usage
AFTER INSERT ON public.snippets
FOR EACH ROW
EXECUTE FUNCTION public.increment_snippet_usage();

-- Update updated_at timestamp trigger
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 9. ALTER EXISTING USER_PROFILES
-- ========================================

-- Add stripe_customer_id to existing user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON public.user_profiles(stripe_customer_id);

-- ========================================
-- 10. INITIAL SUBSCRIPTION FOR EXISTING USERS
-- ========================================

-- Create free subscriptions for all existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.user_profiles LOOP
        INSERT INTO public.subscriptions (user_id, plan, status, snippet_limit)
        VALUES (user_record.id, 'free'::public.subscription_plan, 'active'::public.subscription_status, 50)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;