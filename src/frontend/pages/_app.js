import '../styles/globals.css';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';

// Load Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Papo Social - Uma plataforma por voz para conectar comunidades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
