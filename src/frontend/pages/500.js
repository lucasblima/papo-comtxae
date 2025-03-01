import React from 'react';

export default function Custom500() {
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
      <h1 style={{ fontSize: '8rem', margin: '0', color: '#ed8936' }}>500</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Erro interno do servidor</h2>
      <p style={{ maxWidth: '500px', textAlign: 'center', marginBottom: '2rem' }}>
        Algo deu errado no servidor. Estamos trabalhando para resolver isso o mais rápido possível.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginRight: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#ed8936',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Tentar novamente
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Voltar para a página inicial
      </button>
    </div>
  );
}
