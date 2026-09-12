# FINFOLIO — Intelligent Financial Accountability & Resilience Platform

FINFOLIO is an enterprise-grade personal finance ecosystem and intelligence platform engineered to transform financial management from passive tracking into proactive resilience. By integrating deterministic financial planning, real-world macroeconomic benchmarks, machine-learning risk engines, and accountability protocols, FINFOLIO equips individuals and professionals to manage wealth, eliminate high-interest liabilities, forecast liquidity under emergency scenarios, and systematically achieve long-term financial independence.

---

## About FINFOLIO

FINFOLIO is a unified, multi-tiered financial command center designed to bridge the gap between static spreadsheet budgeting and intelligent algorithmic financial advisory. Rather than merely cataloging historical expenditures, FINFOLIO focuses on **financial resilience**: evaluating a user's runway under income disruption, calculating essential versus discretionary spend ratios, and simulating stress-tested asset allocations.

### Target Users
- **Salaried Professionals & Knowledge Workers**: Seeking structured savings discipline, loan affordability guidance, and tax optimization across progressive tax regimes.
- **Freelancers & Variable-Income Earners**: Requiring emergency buffer modeling, income variance analysis, and cash-flow stabilization.
- **Families & Goal-Driven Savers**: Managing concurrent financial goals (housing down payments, education funds, retirement reserves) with mathematical timeline milestones.
- **Accountability Partnerships**: Individuals benefiting from trusted peer commitment checks before high-value withdrawals or discretionary deviations occur.

### Core Objectives
1. **Centralize Disparate Financial Strands**: Aggregate cash, bank deposits, mutual fund SIPs, equity portfolios, and debt liabilities into a unified real-time balance sheet.
2. **Deliver Actionable Intelligence**: Replace generic financial platitudes with personalized mathematical recommendations powered by real macroeconomic benchmark datasets and scikit-learn predictive models.
3. **Foster Behavioral Accountability**: Leverage structured lock mechanisms and trusted partner notifications to protect emergency reserves from impulsive depletion.

---

## Problem Statement

Traditional personal financial management is fundamentally broken, plagued by systemic limitations:

1. **Fragmented Ecosystems**: Users juggle multiple disconnected banking apps, brokerage portals, and manual expense spreadsheets, creating blind spots in total net worth and debt exposure.
2. **Stagnant & Reactive Record-Keeping**: Most budgeting apps record transactions after money has already been spent, offering no predictive warning when savings rates fall below inflation or when debt-to-income ratios exceed safe thresholds.
3. **Lack of Scenario Stress-Testing**: Standard budgeting tools fail to simulate what happens during macroeconomic downturns, career layoffs, or sudden medical emergencies.
4. **Cognitive Overload & Information Asymmetry**: Complex tax code shifts, variable loan amortization tables, and diversified asset allocation formulas remain inaccessible without expensive professional wealth advisors.
5. **Absent Behavioral Commitments**: When financial friction is eliminated by instant digital credit and one-click withdrawals, emotional spending routinely cannibalizes long-term savings goals.

---

## Our Solution

FINFOLIO resolves financial fragmentation through an integrated full-stack architecture combining a Next.js Progressive Web App (PWA), a high-performance Express TypeScript backend, a scikit-learn/FastAPI machine learning engine, and a robust relational PostgreSQL database.

- **Unified Financial Command Center**: High-density KPI cards present Net Worth, Liquid Wallet Balance, Essential Runway Months, and Savings Discipline at a single glance.
- **Deterministic Mathematical Calculators**: Transparent, zero-hallucination mathematical models for goal trajectory forecasting, debt payoff prioritization (Avalanche vs. Snowball), and dual-regime tax optimization.
- **AI-Powered Predictive Risk Engines**: Dedicated machine-learning classifiers and regressors evaluating emergency survival probability, layoff exposure risk, and compound savings trajectory.
- **Behavioral Accountability Protocols**: Multi-signature withdrawal requests and commitment rules linking users with trusted accountability partners.
- **Local Persistence & Data Integrity**: ACID-compliant PostgreSQL relational storage ensuring that financial transactions, deposits, and target milestones survive across server restarts and application deployments.

