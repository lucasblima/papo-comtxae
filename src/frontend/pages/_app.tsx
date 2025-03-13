import '../styles/globals.css';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { ToastProvider } from '../components/ui/Toast';
import { ThemeProvider } from '../components/ui/theme-provider';

// Load Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Custom App component that wraps the entire application
 * with the SessionProvider for authentication support
 */
export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="lemonade"
        enableSystem
        themes={["lemonade", "forest"]}
      >
        <ToastProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Papo Social - Uma plataforma por voz para conectar comunidades" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className={`${inter.variable} font-sans`}>
            <Component {...pageProps} />
          </main>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
