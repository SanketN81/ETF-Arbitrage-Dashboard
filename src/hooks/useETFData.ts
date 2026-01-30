import { useState, useEffect, useCallback, useRef } from 'react';
import type { ETFData, ArbitrageOpportunity, DashboardStats } from '@/types/etf';
import { apiService } from '@/services/api';

interface UseETFDataOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export function useETFData(options: UseETFDataOptions = {}) {
  const { refreshInterval = 5000, autoRefresh = true } = options;
  
  const [etfs, setEtfs] = useState<ETFData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async () => {
    // Only show loading on first load, not on refresh
    if (isFirstLoad.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getAllETFs();
      if (response.success && response.data) {
        setEtfs(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching ETF data:', err);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Calculate arbitrage opportunities
  const arbitrageOpportunities: ArbitrageOpportunity[] = etfs
    .filter(etf => etf.currentPrice && etf.inav)
    .map(etf => {
      const diff = etf.currentPrice! - etf.inav!;
      const percent = (diff / etf.inav!) * 100;
      
      let recommendation = '';
      if (percent < -1) {
        recommendation = 'STRONG BUY - Significant discount to NAV';
      } else if (percent < -0.5) {
        recommendation = 'BUY - Trading at discount';
      } else if (percent > 1) {
        recommendation = 'STRONG SELL - Significant premium to NAV';
      } else if (percent > 0.5) {
        recommendation = 'SELL - Trading at premium';
      } else {
        recommendation = 'HOLD - Near fair value';
      }

      return {
        symbol: etf.symbol,
        name: etf.name,
        type: (diff > 0 ? 'premium' : 'discount') as 'premium' | 'discount',
        amount: Math.abs(diff),
        percent: Math.abs(percent),
        currentPrice: etf.currentPrice!,
        inav: etf.inav!,
        recommendation
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalAssets: etfs.length,
    premiumCount: etfs.filter(etf => (etf.premiumDiscountPercent || 0) > 0).length,
    discountCount: etfs.filter(etf => (etf.premiumDiscountPercent || 0) < 0).length,
    arbitrageOpportunities,
    lastUpdated: lastUpdated?.toISOString() || ''
  };

  // Setup auto-refresh
  useEffect(() => {
    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval]);

  return {
    etfs,
    loading,
    error,
    lastUpdated,
    refresh,
    arbitrageOpportunities,
    stats
  };
}

export default useETFData;