---

## Traditional Methods vs FINFOLIO

| Aspect | Traditional Methods (Spreadsheets & Generic Apps) | FINFOLIO Intelligent Platform |
| :--- | :--- | :--- |
| **Financial Tracking** | Manual data entry into disconnected sheets; prone to stale formulas and human error. | Real-time automated ledger with dedicated wallet accounts, categorized transactions, and audit trails. |
| **Data Centralization** | Fragmented across 4–7 different banking, investment, and debt tracking portals. | Unified financial command center consolidating cash flow, investments, debts, and emergency funds. |
| **Goal Tracking** | Static balance targets lacking deadline math, inflation adjustment, or required monthly savings pacing. | Dynamic deterministic milestone engines computing required monthly contributions and on-track status. |
| **Budgeting** | Rigid monthly envelopes often abandoned within 90 days due to lack of behavioral incentives. | Flexible essential vs. discretionary ratio monitoring tied to real-world benchmark datasets. |
| **Investment Visibility** | Brokerage balances viewed in isolation without asset class balancing or risk tolerance alignment. | Multi-asset class visualization (SIP, equity, debt, gold) with age-weighted optimization algorithms. |
| **Debt Management** | Basic payment reminders that ignore total interest drag over the amortization lifecycle. | Automated Avalanche (highest interest rate) and Snowball (lowest balance) payoff comparative strategies. |
| **Financial Insights** | Generic retroactive monthly pie charts without economic context or benchmark comparisons. | Macroeconomic tier-based benchmarking against national data and AI-driven income variance signals. |
| **Risk Modeling** | Non-existent; assumes permanent uninterrupted income and static economic conditions. | ML-powered financial risk, career stability probability, and emergency survival runway engines. |
| **Decision Support** | Reactive guesswork or reliance on commissioned financial sales representatives. | Objective, algorithmic recommendations for loan affordability, tax deductions, and portfolio rebalancing. |
| **Behavioral Controls** | Frictionless withdrawals enabling impulsive discretionary diversion of emergency capital. | Built-in accountability rules, partner notifications, and structured withdrawal request approval workflows. |

---

## Key Features

### 1. Financial Command Center (Dashboard)
- **Real-Time Financial Metrics**: Top-level KPI cards computing Net Worth, Liquid Wallet Balance, Essential Expense Runway, and Monthly Savings Discipline.
- **Interactive Visualizations**: Interactive Area and Bar charts displaying income versus expenditure trends, savings velocity, and asset allocation distribution.
- **Actionable AI Highlights**: High-priority notices alerting users to high debt-service burdens or underfunded emergency reserves.

### 2. Digital Wallet & Transaction Ledger
- **Multi-Account Balance Tracking**: Maintain and monitor primary balances with full double-entry transaction histories.
- **Instant Deposits & Categorized Allocations**: Allocate funds toward general savings, emergency reserves, or discretionary accounts with automatic balance updates.
- **Complete Audit Trail**: Immutable transaction logs capturing timestamp, transaction category, status, and descriptive notes.

### 3. Deterministic Financial Goals Engine
- **Target Milestone Math**: Computes exact required monthly savings, remaining capital requirements, and projected completion dates.
- **Category & Priority Tagging**: Differentiates between High (Emergency, Healthcare), Medium (Housing, Education), and Low (Vacation, Luxury) goals.
- **On-Track Status Verification**: Evaluates current savings velocity against remaining calendar months to flag off-track goals before deadlines expire.

### 4. Machine Learning & Predictive Engines
- **FinancialRiskModel**: Multi-factor ensemble model (RandomForestRegressor with XGBoost architecture fallback) evaluating expense-to-income, debt-to-income, and liquidity ratios on a 0–100 scale.
- **LayoffRiskModel**: GradientBoostingClassifier estimating income shock exposure based on industry sector, tenure, company scale, and macroeconomic indicators.
- **SavingsProjectionModel**: Machine-learning regression model predicting compound wealth accumulation under variable market returns and inflation rates.
- **Survival Months Estimator**: Calculates exact survival duration if primary income streams cease abruptly.

