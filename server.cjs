const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// NSE session management - using axios instance with cookie jar
let nseCookies = '';
let lastCookieRefresh = 0;
const COOKIE_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes (more frequent refresh)

// Default ETF Configuration - All 22 assets
const ETF_CONFIG = {
  GOLDBEES: { symbol: 'GOLDBEES', name: 'Nippon India ETF Gold Bees', assetType: 'Gold' },
  SILVERBEES: { symbol: 'SILVERBEES', name: 'Nippon India Silver ETF', assetType: 'Silver' },
  NIFTYBEES: { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', assetType: 'Index' },
  JUNIORBEES: { symbol: 'JUNIORBEES', name: 'Nippon India ETF Junior BeES', assetType: 'Index' },
  CONSUMBEES: { symbol: 'CONSUMBEES', name: 'Nippon India ETF Consumption BeES', assetType: 'Equity' },
  AUTOBEES: { symbol: 'AUTOBEES', name: 'Nippon India ETF Auto BeES', assetType: 'Equity' },
  ITBEES: { symbol: 'ITBEES', name: 'Nippon India ETF IT BeES', assetType: 'Equity' },
  MON100: { symbol: 'MON100', name: 'Motilal Oswal Nasdaq 100 ETF', assetType: 'International' },
  HNGSNGBEES: { symbol: 'HNGSNGBEES', name: 'Nippon India ETF Hang Seng BeES', assetType: 'International' },
  PSUBNKBEES: { symbol: 'PSUBNKBEES', name: 'Nippon India ETF PSU Bank BeES', assetType: 'Equity' },
  FMCGIETF: { symbol: 'FMCGIETF', name: 'Nippon India ETF FMCG BeES', assetType: 'Equity' },
  INFRABEES: { symbol: 'INFRABEES', name: 'Nippon India ETF Infra BeES', assetType: 'Equity' },
  SILVERIETF: { symbol: 'SILVERIETF', name: 'ICICI Pru Silver ETF', assetType: 'Silver' },
  TATSILV: { symbol: 'TATSILV', name: 'Tata Silver ETF', assetType: 'Silver' },
  TATAGOLD: { symbol: 'TATAGOLD', name: 'Tata Gold ETF', assetType: 'Gold' },
  MAHKTECH: { symbol: 'MAHKTECH', name: 'Mahindra Manulife Tech ETF', assetType: 'Equity' },
  SILVERADD: { symbol: 'SILVERADD', name: 'Aditya Birla Silver ETF', assetType: 'Silver' },
  GROWWSLVR: { symbol: 'GROWWSLVR', name: 'Groww Silver ETF', assetType: 'Silver' },
  SBISILVER: { symbol: 'SBISILVER', name: 'SBI Silver ETF', assetType: 'Silver' },
  SILVERCASE: { symbol: 'SILVERCASE', name: 'SBI Silver ETF', assetType: 'Silver' },
  GROWWGOLD: { symbol: 'GROWWGOLD', name: 'Groww Gold ETF', assetType: 'Gold' },
  ESILVER: { symbol: 'ESILVER', name: 'Edelweiss Silver ETF', assetType: 'Silver' },
};

// Market Indices Configuration
const INDICES_CONFIG = {
  'NIFTY 50': { symbol: 'NIFTY%2050', name: 'Nifty 50', displayName: 'NIFTY 50' },
  'BANKNIFTY': { symbol: 'NIFTY%20BANK', name: 'Bank Nifty', displayName: 'BANKNIFTY' },
  'SENSEX': { symbol: 'SENSEX', name: 'Sensex', displayName: 'SENSEX' }
};

// Cache for storing fetched data
let cache = {
  etfs: {},
  indices: {},
  timestamp: {}
};

const CACHE_DURATION = 5000; // 5 seconds cache

// Force refresh NSE cookies
async function refreshNSECookies() {
  try {
    console.log('Refreshing NSE cookies...');
    const response = await axios.get('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
      maxRedirects: 5
    });
    
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      nseCookies = cookies.map(c => c.split(';')[0]).join('; ');
      lastCookieRefresh = Date.now();
      console.log('NSE cookies refreshed successfully');
      return true;
    }
  } catch (error) {
    console.error('Could not refresh NSE cookies:', error.message);
  }
  return false;
}

// Get NSE headers with cookies
async function getNSEHeaders(forceRefresh = false) {
  const now = Date.now();
  
  // Refresh cookies if needed
  if (forceRefresh || !nseCookies || (now - lastCookieRefresh) > COOKIE_REFRESH_INTERVAL) {
    await refreshNSECookies();
  }
  
  return {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nseindia.com/',
    'Cookie': nseCookies,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"'
  };
}

