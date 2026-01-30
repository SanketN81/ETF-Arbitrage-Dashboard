import type { ETFData, ApiResponse } from '@/types/etf';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Default assets list - all 22 ETFs
export const DEFAULT_ASSETS = [
  { symbol: 'GOLDBEES', name: 'Nippon India ETF Gold Bees', assetType: 'Gold' },
  { symbol: 'SILVERBEES', name: 'Nippon India Silver ETF', assetType: 'Silver' },
  { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', assetType: 'Index' },
  { symbol: 'JUNIORBEES', name: 'Nippon India ETF Junior BeES', assetType: 'Index' },
  { symbol: 'CONSUMBEES', name: 'Nippon India ETF Consumption BeES', assetType: 'Equity' },
  { symbol: 'AUTOBEES', name: 'Nippon India ETF Auto BeES', assetType: 'Equity' },
  { symbol: 'ITBEES', name: 'Nippon India ETF IT BeES', assetType: 'Equity' },
  { symbol: 'MON100', name: 'Motilal Oswal Nasdaq 100 ETF', assetType: 'International' },
  { symbol: 'HNGSNGBEES', name: 'Nippon India ETF Hang Seng BeES', assetType: 'International' },
  { symbol: 'PSUBNKBEES', name: 'Nippon India ETF PSU Bank BeES', assetType: 'Equity' },
  { symbol: 'FMCGIETF', name: 'Nippon India ETF FMCG BeES', assetType: 'Equity' },
  { symbol: 'INFRABEES', name: 'Nippon India ETF Infra BeES', assetType: 'Equity' },
  { symbol: 'SILVERIETF', name: 'ICICI Pru Silver ETF', assetType: 'Silver' },
  { symbol: 'TATSILV', name: 'Tata Silver ETF', assetType: 'Silver' },
  { symbol: 'TATAGOLD', name: 'Tata Gold ETF', assetType: 'Gold' },
  { symbol: 'MAHKTECH', name: 'Mahindra Manulife Tech ETF', assetType: 'Equity' },
  { symbol: 'SILVERADD', name: 'Aditya Birla Silver ETF', assetType: 'Silver' },
  { symbol: 'GROWWSLVR', name: 'Groww Silver ETF', assetType: 'Silver' },
  { symbol: 'SBISILVER', name: 'SBI Silver ETF', assetType: 'Silver' },
  { symbol: 'SILVERCASE', name: 'SBI Silver ETF', assetType: 'Silver' },
  { symbol: 'GROWWGOLD', name: 'Groww Gold ETF', assetType: 'Gold' },
  { symbol: 'ESILVER', name: 'Edelweiss Silver ETF', assetType: 'Silver' },
];

// Market indices
export const MARKET_INDICES = [
  { symbol: 'NIFTY 50', name: 'Nifty 50', displayName: 'NIFTY 50' },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', displayName: 'BANKNIFTY' },
  { symbol: 'SENSEX', name: 'Sensex', displayName: 'SENSEX' },
];

class ETFApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAllETFs(): Promise<ApiResponse<ETFData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/etfs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch ETF data');
      }

      return data;
    } catch (error) {
      console.error('Error fetching ETFs:', error);
      throw error;
    }
  }

  async getETF(symbol: string): Promise<ApiResponse<ETFData>> {
    try {
      const response = await fetch(`${this.baseUrl}/etfs/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol}: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch ${symbol}`);
      }
      return data;
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      throw error;
    }
  }

  async getMarketIndices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/indices`);
      if (!response.ok) {
        throw new Error('Failed to fetch indices');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching indices:', error);
      throw error;
    }
  }

  async addETF(symbol: string, name: string, assetType: string = 'Other'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), name, assetType })
      });
      if (!response.ok) throw new Error('Failed to add ETF');
      return await response.json();
    } catch (error) {
      console.error('Error adding ETF:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; nseConnected?: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }

  async refreshCookies(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh-cookies`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Failed to refresh cookies' };
    }
  }
}

export const apiService = new ETFApiService();
export default apiService;