### 5. Multi-Asset Portfolio Optimization
- **Asset Class Breakdown**: Visualizes distribution across Mutual Fund SIPs, Direct Equities, Government Bonds, Gold, and Liquid Cash.
- **Age-Weighted Lifecycle Models**: Recommends risk-adjusted rebalancing allocations utilizing multi-factor algorithms considering age, job stability, and market conditions.

### 6. Debt Management & Payoff Strategies
- **Debt Inventory & Amortization**: Aggregates personal loans, credit cards, mortgages, and vehicle loans with active interest rates and EMIs.
- **Avalanche vs. Snowball Modeling**: Simultaneously calculates total interest payable and debt-free calendar dates under both mathematical debt elimination methodologies.

### 7. Emergency Fund Planning & Runway
- **Runway Calculator**: Measures liquid cash against baseline essential expenditures to establish true survival runway.
- **Tier-Based Recommendations**: Guides users from foundational 3-month survival buffers toward comprehensive 6- to 12-month resilience cushions.

### 8. Tax Optimization & Deduction Engine
- **Old vs. New Tax Regime Comparison**: Detailed tax liability calculations under Indian Income Tax regulations (Section 87A rebate, standard deductions, 80C, 80D health insurance, 80CCD NPS, and HRA exemptions).
- **Net Take-Home Optimization**: Shows exactly which tax regime yields superior net annual cash retention.

### 9. Loan Recommendation & Affordability Analyzer
- **Debt-Service-to-Income (DSTI) Safeguards**: Evaluates proposed loan EMIs against net income to prevent overleveraging.
- **Interest Rate Sensitivity**: Simulates EMI variations across floating interest rate fluctuations.

### 10. Macroeconomic Benchmarking & Insights
- **National Dataset Integration**: Evaluates individual financial ratios against 4,000+ benchmark profiles across Tier 1, Tier 2, and Tier 3 cities.
- **Income Variance Profiling**: Detects seasonal income fluctuations to suggest dynamic buffer adjustments for non-salaried earners.

### 11. Accountability & Commitment Framework
- **Partner Pairing**: Connect with a spouse, financial advisor, or trusted peer for mutual commitment oversight.
- **Withdrawal Verification Requests**: Implement voluntary friction before withdrawing earmarked savings reserves.

### 12. Financial Education & Community
- **Curated Learning Modules**: Master fundamental financial literacy topics including emergency fund construction, inflation hedging, and tax efficiency.
- **Community Discussion Hub**: Exchange financial strategies, frugal living practices, and debt elimination tips.

---

## Perks / Benefits

- **Unified Financial Clarity**: Eliminates fragmented multi-app spreadsheets; one screen reveals your true liquid balance, net worth, and upcoming liabilities.
- **Disciplined Savings Habit**: Automated contribution milestones turn nebulous savings dreams into daily, tangible mathematical targets.
- **Reduced Anxiety During Emergencies**: Knowing your exact runway in months provides psychological security during career transitions or health shocks.
- **Maximized Annual Tax Savings**: Unambiguous side-by-side comparison between tax regimes ensures zero excess tax is paid to revenue authorities.
- **Interest Drag Elimination**: Systematically paying down debt via the Avalanche model can save tens of thousands of dollars in cumulative lifetime interest.
- **Privacy & Ownership**: Full control over your local financial data; no secret data brokering or aggressive third-party credit card ads.

---

## Uniqueness

What makes FINFOLIO fundamentally unique among personal finance platforms:

