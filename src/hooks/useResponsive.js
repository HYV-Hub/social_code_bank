import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * Provides breakpoint detection and device type
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize?.width < 640; // sm breakpoint
  const isTablet = screenSize?.width >= 640 && screenSize?.width < 1024; // sm to lg
  const isDesktop = screenSize?.width >= 1024; // lg breakpoint
  const isLargeDesktop = screenSize?.width >= 1280; // xl breakpoint

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large-desktop'
  };
};

/**
 * Custom hook for media queries
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media?.matches !== matches) {
      setMatches(media?.matches);
    }

    const listener = () => setMatches(media?.matches);
    media?.addEventListener('change', listener);
    
    return () => media?.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Common responsive breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');