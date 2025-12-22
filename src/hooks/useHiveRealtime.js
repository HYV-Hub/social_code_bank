import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook for Supabase real-time subscriptions in Global Hives
 * Handles live updates for activity feeds, member joins, and comments
 */
export const useHiveRealtime = (hiveId, callbacks = {}) => {
  const {
    onMemberJoined,
    onSnippetAdded,
    onCommentAdded,
    onCollectionUpdated
  } = callbacks;

  // Store subscriptions to clean up on unmount
  const subscriptionsRef = useRef([]);

  // Memoize callbacks to prevent unnecessary re-subscriptions
  const memoizedCallbacks = useRef(callbacks);
  
  useEffect(() => {
    memoizedCallbacks.current = callbacks;
  }, [callbacks]);

  const setupSubscriptions = useCallback(() => {
    if (!hiveId) return;

    // Clean up existing subscriptions
    subscriptionsRef?.current?.forEach(subscription => {
      supabase?.removeChannel(subscription);
    });
    subscriptionsRef.current = [];

    // 1. Subscribe to member joins
    const memberSubscription = supabase
      ?.channel(`hive_members:${hiveId}`)
      ?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hive_members',
          filter: `hive_id=eq.${hiveId}`
        },
        async (payload) => {
          console.log('🔔 New member joined:', payload);
          
          // Fetch user details for the new member
          const { data: userData } = await supabase
            ?.from('user_profiles')
            ?.select('id, username, full_name, avatar_url')
            ?.eq('id', payload?.new?.user_id)
            ?.single();

          if (memoizedCallbacks?.current?.onMemberJoined) {
            memoizedCallbacks?.current?.onMemberJoined({
              ...payload?.new,
              user: userData
            });
          }
        }
      )
      ?.subscribe();

    // 2. Subscribe to snippet additions (activity feed)
    const snippetSubscription = supabase
      ?.channel(`hive_snippets:${hiveId}`)
      ?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hive_snippets',
          filter: `hive_id=eq.${hiveId}`
        },
        async (payload) => {
          console.log('🔔 New snippet added to hive:', payload);
          
          // Fetch snippet details with author info
          const { data: snippetData } = await supabase
            ?.from('snippets')
            ?.select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
            ?.eq('id', payload?.new?.snippet_id)
            ?.single();

          if (memoizedCallbacks?.current?.onSnippetAdded && snippetData) {
            memoizedCallbacks?.current?.onSnippetAdded(snippetData);
          }
        }
      )
      ?.subscribe();

    // 3. Subscribe to comments on hive snippets
    const commentSubscription = supabase
      ?.channel(`snippet_comments:hive:${hiveId}`)
      ?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'snippet_comments'
        },
        async (payload) => {
          console.log('🔔 New comment detected:', payload);
          
          // Check if comment belongs to a snippet in this hive
          const { data: hiveSnippet } = await supabase
            ?.from('hive_snippets')
            ?.select('snippet_id')
            ?.eq('hive_id', hiveId)
            ?.eq('snippet_id', payload?.new?.snippet_id)
            ?.single();

          if (hiveSnippet) {
            // Fetch comment details with user info
            const { data: commentData } = await supabase
              ?.from('snippet_comments')
              ?.select('*, user:user_profiles!snippet_comments_user_id_fkey(id, username, full_name, avatar_url), snippet:snippets!snippet_comments_snippet_id_fkey(id, title)')
              ?.eq('id', payload?.new?.id)
              ?.single();

            if (memoizedCallbacks?.current?.onCommentAdded && commentData) {
              memoizedCallbacks?.current?.onCommentAdded(commentData);
            }
          }
        }
      )
      ?.subscribe();

    // 4. Subscribe to collection updates
    const collectionSubscription = supabase
      ?.channel(`hive_collections:${hiveId}`)
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hive_collections',
          filter: `hive_id=eq.${hiveId}`
        },
        (payload) => {
          console.log('🔔 Collection updated:', payload);
          
          if (memoizedCallbacks?.current?.onCollectionUpdated) {
            memoizedCallbacks?.current?.onCollectionUpdated(payload);
          }
        }
      )
      ?.subscribe();

    // Store subscriptions for cleanup
    subscriptionsRef.current = [
      memberSubscription,
      snippetSubscription,
      commentSubscription,
      collectionSubscription
    ];
  }, [hiveId]);

  // Setup subscriptions on mount and when hiveId changes
  useEffect(() => {
    setupSubscriptions();

    // Cleanup on unmount
    return () => {
      subscriptionsRef?.current?.forEach(subscription => {
        supabase?.removeChannel(subscription);
      });
      subscriptionsRef.current = [];
    };
  }, [setupSubscriptions]);

  return {
    // Expose method to manually resubscribe if needed
    resubscribe: setupSubscriptions
  };
};

export default useHiveRealtime;