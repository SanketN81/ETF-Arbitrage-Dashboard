# ETF Arbitrage Dashboard

A real-time dashboard to track Gold ETF (GOLDBEES) & Silver ETF (SILVERBEES) from the Indian Stock Market (NSE) and identify arbitrage opportunities by comparing market prices with i-NAV (Indicative NAV).

## Features

- **Real-time Price Tracking**: Live market prices from NSE India
- **i-NAV Comparison**: Compare market price vs indicative NAV
- **Arbitrage Detection**: Automatically identifies discount/premium opportunities
- **Visual Indicators**: Color-coded signals for buy/sell recommendations
- **Auto-refresh**: Data refreshes every 30 seconds
- **Extensible**: Add more ETFs/assets easily via the UI

## Current Assets

| Symbol | Name | Asset Type |
|--------|------|------------|
| GOLDBEES | Nippon India ETF Gold Bees | Gold |
| SILVERBEES | Nippon India Silver ETF | Silver |

## Arbitrage Strategy

### Buy Opportunity (Discount)
When Market Price < i-NAV, the ETF is trading at a discount. This is a potential buying opportunity.

**Example**: SILVERBEES at ₹317.98 vs i-NAV ₹327.07 = 2.78% discount

### Sell Opportunity (Premium)
When Market Price > i-NAV, the ETF is trading at a premium. Consider selling if you hold units.

**Example**: GOLDBEES at ₹131.80 vs i-NAV ₹131.13 = 0.51% premium

## How to Use

### Online Dashboard
The dashboard is deployed and accessible at: [Dashboard URL]

### Local Development

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation

1. Clone the repository
```bash
cd /mnt/okcomputer/output/app
```

2. Install dependencies
```bash
npm install
```

3. Start the backend proxy server (for NSE data scraping)
```bash
node server.js
```
The server will run on http://localhost:3001

4. Start the frontend development server
```bash
npm run dev
```
The dashboard will be available at http://localhost:5173

#### Production Build

1. Build the frontend
```bash
npm run build
```

2. Start the backend server
```bash
node server.js
```

3. Serve the `dist` folder using any static file server

## API Endpoints

The backend proxy provides the following endpoints:

- `GET /api/etfs` - Get all ETF data
- `GET /api/etfs/:symbol` - Get specific ETF data
- `GET /api/config` - Get ETF configuration
- `POST /api/config` - Add new ETF
- `GET /api/health` - Health check

## Adding New Assets

Click the "Add Asset" button in the dashboard and provide:
- **Symbol**: Stock symbol (e.g., SETFGOLD)
- **Name**: Full name of the ETF
- **Asset Type**: Gold, Silver, Equity, etc.
- **ISIN**: ISIN code (optional)
- **NSE URL**: URL to the NSE quote page

## Data Sources

- **NSE India**: https://www.nseindia.com
- Prices are delayed by ~15 minutes (as per NSE terms)

## Important Notes

1. **Scraping Limitations**: NSE India has anti-scraping measures. The backend proxy includes proper headers and caching to minimize requests.

2. **Data Accuracy**: Always verify prices on the official NSE website before making trading decisions.

3. **Arbitrage Risks**: 
   - Brokerage charges will eat into profits
   - Price movements during order execution
   - i-NAV updates may have slight delays
   - Market liquidity considerations

4. **Not Financial Advice**: This dashboard is for informational purposes only. Do your own research before trading.

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Cheerio (for scraping)
- **Deployment**: Static hosting with Node.js backend

## License

MIT License - Feel free to modify and distribute.

## Disclaimer

This tool is provided for educational and informational purposes only. Trading in securities involves risk. Past performance is not indicative of future results. Always consult with a qualified financial advisor before making investment decisions.
