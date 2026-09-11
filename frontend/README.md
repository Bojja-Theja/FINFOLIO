# 🚀 FINFOLIO Frontend - AI-Powered Finance Dashboard

A modern, responsive, and secure Next.js frontend for the FINFOLIO AI-Powered Personal Finance Platform. Built with TypeScript, Material-UI, and enterprise-grade security features.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.0+-0081CB.svg)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Key Features

### 🎨 User Interface & Experience
- **Modern Design** - Clean, intuitive Material-UI components
- **Responsive Layout** - Mobile-first design for all devices
- **Dark/Light Themes** - Accessibility-focused theme switching
- **Real-time Updates** - Live financial data and notifications
- **Interactive Dashboard** - Dynamic charts and visualizations

### 🔐 Security & Compliance
- **JWT Authentication** - Secure token-based authentication
- **Data Encryption** - Client-side sensitive data protection
- **XSS Protection** - Built-in security headers and validation
- **GDPR Compliant** - Privacy-focused design patterns

### 💰 Financial Features
- **Account Overview** - Comprehensive financial dashboard
- **Savings Management** - Automated savings tracking and goals
- **Transaction History** - Detailed transaction categorization
- **Financial Insights** - AI-powered financial recommendations
- **Risk Alerts** - Real-time fraud detection notifications

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 14+** - React framework with SSR/SSG capabilities
- **TypeScript 5.0+** - Type-safe JavaScript development
- **React 18+** - Modern React with concurrent features

### UI & Styling
- **Material-UI (MUI) 5.0+** - Premium React component library
- **Emotion** - CSS-in-JS styling solution
- **React Hook Form** - Form validation and management

### Data & State Management
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Lightweight client state management
- **Axios** - HTTP client with interceptors

### Development Tools
- **ESLint + Prettier** - Code quality and formatting
- **Husky + lint-staged** - Git hooks for code quality
- **Jest + React Testing Library** - Unit and integration testing

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── icons/                 # App icons and favicons
│   └── images/                # Static images
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Shared components
│   │   ├── forms/            # Form components
│   │   └── charts/           # Chart components
│   ├── pages/                # Next.js pages
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   └── dashboard/        # Dashboard pages
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles and themes
├── tests/                    # Test files
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0+ 
- **npm** 9.0+ or **yarn** 1.22+
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FINFOLIO.git
   cd FINFOLIO/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ML_URL=http://localhost:5000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# External Services
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 📱 Available Pages

### 🏠 Main Application
- **`/`** - Landing page and marketing
- **`/dashboard`** - Main financial dashboard
- **`/onboarding`** - User registration and setup
- **`/savings`** - Savings goals and management
- **`/insights`** - AI-powered financial insights

### 🔐 Authentication
- **`/auth/login`** - User login
- **`/auth/register`** - User registration
- **`/auth/forgot-password`** - Password recovery

### 📊 Analytics & Reports
- **`/analytics`** - Financial analytics
- **`/reports`** - Financial reports
- **`/settings`** - User preferences and settings

---

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run export       # Export static site

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run e2e          # Run end-to-end tests
```

---

## 🎨 Theme Customization

### Material-UI Theme Configuration
The app uses a customizable Material-UI theme. Modify `src/styles/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Theme Switching
The app supports light/dark theme switching with system preference detection.

---

## 🔒 Security Features

### Authentication Flow
1. **JWT Token-based** authentication
2. **Secure HTTP-only** cookies for session management
3. **CSRF protection** with double-submit cookies
4. **Rate limiting** on authentication endpoints

### Data Protection
- **Input validation** and sanitization
- **XSS protection** headers
- **Content Security Policy** (CSP)
- **Secure cookie** configuration

---

## 📊 Performance Optimization

### Code Splitting
- **Automatic route-based** code splitting
- **Component-level** lazy loading
- **Dynamic imports** for heavy components

### Caching Strategy
- **Next.js built-in** caching
- **Service worker** for offline support
- **Browser caching** optimization

### Bundle Optimization
- **Tree shaking** for unused code elimination
- **Minification** of CSS and JavaScript
- **Image optimization** with next/image

---

## 🧪 Testing

### Unit Tests
```bash
npm run test                # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

### Integration Tests
```bash
npm run test:integration   # Run integration tests
npm run test:e2e          # Run end-to-end tests
```

### Testing Components
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Cypress** for end-to-end testing
- **MSW** for API mocking

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t finfolio-frontend .

# Run container
docker run -p 3000:3000 finfolio-frontend
```

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

---

## 🔄 API Integration

### Backend API
The frontend integrates with the FINFOLIO backend API:

```typescript
// Example API call
import { apiClient } from '../services/apiClient';

const getUserData = async (userId: string) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### ML Service Integration
```typescript
// ML Service for financial insights
import { mlClient } from '../services/mlClient';

const getFinancialInsights = async (userData: UserData) => {
  const insights = await mlClient.post('/api/insights', userData);
  return insights.data;
};
```

---

## 🤝 Contributing Guidelines

### Code Standards
- Follow **TypeScript** best practices
- Use **Prettier** for code formatting
- Write **meaningful commit messages**
- Add **tests** for new features

### Pull Request Process
1. Create a feature branch from `develop`
2. Make your changes with tests
3. Run the test suite and ensure it passes
4. Submit a pull request with detailed description

---

## 📞 Support & Contact

### Development Team
- **Frontend Lead:** Shaik Shafi
- **UI/UX Designer:** [Contact team]
- **Technical Support:** [Create GitHub issue]

### Documentation
- **API Documentation:** [Backend API Docs](../backend-api/README.md)
- **Full Project Docs:** [Main Documentation](../docs/README.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

---

**🚀 Built with passion by Team Error 404**  
**📅 Last Updated:** January 2025  
**📱 Version:** 1.0.0

> *"Great user experiences are built with attention to detail, performance, and security."*