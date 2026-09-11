# FINFOLIO — Financial Resilience & Accountability Platform

> An accountability-based personal finance platform helping users build financial resilience through AI-driven insights, peer accountability, and real-world dataset benchmarking.

---

## 🚀 Quick Start

```bash
# Clone and install dependencies
git clone https://github.com/<your-org>/FINFOLIO.git
cd FINFOLIO
npm install                          # root deps (concurrently etc.)
cd frontend && npm install && cd ..
cd backend-api && npm install && cd ..

# Start frontend + backend together
npm start
```

| Service     | URL                         |
|-------------|-----------------------------|
| Frontend    | http://localhost:3000        |
| Backend API | http://localhost:3001        |
| ML Service  | http://localhost:8000 (opt) |

---

## 📦 Project Structure

```
FINFOLIO/
├── frontend/           Next.js 16 PWA (React, MUI, TypeScript)
├── backend-api/        Express 4 + TypeScript ESM API (port 3001)
├── ml-service/         FastAPI Python ML engine (port 8000, optional)
├── data/               6 real-world datasets (salary, turnover, stocks…)
├── scripts/
│   └── start_all.sh    Unified startup script
└── package.json        Root scripts (npm start / npm run dev)
```

---

## 🛠️ Available Scripts

| Command                    | Description                                           |
|----------------------------|-------------------------------------------------------|
| `npm start`                | Build backend, start frontend + backend (+ ML if available) |
| `npm run dev`              | Hot-reload dev mode for frontend + backend            |
| `npm run dev:frontend`     | Next.js dev server only                               |
| `npm run dev:backend`      | `tsx watch` backend dev server only                   |
| `npm run build`            | Production build for frontend + backend               |
| `npm run build:frontend`   | Next.js production build                              |
| `npm run build:backend`    | TypeScript compile (`tsc`)                            |
| `npm test`                 | Run all tests                                         |
| `npm run test:backend`     | Vitest (18 suites, 106 tests)                         |
| `npm run install:all`      | Install dependencies for all packages                 |

---

## 🗄️ Datasets

Six real-world financial datasets bundled under `data/`:

| Dataset | Description |
|---------|-------------|
| `salary_data/` | Software engineer salary by experience/location |
| `turnover_data/` | Employee turnover risk indicators |
| `stock_data/` | Historical stock market data |
| `benefits_data/` | Employee benefits benchmarks |
| `h1b_data/` | H-1B visa salary data for US tech workers |
| `indian_finance/` | Indian financial market benchmarks |

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` in `backend-api/` and fill in values:

```bash
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/finfolio
JWT_SECRET=your-secret-here
REDIS_ENABLED=false      # set true when Redis is running
SENTRY_DSN=              # optional
```

> **Note:** The app runs fully in-memory when PostgreSQL and Redis are unavailable — great for local development.

---

## 🧪 Tests

```bash
cd backend-api
npm test
# ✓ 18 test suites, 106 tests all passing
```

---

## 🏗️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 16, React, Material UI, TypeScript, PWA |
| Backend   | Node.js 22, Express 4, TypeScript ESM |
| ML        | Python 3, FastAPI, scikit-learn, XGBoost |
| Database  | PostgreSQL (optional) + in-memory fallback |
| Cache     | Redis (optional) + no-cache fallback |
| Testing   | Vitest (backend), Jest (frontend) |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a PR

---

## 📄 License

MIT
