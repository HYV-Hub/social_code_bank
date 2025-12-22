import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Use startTransition to avoid suspension warning in React 18
    startTransition(() => {
      const initializeStripe = async () => {
        try {
          const stripe = await loadStripe(import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY);
          setStripePromise(stripe);
        } catch (error) {
          console.error('Failed to load Stripe:', error);
        }
      };
      initializeStripe();
    });
  }, []);

  const stripeOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    }
  };

  return (
    <StripeContext.Provider value={{ stripePromise, stripeOptions, isLoading: isPending }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};