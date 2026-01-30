import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, AlertCircle, Target, ArrowRight } from 'lucide-react';
import type { ArbitrageOpportunity } from '@/types/etf';
import { cn } from '@/lib/utils';

interface ArbitragePanelProps {
  opportunities: ArbitrageOpportunity[];
}

export function ArbitragePanel({ opportunities }: ArbitragePanelProps) {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent.toFixed(2)}%`;

  const getPriorityColor = (type: 'discount' | 'premium', percent: number) => {
    // DISCOUNT = GREEN shades, PREMIUM = RED shades
    if (type === 'discount') {
      if (percent > 2) return 'bg-green-600';
      if (percent > 1) return 'bg-green-500';
      return 'bg-green-400';
    } else {
      if (percent > 2) return 'bg-red-600';
      if (percent > 1) return 'bg-red-500';
      return 'bg-red-400';
    }
  };

  const getPriorityText = (percent: number) => {
    if (percent > 2) return 'High Priority';
    if (percent > 1) return 'Medium';
    if (percent > 0.5) return 'Low';
    return 'Minimal';
  };

  return (
    <Card className="arbitrage-panel h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Arbitrage Opportunities</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono">
            {opportunities.length} Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time premium/discount analysis for ETF arbitrage
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {opportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No significant arbitrage opportunities at the moment.</p>
                <p className="text-sm">Check back during market hours.</p>
              </div>
            ) : (
              opportunities.map((opp, index) => (
                <div
                  key={opp.symbol}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                    // DISCOUNT = GREEN, PREMIUM = RED
                    opp.type === 'discount'
                      ? "bg-green-50 border-green-200 hover:border-green-300"
                      : "bg-red-50 border-red-200 hover:border-red-300",
                    index === 0 && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{opp.symbol}</span>
                        <Badge
                          className={cn(
                            "text-white text-xs",
                            getPriorityColor(opp.type, opp.percent)
                          )}
                        >
                          {getPriorityText(opp.percent)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {opp.name}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 font-bold ml-2 flex-shrink-0",
                      opp.type === 'discount' ? "text-green-600" : "text-red-600"
                    )}>
                      {opp.type === 'discount' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      {formatPercent(opp.percent)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Market Price</span>
                      <div className="font-semibold text-sm">{formatPrice(opp.currentPrice)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">i-NAV</span>
                      <div className="font-semibold text-sm">{formatPrice(opp.inav)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className={cn(
                      "text-sm font-medium",
                      opp.type === 'discount' ? "text-green-700" : "text-red-700"
                    )}>
                      {opp.type === 'discount' ? (
                        <span className="flex items-center gap-1">
                          Buy Opportunity <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          Sell Opportunity <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Diff: {formatPrice(opp.amount)}
                    </div>
                  </div>

                  <div className={cn(
                    "mt-2 text-xs p-2 rounded",
                    opp.type === 'discount'
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {opp.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        {opportunities.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {opportunities.filter(o => o.type === 'discount').length}
              </div>
              <div className="text-xs text-muted-foreground">Buy Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {opportunities.filter(o => o.type === 'premium').length}
              </div>
              <div className="text-xs text-muted-foreground">Sell Opportunities</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ArbitragePanel;
