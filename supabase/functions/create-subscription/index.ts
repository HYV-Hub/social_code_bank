import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Add this block - Declare Deno global for type safety
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { userId, plan, paymentMethodId } = await req.json()

      if (!userId || !plan) {
        return new Response(
          JSON.stringify({ error: 'User ID and plan are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('user_profiles')
        .select('email, full_name, stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create or get Stripe customer
      let stripeCustomerId = profile.stripe_customer_id
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: profile.email,
          name: profile.full_name,
          metadata: { userId }
        })
        stripeCustomerId = customer.id

        // Update user profile with stripe_customer_id
        await supabaseClient
          .from('user_profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId)
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        })

        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        })
      }

      // Define pricing based on plan (£9.99 for premium)
      const prices = {
        premium: { amount: 999, interval: 'month' }, // £9.99
        enterprise: { amount: 4999, interval: 'month' } // £49.99
      }

      const priceConfig = prices[plan]
      if (!priceConfig) {
        return new Response(
          JSON.stringify({ error: 'Invalid plan' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `HyvHub ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: plan === 'premium' ?'Tag more than 50 snippets per month' :'Unlimited snippets with priority support'
            },
            unit_amount: priceConfig.amount,
            recurring: {
              interval: priceConfig.interval as 'month'
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      })

      // Save subscription to database
      const snippetLimit = plan === 'premium' ? 200 : -1 // -1 for unlimited
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: stripeCustomerId,
          plan: plan,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          snippet_limit: snippetLimit,
          price_amount: priceConfig.amount / 100,
          currency: 'GBP'
        }, { onConflict: 'user_id' })

      if (subscriptionError) {
        console.error('Subscription save error:', subscriptionError)
      }

      return new Response(
        JSON.stringify({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret,
          status: subscription.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Subscription creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})