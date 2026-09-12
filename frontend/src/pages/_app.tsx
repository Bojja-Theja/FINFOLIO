import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <Head>
            <title>FINFOLIO — Financial Accountability &amp; Resilience</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <meta name="description" content="FINFOLIO — Financial accountability, savings goals, and AI resilience platform" />
            <link rel="icon" type="image/png" href="/logo.png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

