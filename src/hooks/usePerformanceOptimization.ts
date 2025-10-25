import { useCallback, useMemo, useRef } from 'react';

export const usePerformanceOptimization = () => {
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const memoCache = useRef<Map<string, any>>(new Map());

  // Advanced debouncing with dynamic delays
  const advancedDebounce = useCallback((
    func: Function, 
    delay: number, 
    key: string,
    options: { leading?: boolean; trailing?: boolean } = { trailing: true }
  ) => {
    return (...args: any[]) => {
      const { leading = false, trailing = true } = options;
      
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }
      
      if (leading && !debounceTimers.current[key]) {
        func.apply(null, args);
      }
      
      debounceTimers.current[key] = setTimeout(() => {
        if (trailing) {
          func.apply(null, args);
        }
        delete debounceTimers.current[key];
      }, delay);
    };
  }, []);

  // Intelligent memoization with TTL
  const memoizeWithTTL = useCallback((
    func: Function,
    keyGenerator: (...args: any[]) => string,
    ttl: number = 300000 // 5 minutes default
  ) => {
    return (...args: any[]) => {
      const key = keyGenerator(...args);
      const cached = memoCache.current.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      
      const result = func(...args);
      memoCache.current.set(key, {
        value: result,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries
      if (memoCache.current.size > 1000) {
        const oldEntries = Array.from(memoCache.current.entries())
          .filter(([_, entry]) => Date.now() - entry.timestamp > ttl)
          .slice(0, 500);
        
        oldEntries.forEach(([key]) => memoCache.current.delete(key));
      }
      
      return result;
    };
  }, []);

  // Batch processing utility
  const batchProcessor = useCallback(<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 50,
    concurrent: number = 5
  ) => {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return new Promise<R[]>((resolve, reject) => {
      const results: R[] = [];
      let processing = 0;
      let batchIndex = 0;

      const processBatch = async () => {
        if (batchIndex >= batches.length) {
          if (processing === 0) {
            resolve(results);
          }
          return;
        }

        const currentBatch = batches[batchIndex++];
        processing++;

        try {
          const batchResults = await processor(currentBatch);
          results.push(...batchResults);
          processing--;
          processBatch();
        } catch (error) {
          processing--;
          reject(error);
        }
      };

      // Start concurrent processing
      for (let i = 0; i < Math.min(concurrent, batches.length); i++) {
        processBatch();
      }
    });
  }, []);

  // Performance monitoring
  const performanceMonitor = useCallback((name: string) => {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`⚡ ${name} completed in ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }, []);

  // Clean up function
  const cleanup = useCallback(() => {
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
    memoCache.current.clear();
  }, []);

  return {
    advancedDebounce,
    memoizeWithTTL,
    batchProcessor,
    performanceMonitor,
    cleanup
  };
};