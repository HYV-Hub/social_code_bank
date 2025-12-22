import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scrolling with automatic data loading
 */
export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 0,
    pageSize = 20,
    threshold = 0.8
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  // Load more data
  const loadMore = useCallback(async () => {
    if (loadingRef?.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const offset = page * pageSize;
      const result = await fetchFunction({ limit: pageSize, offset });

      if (result?.length === 0 || result?.length < pageSize) {
        setHasMore(false);
      }

      setData(prevData => [...prevData, ...(result || [])]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError(err?.message || 'Failed to load more data');
      console.error('Infinite scroll error:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, pageSize, hasMore, fetchFunction]);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold }
    );

    if (observerRef?.current) {
      observer?.observe(observerRef?.current);
    }

    return () => {
      if (observerRef?.current) {
        observer?.unobserve(observerRef?.current);
      }
    };
  }, [hasMore, loading, loadMore, threshold]);

  // Reset function for refreshing data
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, [initialPage]);

  return {
    data,
    loading,
    hasMore,
    error,
    observerRef,
    loadMore,
    reset
  };
};