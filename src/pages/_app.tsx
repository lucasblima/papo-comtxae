import React from 'react';
import type { AppProps } from 'next/app';
import { ToastProvider } from '../frontend/components/providers/ToastProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
} 