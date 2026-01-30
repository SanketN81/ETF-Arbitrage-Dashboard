import { useState, useEffect } from 'react';
import { useETFData } from '@/hooks/useETFData';
import { MarketIndicesStrip } from '@/components/etf/MarketIndicesStrip';
import { DashboardHeader } from '@/components/etf/DashboardHeader';
import { ETFCard } from '@/components/etf/ETFCard';
import { ArbitragePanel } from '@/components/etf/ArbitragePanel';
import { AddAssetDialog } from '@/components/etf/AddAssetDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, LayoutGrid, List, TrendingUp, Heart } from 'lucide-react';

// LocalStorage key for favorites
const FAVORITES_STORAGE_KEY = 'etf-favorites';

export function Dashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
    return new Set();
  });

  const {
    etfs,
    loading,
    error,
    lastUpdated,
    refresh,
    arbitrageOpportunities,
    stats
  } = useETFData({
    refreshInterval,
    autoRefresh: true
  });

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites]);

  const handleFavoriteToggle = (symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const favoriteEtfs = etfs.filter(etf => favorites.has(etf.symbol));

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MarketIndicesStrip refreshInterval={refreshInterval} />
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load ETF data: {error}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Market Indices Strip */}
      <MarketIndicesStrip refreshInterval={refreshInterval} />

      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-[1600px]">
        {/* Header */}
        <DashboardHeader
          stats={stats}
          lastUpdated={lastUpdated}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          onRefresh={refresh}
        />

        {/* Main Content */}
        <Tabs defaultValue="grid" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="w-4 h-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favorites
                {favorites.size > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {favorites.size}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="arbitrage" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Arbitrage
              </TabsTrigger>
            </TabsList>
            <AddAssetDialog onAssetAdded={refresh} />
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
              {/* ETF Cards */}
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-[320px]" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {etfs.map((etf) => (
                      <ETFCard
                        key={etf.symbol}
                        etf={etf}
                        isFavorite={favorites.has(etf.symbol)}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Arbitrage Panel - Sticky on desktop */}
              <div className="xl:sticky xl:top-4 xl:self-start">
                <ArbitragePanel opportunities={arbitrageOpportunities} />
              </div>
            </div>
          </TabsContent>

          {/* Favorites View */}
          <TabsContent value="favorites" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
              <div>
                {favoriteEtfs.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">No Favorites Yet</h3>
                    <p className="text-sm">Click the heart icon on any ETF card to add it to your favorites.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteEtfs.map((etf) => (
                      <ETFCard
                        key={etf.symbol}
                        etf={etf}
                        isFavorite={true}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Arbitrage Panel */}
              <div className="xl:sticky xl:top-4 xl:self-start">
                <ArbitragePanel opportunities={arbitrageOpportunities} />
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {etfs.map((etf) => (
                  <div
                    key={etf.symbol}
                    className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFavoriteToggle(etf.symbol)}
                        className={`p-1 transition-colors ${favorites.has(etf.symbol) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      >
                        <Heart className={`w-5 h-5 ${favorites.has(etf.symbol) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">{etf.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold">{etf.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{etf.name}</p>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {etf.assetType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="font-bold">₹{etf.currentPrice?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Market Price</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{etf.inav?.toFixed(2) || '--'}</div>
                        <div className="text-sm text-muted-foreground">i-NAV</div>
                      </div>
                      <div className="text-right">
                        {/* DISCOUNT = GREEN, PREMIUM = RED */}
                        <div className={`font-bold ${(etf.premiumDiscountPercent || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {(etf.premiumDiscountPercent || 0) > 0 ? '+' : ''}
                          {etf.premiumDiscountPercent?.toFixed(2) || '--'}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(etf.premiumDiscountPercent || 0) > 0 ? 'Premium' : 'Discount'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Arbitrage View */}
          <TabsContent value="arbitrage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy Opportunities */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Buy Opportunities (Discount to NAV)
                </h2>
                {arbitrageOpportunities
                  .filter(o => o.type === 'discount')
                  .map(opp => (
                    <div
                      key={opp.symbol}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">{opp.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{opp.name}</p>
                        </div>
                        <div className="text-green-600 font-bold">
                          {opp.percent.toFixed(2)}% OFF
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Market: </span>
                          <span className="font-medium">₹{opp.currentPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NAV: </span>
                          <span className="font-medium">₹{opp.inav.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                        {opp.recommendation}
                      </div>
                    </div>
                  ))}
                {arbitrageOpportunities.filter(o => o.type === 'discount').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                    No buy opportunities at the moment
                  </div>
                )}
              </div>

              {/* Sell Opportunities */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 rotate-180" />
                  Sell Opportunities (Premium to NAV)
                </h2>
                {arbitrageOpportunities
                  .filter(o => o.type === 'premium')
                  .map(opp => (
                    <div
                      key={opp.symbol}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">{opp.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{opp.name}</p>
                        </div>
                        <div className="text-red-600 font-bold">
                          +{opp.percent.toFixed(2)}% Premium
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Market: </span>
                          <span className="font-medium">₹{opp.currentPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NAV: </span>
                          <span className="font-medium">₹{opp.inav.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-800">
                        {opp.recommendation}
                      </div>
                    </div>
                  ))}
                {arbitrageOpportunities.filter(o => o.type === 'premium').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                    No sell opportunities at the moment
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="border-t pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              Data sourced from NSE India. Prices delayed by ~15 minutes.
            </div>
            <div className="flex items-center gap-4">
              <span>ETF Arbitrage Tracker</span>
              <span>•</span>
              <span>Built for Trading</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
