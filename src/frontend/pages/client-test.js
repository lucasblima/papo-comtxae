import { useState, useEffect } from 'react';

export default function ClientTest() {
  const [counter, setCounter] = useState(0);
  const [time, setTime] = useState('Carregando...');

  useEffect(() => {
    // Atualizar o tempo a cada segundo
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    // Exibir uma mensagem no console para verificar se o código está executando
    console.log('🔄 useEffect executado - Componente montado');
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      clearInterval(timer);
      console.log('🛑 useEffect limpeza - Componente desmontado');
    };
  }, []);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Teste de Renderização Client-Side</h1>
      
      <div style={{
        backgroundColor: '#f0f8ff',
        border: '2px solid #0070f3',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>
        <h2>Relógio em tempo real</h2>
        <p>Se o relógio abaixo estiver atualizando, significa que o JavaScript client-side está funcionando:</p>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: '#0070f3'
        }}>{time}</p>
      </div>

      <div style={{
        backgroundColor: '#f0fff4',
        border: '2px solid #38a169',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>
        <h2>Contador interativo</h2>
        <p>Valor atual: <strong>{counter}</strong></p>
        <div>
          <button 
            onClick={() => setCounter(prev => prev + 1)}
            style={{
              backgroundColor: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              cursor: 'pointer'
            }}
          >
            Incrementar
          </button>
          <button 
            onClick={() => setCounter(prev => prev - 1)}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              cursor: 'pointer'
            }}
          >
            Decrementar
          </button>
          <button 
            onClick={() => setCounter(0)}
            style={{
              backgroundColor: '#718096',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff5f5',
        border: '2px solid #e53e3e',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>
        <h2>Instruções para verificação</h2>
        <ol style={{ textAlign: 'left' }}>
          <li>Verifique se o relógio está atualizando a cada segundo</li>
          <li>Teste os botões do contador para confirmar a interatividade</li>
          <li>Abra o Console do navegador (F12) para ver mensagens de log</li>
          <li>Navegue para outra página e volte para testar a montagem/desmontagem</li>
        </ol>
      </div>
    </div>
  );
}