1. **Deterministic Logic Combined with Machine Learning**: Rather than utilizing LLMs for math (which hallucinate numbers), FINFOLIO enforces strict deterministic formulas for financial calculations, reserving scikit-learn ML models strictly for risk assessment and predictive analytics.
2. **Resilience First, Speculation Second**: While most platforms push speculative trading or stock-picking, FINFOLIO prioritizes runway security, emergency liquidity, and debt elimination.
3. **Macroeconomic Grounding**: Incorporates real economic data benchmarks (salary percentiles, living expense ratios across city tiers) to give realistic context to your financial health.
4. **Behavioral Friction Mechanism**: Unlike conventional banking where withdrawals are instant, FINFOLIO introduces optional accountability partner confirmations to curb impulse buying.
5. **Modern Semantic Theme Architecture**: Engineered with high-contrast, accessible financial palettes (Emerald for surplus, Rose for liabilities, Amber for caution) and tabular monospaced numbers to prevent numeral misalignment.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (Pages Router) | 16.1.6 | Universal React framework with static pre-rendering and client hydration |
| **UI Library & Design** | Material-UI (MUI) & Emotion | 7.3.7 / 11.14 | Accessible design system, theme tokens, modal dialogs, and responsive grids |
| **Styling & Icons** | Tailwind CSS & Lucide React | 3.4.19 / 0.562 | Utility classes, custom glassmorphic styling, and semantic fintech iconography |
| **Data Visualization** | Recharts | 3.7.0 | Responsive composable charting library for area, bar, pie, and radar graphs |
| **Backend Runtime** | Node.js (ESM Native) | 22.23.2 | Modern, high-performance JavaScript runtime with native ECMAScript Modules |
| **Backend Framework** | Express.js | 4.18.2 | RESTful HTTP API server with modular routing and JSON serialization |
| **Database** | PostgreSQL | 15 / 16 | ACID-compliant relational database with connection pooling via `pg` (node-postgres) |
| **Authentication** | JWT & Bcrypt | 9.0.2 / 5.1.1 | 4-digit PIN authentication with salt-hashed storage and signed bearer tokens |
| **Machine Learning Engine** | FastAPI & Uvicorn | 0.100+ / 0.22+ | Asynchronous Python microservice exposing high-speed AI inference endpoints |
| **AI / ML Algorithms** | Scikit-Learn, NumPy, Joblib | 1.3+ / 1.24+ | RandomForestRegressor, GradientBoostingClassifier, and StandardScaler models |
| **Progressive Web App** | next-pwa (Workbox) | 5.6.0 | Service worker generation, asset pre-caching, and offline PWA installability |
| **Testing Suite** | Vitest & Testing Library | 4.0.18 | Unit, integration, and API component testing across frontend and backend |
| **Process Orchestration**| Concurrently & TSX | 8.2.0 / 4.21 | Unified multi-service startup script (`npm start`) and TypeScript execution |

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Web & Mobile PWA)"]
        Browser["Next.js 16 Client (Port 3000)"]
        PWA["Service Worker & Manifest Cache"]
        Theme["FINFOLIO Semantic Theme Engine"]
    end

    subgraph Gateway ["API & Application Gateway"]
        Backend["Express TypeScript Backend (Port 3001)"]
        AuthMiddleware["Auth & Session Middleware (JWT + PIN)"]
        HealthEndpoint["Observability & Health Check (/health)"]
    end

    subgraph DataStorage ["Persistence Layer (PostgreSQL)"]
        PG[("PostgreSQL 15 Database (Port 5432)")]
        UsersTable["users & user_profiles"]
        WalletsTable["wallets & wallet_transactions"]
        GoalsTable["financial_goals & commitment_rules"]
    end

    subgraph Intelligence ["Machine Learning Service (Port 8000)"]
        FastAPI["FastAPI Engine"]
        RiskModel["FinancialRiskModel (RandomForest/XGBoost)"]
        LayoffModel["LayoffRiskModel (GradientBoosting)"]
        SavingsModel["SavingsProjectionModel (Regression)"]
    end

    Browser -->|HTTP/REST Requests| Backend
    PWA -.->|Offline Asset Cache| Browser
    Backend --> AuthMiddleware
    AuthMiddleware -->|Parameterized SQL Queries| PG
    Backend -->|Health & Telemetry| HealthEndpoint
    Backend -->|Async Feature Analysis| FastAPI
    FastAPI --> RiskModel
    FastAPI --> LayoffModel
    FastAPI --> SavingsModel
    PG --- UsersTable
    PG --- WalletsTable
    PG --- GoalsTable
