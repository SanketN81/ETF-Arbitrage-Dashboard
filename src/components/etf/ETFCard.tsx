import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Info, Heart, RotateCcw, DollarSign, BarChart3, Activity, Clock } from 'lucide-react';
import type { ETFData } from '@/types/etf';
import { cn } from '@/lib/utils';

interface ETFCardProps {
  etf: ETFData;
  isFavorite?: boolean;
  onFavoriteToggle?: (symbol: string) => void;
}

export function ETFCard({ etf, isFavorite = false, onFavoriteToggle }: ETFCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const isPremium = (etf.premiumDiscountPercent || 0) > 0;
  const isDiscount = (etf.premiumDiscountPercent || 0) < 0;
  const isSignificant = Math.abs(etf.premiumDiscountPercent || 0) > 1;

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '₹--';
    return `₹${price.toFixed(2)}`;
  };

  const formatPercent = (percent?: number) => {
    if (percent === undefined || percent === null) return '--%';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Get badge class based on discount/premium status
  const getBadgeClass = () => {
    const percent = Math.abs(etf.premiumDiscountPercent || 0);
    if (percent < 0.5) return 'badge-fair';
    // DISCOUNT = GREEN, PREMIUM = RED
    return isDiscount ? 'badge-discount' : 'badge-premium';
  };

  const getBadgeText = () => {
    const percent = Math.abs(etf.premiumDiscountPercent || 0);
    if (percent > 2) return isDiscount ? 'High Discount' : 'High Premium';
    if (percent > 1) return isDiscount ? 'Discount Opportunity' : 'Premium Alert';
    if (percent > 0.5) return isDiscount ? 'Slight Discount' : 'Slight Premium';
    return 'Fair Value';
  };

  const getRecommendation = () => {
    const percent = etf.premiumDiscountPercent || 0;
    if (percent < -2) return { text: 'STRONG BUY', color: 'bg-green-600 text-white' };
    if (percent < -1) return { text: 'BUY', color: 'bg-green-500 text-white' };
    if (percent > 2) return { text: 'STRONG SELL', color: 'bg-red-600 text-white' };
    if (percent > 1) return { text: 'SELL', color: 'bg-red-500 text-white' };
    return { text: 'HOLD', color: 'bg-gray-500 text-white' };
  };

  const recommendation = getRecommendation();

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(etf.symbol);
  };

  // Calculate price position in range (0-100%)
  const getPricePosition = () => {
    if (!etf.currentPrice || !etf.low || !etf.high || etf.high === etf.low) return 50;
    return ((etf.currentPrice - etf.low) / (etf.high - etf.low)) * 100;
  };

  return (
    <div className="card-flip-container etf-card" style={{ height: '320px' }}>
      <div className={cn("card-flip-inner", isFlipped && "flipped")}>
        {/* FRONT SIDE */}
        <Card className={cn(
          "card-front h-full flex flex-col",
          isSignificant && (isDiscount ? "border-green-400 border-2" : "border-red-400 border-2")
        )}>
          <CardContent className="p-4 flex flex-col h-full">
            {/* Header with Symbol, Name, and Action Buttons */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-foreground">{etf.symbol}</h3>
                  <Badge className={cn("text-xs px-2 py-0.5", getBadgeClass())}>
                    {getBadgeText()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{etf.name}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("favorite-btn h-8 w-8", isFavorite && "active")}
                  onClick={handleFavorite}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="info-btn h-8 w-8"
                  onClick={handleFlip}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">{formatPrice(etf.currentPrice)}</span>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                (etf.changePercent || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {(etf.changePercent || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercent(etf.changePercent)}
              </div>
            </div>

            {/* NAV Display */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">NAV:</span>
                <span className="font-semibold">{formatPrice(etf.inav)}</span>
              </div>
              <div className={cn(
                "font-semibold",
                isDiscount ? "text-green-600" : isPremium ? "text-red-600" : "text-gray-600"
              )}>
                {formatPercent(etf.premiumDiscountPercent)}
              </div>
            </div>

            {/* High/Low Range */}
            {(etf.low !== undefined && etf.high !== undefined) && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Low: {formatPrice(etf.low)}</span>
                  <span>High: {formatPrice(etf.high)}</span>
                </div>
                <div className="price-indicator">
                  <div
                    className="price-marker"
                    style={{
                      left: `${getPricePosition()}%`,
                      borderColor: (etf.changePercent || 0) >= 0 ? '#22c55e' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom: Recommendation */}
            <div className="pt-3 border-t flex items-center justify-between">
              <Badge className={cn("text-xs font-bold px-3 py-1", recommendation.color)}>
                {recommendation.text}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isDiscount
                  ? 'Buying opportunity'
                  : isPremium
                    ? 'Consider selling'
                    : 'Fair value'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* BACK SIDE */}
        <Card className="card-back h-full flex flex-col bg-slate-50">
          <CardContent className="p-4 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">{etf.symbol}</h3>
                <p className="text-xs text-muted-foreground">Additional Details</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlip}
                className="gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Back
              </Button>
            </div>

            {/* Detailed Data Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  Prev Close
                </div>
                <div className="font-semibold">{formatPrice(etf.prevClose)}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" />
                  Open
                </div>
                <div className="font-semibold">{formatPrice(etf.open)}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <BarChart3 className="w-3 h-3" />
                  Volume
                </div>
                <div className="font-semibold">
                  {etf.volume !== undefined ? `${(etf.volume / 100).toFixed(1)}L` : '--'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <DollarSign className="w-3 h-3" />
                  VWAP
                </div>
                <div className="font-semibold">{formatPrice(etf.vwap)}</div>
              </div>
            </div>

            {/* Premium/Discount Analysis */}
            <div className={cn(
              "p-3 rounded-lg mb-3",
              isDiscount ? "bg-green-100 text-green-800" : isPremium ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
            )}>
              <div className="text-sm font-medium mb-1">
                {isDiscount ? 'Discount Analysis' : isPremium ? 'Premium Analysis' : 'Fair Value'}
              </div>
              <div className="text-xs">
                {isDiscount
                  ? `Trading at ${formatPercent(Math.abs(etf.premiumDiscountPercent || 0))} discount to NAV. Consider buying for arbitrage opportunity.`
                  : isPremium
                    ? `Trading at ${formatPercent(etf.premiumDiscountPercent)} premium to NAV. Consider selling if you hold units.`
                    : 'Trading near fair value. No significant arbitrage opportunity at the moment.'
                }
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Asset Type */}
            <div className="pt-3 border-t">
              <span className="text-xs text-muted-foreground">Asset Type: </span>
              <Badge variant="secondary" className="text-xs">{etf.assetType}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ETFCard;
