import React, { useState, useEffect, useRef } from 'react';
/**
 * Performance Utilities
 * Helpers for optimizing application performance
 */

// Debounce function for search inputs
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (imageUrl, placeholder = '/assets/images/no_image.png') => {
  const [src, setSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setSrc(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setSrc(placeholder);
      setIsLoading(false);
    };
  }, [imageUrl, placeholder]);

  return { src, isLoading };
};

// Intersection Observer for infinite scroll
export const useInfiniteScroll = (callback) => {
  const observerRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef?.current) {
      observer?.observe(observerRef?.current);
    }

    return () => {
      if (observerRef?.current) {
        observer?.unobserve(observerRef?.current);
      }
    };
  }, [callback]);

  return observerRef;
};

// Memoize expensive computations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache?.has(key)) {
      return cache?.get(key);
    }
    const result = fn(...args);
    cache?.set(key, result);
    return result;
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes?.[i];
};

// Compress image before upload
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Local storage with expiry
export const localStorageWithExpiry = {
  set: (key, value, ttl) => {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item?.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item?.value;
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// Batch API calls
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < requests?.length; i += batchSize) {
    const batch = requests?.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results?.push(...batchResults);
  }
  return results;
};

// Measure component render time
export const useRenderTime = (componentName) => {
  React.useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
};

// Preload route component
export const preloadRoute = (route) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head?.appendChild(link);
};