```

---

## Project Structure

```
FINFOLIO/
├── frontend/                     # Next.js 16.1.6 Progressive Web Application
│   ├── public/                   # Static assets, PWA manifest.json, service worker, icons
│   │   ├── manifest.json         # PWA configuration and mobile icons
│   │   ├── logo.png              # FINFOLIO brand icon
│   │   └── sw.js                 # Workbox service worker
│   ├── src/
│   │   ├── components/           # UI components (Navigation, ThemeProvider, KPI cards)
│   │   ├── context/              # React AuthContext and state management
│   │   ├── pages/                # Next.js Pages Router (25 complete pages)
│   │   │   ├── _app.tsx          # App wrapper with ThemeProvider & AuthProvider
│   │   │   ├── _document.tsx     # HTML shell with Google Fonts & PWA meta tags
│   │   │   ├── index.tsx         # Landing page with interactive Resilience Preview
│   │   │   ├── dashboard.tsx     # Central financial command center
│   │   │   ├── wallet.tsx        # Digital wallet and deposit ledger
│   │   │   ├── goals.tsx         # Deterministic milestone goals engine
│   │   │   ├── budget-planner.tsx# Budget category allocations
│   │   │   ├── portfolio.tsx     # Multi-asset portfolio balancing
│   │   │   ├── debt-dashboard.tsx# Avalanche vs Snowball debt payoff
│   │   │   ├── emergency.tsx     # Emergency fund runway calculator
│   │   │   ├── tax-calculator.tsx# Dual-regime income tax optimization
│   │   │   ├── loan-recommendation.tsx # Loan affordability signals
│   │   │   ├── allocation.tsx    # Lifecycle asset allocation models
│   │   │   ├── assessment.tsx    # Comprehensive financial stress test
│   │   │   ├── insights.tsx      # Macroeconomic dataset benchmarks
│   │   │   ├── reports.tsx       # Exportable financial summaries
│   │   │   ├── education.tsx     # Financial literacy learning modules
│   │   │   ├── community.tsx     # Community discussions and tips
│   │   │   ├── settings.tsx      # Security, profile, and theme controls
│   │   │   ├── onboarding.tsx    # Guided new user onboarding flow
│   │   │   └── auth/             # Login and Register pages
│   │   ├── styles/               # globals.css, typography, tabular numerical styles
│   │   ├── test/                 # Frontend Vitest test suites (12 suites, 33 tests)
│   │   └── utils/                # Axios API client with bearer token interception
│   ├── package.json              # Frontend dependencies and build scripts
│   └── tsconfig.json             # TypeScript compiler configuration
│
├── backend-api/                  # Express.js TypeScript REST API (Port 3001)
│   ├── src/
│   │   ├── config/               # Database pool (db.ts), env vars (env.ts), cache config
│   │   ├── controllers/          # Controllers for auth, wallet, goals, finance, insights
│   │   ├── middleware/           # JWT verification, request logging, performance metrics
│   │   ├── models/               # Domain interfaces (Wallet, Accountability, Goals)
│   │   ├── routes/               # Modular Express routers (auth, wallet, goals, finance)
│   │   ├── scripts/              # setupDatabase.ts (migrations), seedDatabase.ts
│   │   ├── services/             # DatabaseService (PostgreSQL operations), AI services
│   │   ├── tests/                # Backend Vitest test suites (18 suites, 108 tests)
│   │   ├── app.ts                # Express application entrypoint and /health route
│   │   └── server.ts             # HTTP server listener
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Template environment configuration
│   ├── package.json              # Backend dependencies and scripts
│   └── tsconfig.json             # TypeScript ESM build configuration
│
├── ml-service/                   # FastAPI Machine Learning Service (Port 8000)
│   ├── app/
│   │   ├── core/                 # Risk scoring, survival algorithms, feature engineering
│   │   ├── models/               # Trained joblib model artifacts and scalers
│   │   ├── main.py               # FastAPI application with /risk-score & /predict endpoints
│   │   ├── models.py             # Scikit-learn model definitions (Risk, Layoff, Savings)
│   │   ├── schemas.py            # Pydantic validation request/response schemas
│   │   └── train.py              # Model training pipelines
│   └── requirements.txt          # Python dependencies (fastapi, scikit-learn, uvicorn)
│
├── database/                     # PostgreSQL Migrations and Seed Data
│   ├── migrations/               # 12 sequential SQL migration files
│   └── seed/                     # Seed datasets for local testing
│
├── scripts/                      # Operational Scripts
│   ├── start_all.sh              # Concurrent multi-service startup script
│   └── verify_localhost.sh       # Localhost end-to-end verification script
│
├── infra/                        # Infrastructure Configurations
│   ├── render.yaml               # Render Cloud deployment blueprint
│   └── nginx.conf                # Reverse proxy configuration
│
├── package.json                  # Root orchestration package.json
└── README.md                     # Comprehensive project documentation
```

---

## Web + App

### Implementation Reality & Clarification
FINFOLIO is architected and implemented as a **Progressive Web Application (PWA)** alongside a fully responsive modern web application.

- **Responsive Web Application**: Fully operational across desktop browsers, laptops, tablets, and mobile devices (tested across 320px, 375px, 390px, 414px, 768px, and 1280px+ viewports).
- **Progressive Web App (PWA)**: Implemented via `next-pwa` (Workbox) with `manifest.json`, service worker runtime caching (`/sw.js`), standalone window display mode (`display: "standalone"`), and application icons (`192x192`, `512x512`). It can be added directly to the home screen of Android (Chrome) and iOS (Safari) devices without an app store download.
- **Native Android & iOS Binaries (APK / IPA)**: **Not natively implemented** as separate Kotlin/Swift, React Native, or Flutter codebases in this repository. There are no fake mobile wrapper directories. The existing PWA provides native-like standalone app behavior, smooth transitions, offline asset caching, and touch-optimized financial interfaces.

---

## How FINFOLIO Works

The core user workflow proceeds seamlessly from initialization to ongoing financial resilience:

```
[1. User Registration & PIN Setup]
       │
       ▼
