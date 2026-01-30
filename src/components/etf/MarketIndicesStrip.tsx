import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketIndicesStripProps {
  refreshInterval: number;
}

export function MarketIndicesStrip({ refreshInterval }: MarketIndicesStripProps) {
  const [indices, setIndices] = useState<IndexData[]>([]);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const response = await apiService.getMarketIndices();
        if (response.success && response.data) {
          setIndices(response.data);
        }
      } catch (error) {
        console.error('Error fetching indices:', error);
      }
    };

    fetchIndices();
    const interval = setInterval(fetchIndices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Default indices if none loaded
  const displayIndices = indices.length > 0 ? indices : [
    { symbol: 'NIFTY 50', name: 'Nifty 50', price: 0, change: 0, changePercent: 0 },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 0, change: 0, changePercent: 0 },
    { symbol: 'SENSEX', name: 'Sensex', price: 0, change: 0, changePercent: 0 },
  ];

  // Duplicate indices for seamless scrolling
  const scrollingIndices = [...displayIndices, ...displayIndices, ...displayIndices];

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-2 overflow-hidden">
      <div className="flex items-center">
        {/* Live indicator - fixed */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 border-r border-slate-600">
          <Activity className="w-3 h-3 text-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">LIVE</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll-x flex items-center gap-8 whitespace-nowrap">
            {scrollingIndices.map((index, i) => {
              const isPositive = index.change >= 0;
              const isLoading = index.price === 0;

              return (
                <div 
                  key={`${index.symbol}-${i}`} 
                  className="flex items-center gap-3 flex-shrink-0"
                >
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {index.symbol === 'NIFTY 50' ? 'NIFTY 50' : index.symbol}
                  </span>
                  
                  {isLoading ? (
                    <span className="text-sm font-bold">--</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold tabular-nums">
                        {formatPrice(index.price)}
                      </span>
                      <span 
                        className={cn(
                          "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatChange(index.change)}
                        <span className="opacity-75 ml-0.5">
                          ({formatChangePercent(index.changePercent)})
                        </span>
                      </span>
                    </>
                  )}
                  
                  {/* Separator */}
                  <span className="text-slate-600 mx-2">|</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketIndicesStrip;