// Fetch ETF data from NSE API with retry logic
async function fetchNSEData(symbol, retryCount = 0) {
  const MAX_RETRIES = 2;
  
  try {
    const headers = await getNSEHeaders(retryCount > 0);
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
    
    console.log(`Fetching ${symbol} from NSE... (attempt ${retryCount + 1})`);
    
    const response = await axios.get(url, {
      headers,
      timeout: 20000,
      decompress: true,
      validateStatus: () => true // Accept all status codes
    });

    // Handle auth errors with retry
    if (response.status === 401 || response.status === 403) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Auth error for ${symbol}, refreshing cookies and retrying...`);
        nseCookies = '';
        return fetchNSEData(symbol, retryCount + 1);
      }
      throw new Error(`Authentication failed for ${symbol} after ${MAX_RETRIES + 1} attempts`);
    }

    if (response.status !== 200) {
      throw new Error(`NSE API returned status ${response.status} for ${symbol}`);
    }

    return parseNSEResponse(symbol, response.data);
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
      console.log(`Network error for ${symbol}, retrying...`);
      return fetchNSEData(symbol, retryCount + 1);
    }
    
    throw error;
  }
}

function parseNSEResponse(symbol, data) {
  if (!data || !data.priceInfo) {
    throw new Error(`Invalid data structure from NSE for ${symbol}`);
  }

  const priceInfo = data.priceInfo;
  const info = data.info || {};
  const securityInfo = data.securityInfo || {};
  
  const result = {
    symbol: symbol,
    name: info.companyName || securityInfo.companyName || ETF_CONFIG[symbol]?.name || symbol,
    assetType: ETF_CONFIG[symbol]?.assetType || 'Other',
    isin: info.isin || data.isinCode || '',
    currentPrice: priceInfo.lastPrice || priceInfo.close || 0,
    prevClose: priceInfo.previousClose || 0,
    open: priceInfo.open || 0,
    high: priceInfo.intraDayHighLow?.max || priceInfo.weekHighLow?.max || 0,
    low: priceInfo.intraDayHighLow?.min || priceInfo.weekHighLow?.min || 0,
    change: priceInfo.change || 0,
    changePercent: priceInfo.pChange || 0,
    volume: (data.preOpenMarket?.totalTradedVolume || data.marketDeptOrderBook?.tradeInfo?.totalTradedVolume || 0) / 100000,
    vwap: priceInfo.vwap || 0,
    timestamp: new Date().toISOString(),
    lastUpdateTime: data.metadata?.lastUpdateTime || null
  };

  // Add i-NAV if available (for ETFs)
  if (priceInfo.iNavValue) {
    result.inav = parseFloat(priceInfo.iNavValue);
    result.premiumDiscount = result.currentPrice - result.inav;
    result.premiumDiscountPercent = (result.premiumDiscount / result.inav) * 100;
  }

  return result;
}

// Fetch Market Index data
async function fetchIndexData(symbol, retryCount = 0) {
  const MAX_RETRIES = 2;
  
  try {
    const headers = await getNSEHeaders(retryCount > 0);
    const config = INDICES_CONFIG[symbol];
    
    // SENSEX requires BSE API which is different
    if (symbol === 'SENSEX') {
      // For now, we'll skip SENSEX as it requires BSE API
      throw new Error('SENSEX requires BSE API');
    }
    
    const url = `https://www.nseindia.com/api/equity-stockIndices?index=${config.symbol}`;
    
    console.log(`Fetching index ${symbol} from NSE...`);
    
    const response = await axios.get(url, {
      headers,
      timeout: 20000,
      decompress: true,
      validateStatus: () => true
    });

    if (response.status === 401 || response.status === 403) {
      if (retryCount < MAX_RETRIES) {
        nseCookies = '';
        return fetchIndexData(symbol, retryCount + 1);
      }
      throw new Error(`Authentication failed for index ${symbol}`);
    }

    if (response.status !== 200) {
      throw new Error(`NSE API returned status ${response.status} for index ${symbol}`);
    }

    const data = response.data;
    if (data && data.metadata) {
      return {
        symbol: symbol,
        name: config.name,
        price: data.metadata.last || data.metadata.close || 0,
        change: data.metadata.change || 0,
        changePercent: data.metadata.percChange || 0,
        timestamp: new Date().toISOString()
      };
    }
    
    throw new Error(`Invalid data structure from NSE for index ${symbol}`);
  } catch (error) {
    console.error(`Error fetching index ${symbol}:`, error.message);
    throw error;
  }
}

// API Routes

