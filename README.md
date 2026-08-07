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

# 📈 QuantPulse — Algorithmic Trading Intelligence Platform
## Phase 2: Routing Architecture & Controller Pattern (Complete)
QuantPulse is a modular, high-performance backtesting and portfolio intelligence platform. This repository contains the backend codebase structured using a professional three-layer architecture (Routes, Controllers, Services) designed for horizontal scaling and robust reliability.
---
## 🏗 Current Architecture Overview
We have migrated from a monolithic script to a clean **Separation of Concerns (SoC)** model:
```
    HTTP Client (Postman / Browser)
                 │
                 ▼
         [ Routes Layer ]          <-- Path routing & Zod validation middleware
                 │
                 ▼
       [ Controllers Layer ]       <-- Express req/res handling & HTTP status parsing
                 │
                 ▼
        [ Services Layer ]         <-- Pure business logic (currently using in-memory stores)
```
- **Configuration**: Centralized and validated at boot time via `src/config/index.js`.
- **Validation**: Schema-driven request body/param validation using **Zod**.
- **Error Handling**: Custom `AppError` operational error classes managed by a centralized Express error handler.
- **Async Safety**: High-order `asyncHandler` wrapper preventing uncaught Promise rejections.
---
## 📂 Project Structure
```
backend/
├── .env.example                # Deployment environment template
├── package.json
└── src/
    ├── server.js               # Entry point (bootstrapping, global middleware)
    ├── config/
    │   └── index.js            # Environment config validator
    ├── middleware/
    │   └── validate.js         # Generic Zod validation factory
    ├── schemas/
    │   ├── alerts.schema.js    # Data verification shapes
    │   └── watchlists.schema.js
    ├── routes/
    │   ├── index.js            # API v1 Router multiplexer
    │   ├── stocks.routes.js    # Stock feeds
    │   ├── alerts.routes.js    # Price alerts
    │   └── watchlists.routes.js# User watchlists (Exercise 1)
    ├── controllers/
    │   ├── stocks.controller.js
