// ESM version of the check-routes script that uses chalk
// Execute with: node check-routes-esm.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectar se estamos usando Pages Router ou App Router
const isUsingAppRouter = fs.existsSync(path.join(__dirname, 'app'));
const baseDir = isUsingAppRouter ? path.join(__dirname, 'app') : path.join(__dirname, 'pages');

console.log(chalk.blue('='.repeat(50)));
console.log(chalk.blue(`Detectado: ${isUsingAppRouter ? 'App Router' : 'Pages Router'}`));
console.log(chalk.blue('='.repeat(50)));

// Função para mapear diretórios recursivamente
function mapDirectory(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const currentPath = path.join(dir, entry.name);
    const routePath = path.join(basePath, entry.name.replace(/\.(js|jsx|ts|tsx)$/, ''));
    
    if (entry.isDirectory()) {
      // Skip diretórios especiais do Next.js
      if (['api', '_app', '_document', 'components', 'lib', 'styles', 'public'].includes(entry.name)) {
        console.log(chalk.yellow(`Diretório especial: ${entry.name} (não é uma rota)`));
        return;
      }
      
      // Diretórios são subrotas
      console.log(chalk.green(`📁 ${routePath}`));
      mapDirectory(currentPath, routePath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      // Arquivos que não são especiais do Next.js são rotas
      if (!['_app', '_document'].some(special => entry.name.startsWith(special))) {
        // No App Router, apenas arquivos page.js são rotas
        if (isUsingAppRouter && entry.name !== 'page.js' && 
            entry.name !== 'page.tsx' && entry.name !== 'route.js') {
          console.log(chalk.yellow(`${routePath} (${entry.name}) - Não é uma rota no App Router`));
          return;
        }
        
        const routeFormatted = isUsingAppRouter ? 
          routePath.replace('/page', '') : 
          routePath === '/index' ? '/' : routePath;
        
        console.log(chalk.green(`🔗 ${routeFormatted}`));
      }
    }
  });
}

try {
  console.log(chalk.blue('\nRotas detectadas:'));
  mapDirectory(baseDir);
  
  console.log(chalk.blue('\nInformações adicionais:'));
  
  // Verificar configuração do Next.js
  const configPath = path.join(__dirname, 'next.config.js');
  if (fs.existsSync(configPath)) {
    console.log(chalk.green('✓ next.config.js encontrado'));
  } else {
    console.log(chalk.yellow('⚠ next.config.js não encontrado - usando configuração padrão'));
  }
  
  // Verificar pasta .next
  const nextBuildPath = path.join(__dirname, '.next');
  if (fs.existsSync(nextBuildPath)) {
    console.log(chalk.green('✓ Pasta .next encontrada - a aplicação foi compilada'));
  } else {
    console.log(chalk.yellow('⚠ Pasta .next não encontrada - a aplicação não foi compilada'));
  }
  
  console.log(chalk.blue('\nPara acessar as rotas, visite: http://localhost:3000/[rota]'));
} catch (error) {
  console.error(chalk.red('Erro ao analisar as rotas:'), error);
}
