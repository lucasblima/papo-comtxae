import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f7fafc',
      color: '#2d3748'
    }}>
      <h1 style={{ fontSize: '8rem', margin: '0', color: '#4299e1' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Página não encontrada</h2>
      <p style={{ maxWidth: '500px', textAlign: 'center', marginBottom: '2rem' }}>
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link 
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4299e1',
          color: 'white',
          borderRadius: '0.375rem',
          textDecoration: 'none'
        }}
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
