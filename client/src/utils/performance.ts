/**
 * Performance Utilities
 * Helper functions for optimizing app performance
 */

/**
 * Debounce function to limit rate of function calls
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function to limit function execution frequency
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with IntersectionObserver
 * @param imgElement Image element to lazy load
 */
export function lazyLoadImage(imgElement: HTMLImageElement): void {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  });

  observer.observe(imgElement);
}

/**
 * Format file size in human-readable format
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;

  // Check for 2G or slow 3G
  return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
}

/**
 * Preload critical resources
 * @param urls Array of resource URLs to preload
 */
export function preloadResources(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    // Determine resource type from extension
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      link.as = 'image';
    } else if (url.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Measure and log component render time
 * @param componentName Name of the component
 */
export function measureRenderTime(componentName: string): {
  start: () => void;
  end: () => void;
} {
  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
    },
  };
}

/**
 * Cache API responses with expiration
 */
class CacheManager {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new CacheManager();

/**
 * Retry failed API requests with exponential backoff
 * @param fn Async function to retry
 * @param maxRetries Maximum number of retries
 * @param delay Initial delay in milliseconds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
}

/**
 * Batch multiple API calls
 * @param calls Array of async functions
 * @param batchSize Number of concurrent requests
 */
export async function batchApiCalls<T>(
  calls: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((call) => call()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    console.group('📊 Performance Metrics');
    console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');
    console.log('TCP Connection:', navigation.connectEnd - navigation.connectStart, 'ms');
    console.log('Request Time:', navigation.responseStart - navigation.requestStart, 'ms');
    console.log('Response Time:', navigation.responseEnd - navigation.responseStart, 'ms');
    console.log('DOM Processing:', navigation.domComplete - navigation.domInteractive, 'ms');
    console.log('Total Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
    console.groupEnd();
  }

  // Resource timing
  const resources = performance.getEntriesByType('resource');
  const slowResources = resources.filter((r) => r.duration > 1000);
  
  if (slowResources.length > 0) {
    console.group('⚠️ Slow Resources (>1s)');
    slowResources.forEach((resource: any) => {
      console.log(`${resource.name}: ${resource.duration.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}
