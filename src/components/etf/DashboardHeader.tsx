import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, TrendingUp, TrendingDown, BarChart3, Activity, Settings } from 'lucide-react';
import type { DashboardStats } from '@/types/etf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardHeaderProps {
  stats: DashboardStats;
  lastUpdated: Date | null;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onRefresh: () => void;
}

export function DashboardHeader({ 
  stats, 
  lastUpdated, 
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh 
}: DashboardHeaderProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ETF Arbitrage Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track ETF premiums/discounts against i-NAV in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{formatTime(lastUpdated)}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Total Assets</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalAssets}</div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm">At Premium</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.premiumCount}</div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-sm">At Discount</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.discountCount}</div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm">Opportunities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              {stats.arbitrageOpportunities.filter(o => o.percent > 1).length}
            </div>
            {stats.arbitrageOpportunities.filter(o => o.percent > 1).length > 0 && (
              <Badge variant="default" className="text-xs animate-pulse">
                Active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Market Status & Refresh Settings */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">NSE Market Open</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span>Refresh:</span>
          </div>
          <Select 
            value={refreshInterval.toString()} 
            onValueChange={(v) => onRefreshIntervalChange(parseInt(v))}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1s</SelectItem>
              <SelectItem value="5000">5s</SelectItem>
              <SelectItem value="10000">10s</SelectItem>
              <SelectItem value="15000">15s</SelectItem>
              <SelectItem value="30000">30s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
