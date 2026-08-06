# QuantPulse — Algorithmic Trading Platform

QuantPulse is a high-performance backend API service designed for quantitative trading, real-time market data streaming, and automated price alert management.

## 🚀 Features (Phase 1)

- **Express.js API Server**: Integrated with `helmet` security headers, CORS protection, and `morgan` HTTP logging.
- **Standardized API Response Utility**: Unified JSON payload structure for all endpoints (`success`, `data`, `message`, `meta`, `errors`).
- **Stock Market Data Endpoints**:
  - `GET /health`: Server health check including API version.
  - `GET /api/v1/stocks`: Stock listings with optional sorting query parameters (`sort=price&order=desc`).
  - `GET /api/v1/stocks/:symbol`: Stock quote details for a specific ticker symbol.
  - `POST /api/v1/alerts`: Price alert creation with input validation.
- **Graceful Error Handling**: Custom 404 handler and global error processing middleware.

## 📦 Getting Started

### Prerequisites
- Node.js v20+
- npm v10+

### Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API server will be available at `http://localhost:5000`.

## 🧪 Testing API Endpoints

- **Health Check**: `GET http://localhost:5000/health`
- **List Stocks**: `GET http://localhost:5000/api/v1/stocks`
- **Sorted Stocks**: `GET http://localhost:5000/api/v1/stocks?sort=price&order=desc`
- **Stock Quote**: `GET http://localhost:5000/api/v1/stocks/AAPL`
- **Create Alert**: `POST http://localhost:5000/api/v1/alerts` with body `{"symbol": "AAPL", "targetPrice": 200, "condition": "above"}`