[2. Authenticated Session Creation (JWT Bearer Token)]
       │
       ▼
[3. Guided Onboarding (Monthly Income, Essential Spend, Liabilities)]
       │
       ▼
[4. Financial Health Analysis & Macroeconomic Benchmarking]
       │
       ▼
[5. Real-Time Command Center (Dashboard Net Worth & Runway Calculation)]
       │
       ▼
[6. Goal Setting & Automated Required Monthly Savings Calculation]
       │
       ▼
[7. Digital Wallet Funding & Categorized Ledger Tracking]
       │
       ▼
[8. ML Risk Evaluation (Emergency Survival & Layoff Probability)]
       │
       ▼
[9. Debt Elimination (Avalanche vs. Snowball Modeling) & Tax Optimization]
       │
       ▼
[10. Exportable Comprehensive Financial Health Reports]
```

---

## Installation

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (verified on Node.js `v22.23.2`)
- **Python**: `3.10` or higher
- **PostgreSQL**: `v14`, `v15`, or `v16`
- **Git**: For repository cloning

### Step 1: Clone Repository & Install Root Dependencies
```bash
git clone https://github.com/<your-org>/FINFOLIO.git
cd FINFOLIO
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 3: Install Backend Dependencies
```bash
cd backend-api
npm install
cd ..
```

