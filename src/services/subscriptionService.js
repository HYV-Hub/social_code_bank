import { supabase } from '../lib/supabase';

export const subscriptionService = {
  async getCurrentSubscription() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('subscriptions')?.select('*')?.eq('user_id', user?.id)?.single();

    if (error) throw error;
    return data;
  },

  async createSubscription(plan, paymentMethodId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.functions?.invoke('create-subscription', {
      body: {
        userId: user?.id,
        plan,
        paymentMethodId
      }
    });

    if (error) throw error;
    return data;
  },

  async cancelSubscription(immediately = false) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.functions?.invoke('cancel-subscription', {
      body: {
        userId: user?.id,
        immediately
      }
    });

    if (error) throw error;
    return data;
  },

  async getPaymentMethods() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('payment_methods')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPaymentHistory() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('payment_transactions')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(20);

    if (error) throw error;
    return data || [];
  },

  canCreateSnippet(subscription) {
    if (!subscription) return false;
    if (subscription?.status !== 'active') return false;
    if (subscription?.plan !== 'free') return true;
    return subscription?.snippets_this_month < subscription?.snippet_limit;
  },

  getSnippetUsagePercentage(subscription) {
    if (!subscription || subscription?.plan !== 'free') return 0;
    return Math.round((subscription?.snippets_this_month / subscription?.snippet_limit) * 100);
  },

  formatPrice(amount, currency = 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  }
};