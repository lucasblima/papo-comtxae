import { useState, useEffect } from 'react';

export default function TestInterface() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [clickCount, setClickCount] = useState(0);
  
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div style={{ 
      padding: "40px", 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "800px", 
      margin: "0 auto"
    }}>
      <h1 style={{ color: "#0070f3", textAlign: "center" }}>
        Interface de Teste Next.js
      </h1>
      
      <div style={{ 
        padding: "20px", 
        border: "1px solid #eaeaea", 
        borderRadius: "10px",
        marginTop: "20px",
        backgroundColor: "#f9f9f9" 
      }}>
        <p><strong>Hora atual:</strong> {currentTime}</p>
        <p><strong>Esta página foi criada para testar se novos componentes aparecem na interface.</strong></p>
        
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button 
            onClick={() => setClickCount(prev => prev + 1)}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Clique aqui para testar interatividade
          </button>
          
          <p style={{ marginTop: "10px" }}>
            Contador de cliques: <strong>{clickCount}</strong>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: "30px" }}>
        <h2>Guia de Diagnóstico</h2>
        <ol>
          <li>Se você consegue ver esta página, o Next.js está renderizando novos arquivos corretamente.</li>
          <li>Se o relógio estiver atualizando, o React está funcionando com hooks.</li>
          <li>Se o contador aumenta quando você clica no botão, a interatividade está funcionando.</li>
          <li>Se esta página aparece mas outras páginas que você criou não aparecem, verifique a estrutura de pastas e rotas.</li>
        </ol>
      </div>
      
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
        <h3>Informações Técnicas:</h3>
        <ul>
          <li>URL atual: <code>{typeof window !== 'undefined' ? window.location.href : 'SSR'}</code></li>
          <li>Renderização inicial: {typeof window === 'undefined' ? 'Servidor (SSR)' : 'Cliente (CSR)'}</li>
          <li>Hora do servidor: {new Date().toISOString()}</li>
        </ul>
      </div>
    </div>
  );
}