// Get all ETF data
app.get('/api/etfs', async (req, res) => {
  try {
    const symbols = Object.keys(ETF_CONFIG);
    const results = [];
    const errors = [];

    // Ensure cookies are fresh before bulk fetch
    await getNSEHeaders();

    // Fetch all ETFs with controlled concurrency (5 at a time to avoid rate limiting)
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (symbol) => {
        const now = Date.now();
        
        // Check cache first
        if (cache.etfs[symbol] && (now - cache.timestamp[symbol]) < CACHE_DURATION) {
          return { success: true, data: cache.etfs[symbol] };
        }

        try {
          const data = await fetchNSEData(symbol);
          cache.etfs[symbol] = data;
          cache.timestamp[symbol] = now;
          return { success: true, data };
        } catch (error) {
          console.error(`Failed to fetch ${symbol}:`, error.message);
          // Return cached data if available
          if (cache.etfs[symbol]) {
            return { success: true, data: { ...cache.etfs[symbol], stale: true } };
          }
          return { success: false, symbol, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({ symbol: result.symbol, error: result.error });
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/etfs:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific ETF data
app.get('/api/etfs/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();
  
  try {
    const now = Date.now();
    
    // Check cache first
    if (cache.etfs[upperSymbol] && (now - cache.timestamp[upperSymbol]) < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cache.etfs[upperSymbol],
        cached: true
      });
    }

    const data = await fetchNSEData(upperSymbol);
    cache.etfs[upperSymbol] = data;
    cache.timestamp[upperSymbol] = now;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error(`Error fetching ${upperSymbol}:`, error.message);
    
    // Return cached data if available
    if (cache.etfs[upperSymbol]) {
      return res.json({
        success: true,
        data: { ...cache.etfs[upperSymbol], stale: true },
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: `Failed to fetch data for ${upperSymbol}: ${error.message}`
    });
  }
});

// Get market indices
app.get('/api/indices', async (req, res) => {
  try {
    const symbols = Object.keys(INDICES_CONFIG);
    const results = [];
    const errors = [];

    for (const symbol of symbols) {
      try {
        const data = await fetchIndexData(symbol);
        results.push(data);
      } catch (error) {
        errors.push({ symbol, error: error.message });
      }
    }

    res.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/indices:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get ETF configuration
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    etfs: ETF_CONFIG,
    count: Object.keys(ETF_CONFIG).length
  });
});

// Add new ETF to config
app.post('/api/config', (req, res) => {
  const { symbol, name, assetType = 'Other' } = req.body;
  
  if (!symbol || !name) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: symbol, name'
    });
  }

  const upperSymbol = symbol.toUpperCase();
  
  ETF_CONFIG[upperSymbol] = {
    symbol: upperSymbol,
    name,
    assetType
  };

  res.json({
    success: true,
    message: `ETF ${upperSymbol} added successfully`,
    etf: ETF_CONFIG[upperSymbol]
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  // Test NSE connectivity
  let nseConnected = false;
  try {
    await getNSEHeaders(true);
    nseConnected = !!nseCookies;
  } catch (e) {
    nseConnected = false;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cachedAssets: Object.keys(cache.etfs),
    totalAssets: Object.keys(ETF_CONFIG).length,
    nseConnected,
    cookiesAge: lastCookieRefresh ? Math.round((Date.now() - lastCookieRefresh) / 1000) + 's' : 'none'
  });
});

// Refresh cookies manually
app.post('/api/refresh-cookies', async (req, res) => {
  const success = await refreshNSECookies();
  res.json({
    success,
    message: success ? 'Cookies refreshed successfully' : 'Failed to refresh cookies',
    timestamp: new Date().toISOString()
  });
});

// Initialize cookies on startup
refreshNSECookies().then(() => {
  console.log('Initial cookie refresh complete');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 NSE ETF Proxy Server running on port ${PORT}`);
  console.log(`📊 Loaded ${Object.keys(ETF_CONFIG).length} default ETFs`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`  GET  /api/etfs          - Get all ETF data (${Object.keys(ETF_CONFIG).length} assets)`);
  console.log(`  GET  /api/etfs/:symbol  - Get specific ETF data`);
  console.log(`  GET  /api/indices       - Get market indices (Nifty, BankNifty)`);
  console.log(`  GET  /api/config        - Get ETF configuration`);
  console.log(`  POST /api/config        - Add new ETF`);
  console.log(`  GET  /api/health        - Health check`);
  console.log(`  POST /api/refresh-cookies - Manually refresh NSE cookies`);
});

module.exports = { ETF_CONFIG, INDICES_CONFIG };
