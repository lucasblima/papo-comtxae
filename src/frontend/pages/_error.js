import React from 'react';

function Error({ statusCode }) {
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
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {statusCode 
          ? `Erro ${statusCode} - Ocorreu um problema no servidor`
          : 'Erro - Ocorreu um problema no cliente'}
      </h1>
      <p>Desculpe pelo inconveniente. Estamos trabalhando para resolver isso.</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '2rem',
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
