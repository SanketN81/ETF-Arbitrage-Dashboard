export interface ETFData {
  symbol: string;
  name: string;
  assetType: string;
  isin: string;
  currentPrice?: number;
  inav?: number;
  change?: number;
  changePercent?: number;
  premiumDiscount?: number;
  premiumDiscountPercent?: number;
  prevClose?: number;
  open?: number;
  high?: number;
  low?: number;
  vwap?: number;
  volume?: number;
  timestamp: string;
  stale?: boolean;
}

export interface ETFConfig {
  symbol: string;
  name: string;
  isin: string;
  assetType: string;
  nseUrl: string;
}

export interface ArbitrageOpportunity {
  symbol: string;
  name: string;
  type: 'premium' | 'discount';
  amount: number;
  percent: number;
  currentPrice: number;
  inav: number;
  recommendation: string;
}

export interface DashboardStats {
  totalAssets: number;
  premiumCount: number;
  discountCount: number;
  arbitrageOpportunities: ArbitrageOpportunity[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  cached?: boolean;
  error?: string;
}

export interface AssetType {
  id: string;
  name: string;
  icon: string;
  color: string;
}
