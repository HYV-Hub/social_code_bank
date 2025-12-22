import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req?.method === 'POST') {
      const { userId, immediately = false } = await req?.json()

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user's subscription
      const { data: subscription, error: subError } = await supabaseClient?.from('subscriptions')?.select('stripe_subscription_id')?.eq('user_id', userId)?.single()

      if (subError || !subscription?.stripe_subscription_id) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Cancel subscription
      const canceled = immediately
        ? await stripe?.subscriptions?.cancel(subscription?.stripe_subscription_id)
        : await stripe?.subscriptions?.update(subscription?.stripe_subscription_id, {
            cancel_at_period_end: true,
          })

      // Update database
      await supabaseClient?.from('subscriptions')?.update({
          status: immediately ? 'canceled' : 'active',
          cancel_at_period_end: !immediately,
          updated_at: new Date()?.toISOString()
        })?.eq('user_id', userId)

      return new Response(
        JSON.stringify({
          success: true,
          canceled_at: immediately ? new Date().toISOString() : canceled.current_period_end,
          will_cancel_at_period_end: !immediately
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})