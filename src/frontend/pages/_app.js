import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Obter o tema padrão das variáveis de ambiente
  const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light';
  
  return (
    <ErrorBoundary>
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme={defaultTheme}
        themes={[
          "light",
          "dark",
          "cupcake",
          "bumblebee",
          "emerald",
          "corporate",
          "synthwave",
          "retro",
          "cyberpunk",
          "valentine",
          "halloween",
          "garden",
          "forest",
          "aqua",
          "lofi",
          "pastel",
          "fantasy",
          "wireframe",
          "black",
          "luxury",
          "dracula",
          "cmyk",
          "autumn",
          "business",
          "acid",
          "lemonade",
          "night",
          "coffee",
          "winter",
          "dim",
          "nord",
          "sunset"
        ]}
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