### Step 4: Setup Python Virtual Environment & Install ML Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml-service/requirements.txt
```

---

## Database Setup

FINFOLIO requires PostgreSQL for persistent storage of users, profiles, wallets, transactions, and goals.

### 1. Create PostgreSQL Database
Connect to your local or remote PostgreSQL instance and create the database:
```sql
CREATE DATABASE finfolio;
```

### 2. Configure Environment Variables
Ensure `backend-api/.env` points to your PostgreSQL instance:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/finfolio
```
*(Note: If your password contains special characters like `@`, URL-encode them, e.g., `@` becomes `%40`)*.

### 3. Run Database Migrations
Execute the automated migration script from `backend-api`:
```bash
cd backend-api
npm run setup-db
```
This executes all 12 sequential schema migrations (`001_initial_schema.sql` through `009_partner_notifications.sql`), provisioning 27 relational tables with indexes and constraints.

---

## Environment Variables

### Backend Configuration (`backend-api/.env`)
```env
# Server
PORT=3001
NODE_ENV=development
API_VERSION=1.0.0
LOG_LEVEL=info

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/finfolio
DB_SSL=false

# Cache (Optional)
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your_secure_32_character_secret_key_here
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000
ML_MODEL_PATH=../ml-service/app/models

# CORS & Security
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FINFOLIO
```

---

## How to Run Locally

The entire multi-service stack can be launched concurrently with a single command from the project root:

```bash
npm start
```

This invokes `scripts/start_all.sh`, which automatically:
1. Compiles the TypeScript backend (`npm run build` in `backend-api`).
2. Checks the frontend Next.js production build (`npm run build` in `frontend`).
3. Detects the Python virtual environment with `uvicorn`.
4. Starts the Frontend on `http://localhost:3000`, the Backend on `http://localhost:3001`, and the ML Service on `http://localhost:8000`.

### Individual Service Commands
If you prefer running services in separate terminal windows:

```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend-api && npm run dev

# Terminal 3: ML Service
cd ml-service && ../.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Local URLs

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | Responsive Next.js Web App & PWA |
| **Backend REST API** | [http://localhost:3001](http://localhost:3001) | Express REST API |
| **Backend Health Check** | [http://localhost:3001/health](http://localhost:3001/health) | Real-time database & ML connectivity status |
| **ML Engine API** | [http://localhost:8000](http://localhost:8000) | FastAPI Machine Learning Engine |
| **ML Interactive Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive OpenAPI / Swagger UI |

---

## How to Use

1. **Access FINFOLIO**: Navigate to `http://localhost:3000` in your web browser.
2. **Register an Account**: Click **Create Account** or navigate to `/auth/register`. Enter your name, email, and choose a secure 4-digit PIN.
3. **Alternatively Try Guest Mode**: Click **Continue as Guest** on `/auth/login` to explore features instantly with pre-populated demo data.
4. **Complete Onboarding**: Visit `/onboarding` to enter your baseline monthly income, essential expenditures, and existing debt obligations.
5. **Review Financial Command Center**: Navigate to `/dashboard` to view your real-time Net Worth, Essential Runway Months, and Savings Discipline ratio.
6. **Deposit Funds**: Open `/wallet` to deposit savings and view categorized transaction histories.
7. **Create Milestones**: Go to `/goals` to establish a new goal (e.g., Emergency Reserve or Home Renovation) and view the required monthly contribution math.
8. **Optimize Debt & Taxes**: Use `/debt-dashboard` to compare Avalanche vs. Snowball payoff timelines, and `/tax-calculator` to determine your optimal tax regime.
9. **Inspect AI Insights**: Visit `/insights` to compare your financial health against macroeconomic benchmarks across Indian city tiers.
10. **Generate Reports**: Open `/reports` to view and export comprehensive financial health summaries.

---

## Testing

FINFOLIO maintains rigorous automated test suites across all tiers:

```bash
# Run all frontend tests (12 suites, 33 tests)
cd frontend && npm test

# Run all backend tests (18 suites, 108 tests)
cd backend-api && npm test

# Run full project tests from root
npm test
```

