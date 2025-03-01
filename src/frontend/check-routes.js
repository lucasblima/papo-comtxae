// Script para visualizar as rotas do Next.js
// Execute com: node check-routes.js

const fs = require('fs');
const path = require('path');

// Função simples para colorir textos no console sem depender de chalk
function colorize(text, colorCode) {
  const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
  };
  return `${colors[colorCode] || ''}${text}${colors.reset}`;
}

// Detectar se estamos usando Pages Router ou App Router
const isUsingAppRouter = fs.existsSync(path.join(__dirname, 'app'));
const baseDir = isUsingAppRouter ? path.join(__dirname, 'app') : path.join(__dirname, 'pages');

console.log(colorize('='.repeat(50), 'blue'));
console.log(colorize(`Detectado: ${isUsingAppRouter ? 'App Router' : 'Pages Router'}`, 'blue'));
console.log(colorize('='.repeat(50), 'blue'));

// Função para mapear diretórios recursivamente
function mapDirectory(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const currentPath = path.join(dir, entry.name);
    const routePath = path.join(basePath, entry.name.replace(/\.(js|jsx|ts|tsx)$/, ''));
    
    if (entry.isDirectory()) {
      // Skip diretórios especiais do Next.js
      if (['api', '_app', '_document', 'components', 'lib', 'styles', 'public'].includes(entry.name)) {
        console.log(colorize(`Diretório especial: ${entry.name} (não é uma rota)`, 'yellow'));
        return;
      }
      
      // Diretórios são subrotas
      console.log(colorize(`📁 ${routePath}`, 'green'));
      mapDirectory(currentPath, routePath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      // Arquivos que não são especiais do Next.js são rotas
      if (!['_app', '_document'].some(special => entry.name.startsWith(special))) {
        // No App Router, apenas arquivos page.js são rotas
        if (isUsingAppRouter && entry.name !== 'page.js' && 
            entry.name !== 'page.tsx' && entry.name !== 'route.js') {
          console.log(colorize(`${routePath} (${entry.name}) - Não é uma rota no App Router`, 'yellow'));
          return;
        }
        
        const routeFormatted = isUsingAppRouter ? 
          routePath.replace('/page', '') : 
          routePath === '/index' ? '/' : routePath;
        
        console.log(colorize(`🔗 ${routeFormatted}`, 'green'));
      }
    }
  });
}

try {
  console.log(colorize('\nRotas detectadas:', 'blue'));
  mapDirectory(baseDir);
  
  console.log(colorize('\nInformações adicionais:', 'blue'));
  
  // Verificar configuração do Next.js
  const configPath = path.join(__dirname, 'next.config.js');
  if (fs.existsSync(configPath)) {
    console.log(colorize('✓ next.config.js encontrado', 'green'));
  } else {
    console.log(colorize('⚠ next.config.js não encontrado - usando configuração padrão', 'yellow'));
  }
  
  // Verificar pasta .next
  const nextBuildPath = path.join(__dirname, '.next');
  if (fs.existsSync(nextBuildPath)) {
    console.log(colorize('✓ Pasta .next encontrada - a aplicação foi compilada', 'green'));
  } else {
    console.log(colorize('⚠ Pasta .next não encontrada - a aplicação não foi compilada', 'yellow'));
  }
  
  console.log(colorize('\nPara acessar as rotas, visite: http://localhost:3000/[rota]', 'blue'));
} catch (error) {
  console.error(colorize('Erro ao analisar as rotas:', 'red'), error);
}