### Test Coverage Highlights
- **Financial Calculations**: Deterministic verification of required monthly savings, debt payoff interest, and tax liability formulas.
- **Authentication & Security**: Verification of PIN hashing, JWT issuance, token expiration, and route protection middleware.
- **Database & API Integration**: Endpoint testing for `/health`, `/api/goals`, `/api/wallet`, `/finance`, and `/api/insights`.
- **UI Component Rendering**: Accessibility, theme provider integration, error boundary handling, and responsive layouts.

---

## Security

- **PIN Authentication & Password Hashing**: Users authenticate with a 4-digit PIN salted and hashed using `bcrypt` (10 rounds) before storage in PostgreSQL.
- **Stateless Bearer Tokens**: JSON Web Tokens (JWT) signed using HMAC-SHA256 with strict expiration windows and automated refresh token support.
- **SQL Injection Prevention**: All database queries utilize parameterized SQL statements via the `pg` pool; zero dynamic string concatenations are permitted.
- **CORS Protection**: Cross-Origin Resource Sharing is strictly restricted to trusted frontend origins (`http://localhost:3000`).
- **Security Headers & Compression**: Built-in HTTP response compression and security headers mitigating cross-site scripting (XSS) and clickjacking risks.
- **Role-Based Feature Guards**: Sensitive financial operations (wallet deposits, withdrawals, goal modifications) require authenticated non-guest sessions.

---

## Deployment

### Render Cloud Deployment
The repository includes a ready-to-deploy Render blueprint at `infra/render.yaml`:
- **Web Service (`finfolio-frontend`)**: Node.js build (`cd frontend && npm install && npm run build`) serving the Next.js frontend.
- **Web Service (`finfolio-backend`)**: Node.js environment (`cd backend-api && npm install && npm run build`) running Express on port 10000.
- **Web Service (`finfolio-ml`)**: Python environment running FastAPI via Uvicorn.
- **Managed Database (`finfolio-db`)**: Managed PostgreSQL 15 database instance automatically provisioned and linked via environment variables.

### Reverse Proxy Configuration
An enterprise Nginx configuration template is provided at `infra/nginx.conf` supporting SSL termination, static file caching, and reverse proxying to ports 3000, 3001, and 8000.

---

## Screenshots & Local Demo

To conduct a live interactive demonstration:
1. Run `npm start` from the repository root.
2. Open Chrome or Safari and visit `http://localhost:3000`.
3. Open the browser Developer Tools (F12) to inspect clean console logs and verify zero CORS or hydration errors.
4. Toggle between Light Mode and Dark Mode using the sun/moon icon in the navigation bar to observe the theme-aware fintech color tokens.
5. In the Chrome URL bar, click the **Install App** icon to test the Progressive Web App standalone installation experience.

---

## Future Roadmap

### Implemented (Current Release)
- [x] Unified Financial Command Center with responsive KPI widgets
- [x] Full-stack PostgreSQL relational persistence with 27 schema tables
- [x] Deterministic milestone savings goals calculator
- [x] Digital wallet with deposits, withdrawals, and immutable transaction ledger
- [x] Machine learning risk scoring and layoff probability engine (FastAPI + Scikit-Learn)
- [x] Macroeconomic benchmark comparisons across 4,000 national financial profiles
- [x] Dual-regime income tax calculator (Old vs New tax regimes)
- [x] Avalanche and Snowball debt payoff comparative models
- [x] Progressive Web App (PWA) with service worker caching and manifest
- [x] Accessible fintech design system with Light/Dark mode toggles

### Planned (Future Enhancements)
- [ ] **Open Banking / Account Aggregator Integration**: Direct read-only synchronization with bank accounts via Plaid or RBI Account Aggregator framework.
- [ ] **Native Mobile Builds**: Standalone React Native or Flutter mobile apps for Apple App Store and Google Play Store distribution.
- [ ] **Automated Bank Statement OCR**: PDF and image bank statement parsing with automatic transaction classification.
- [ ] **Multi-Currency Support**: Real-time foreign exchange conversion across USD, INR, EUR, and GBP.
- [ ] **Exportable Tax Filing Documents**: Automated generation of pre-filled Form 16 / tax computation schedules.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
