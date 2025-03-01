// Script para verificar se páginas estão sendo renderizadas estaticamente
const fs = require('fs');
const path = require('path');

// Função simples para colorir textos no console sem depender de chalk
function colorize(text, colorCode) {
  const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  return `${colors[colorCode] || ''}${text}${colors.reset}`;
}

console.log(colorize('==== Verificador de Renderização Next.js ====', 'blue'));

// Verificar se existe o diretório .next
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  console.log(colorize('❌ Diretório .next não encontrado. Execute `npm run dev` primeiro.', 'red'));
  process.exit(1);
}

// Verificar configuração do Next.js
let isExportConfigured = false;
const configPath = path.join(__dirname, 'next.config.js');
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  console.log(colorize('✓ next.config.js encontrado', 'green'));
  
  // Verificar se há output: 'export'
  if (configContent.includes("output: 'export'") || configContent.includes('output: "export"')) {
    console.log(colorize('⚠️ O projeto está configurado para exportação estática (output: \'export\')', 'yellow'));
    isExportConfigured = true;
  }
  
  // Verificar se há exportPathMap
  if (configContent.includes('exportPathMap')) {
    console.log(colorize('⚠️ O projeto usa exportPathMap, o que sugere exportação estática', 'yellow'));
    isExportConfigured = true;
  }
} catch (error) {
  console.log(colorize('⚠️ Não foi possível ler next.config.js', 'yellow'));
}

// Verificar se há páginas estáticas
const serverDir = path.join(nextDir, 'server');
const staticDir = path.join(nextDir, 'static');
let isStaticExport = false;

if (fs.existsSync(path.join(nextDir, 'export-marker.json'))) {
  console.log(colorize('⚠️ Exportação estática detectada (export-marker.json)', 'yellow'));
  isStaticExport = true;
}

// Verificar páginas
const pagesDir = path.join(__dirname, 'pages');
const htmlOutputDir = path.join(nextDir, 'server', 'pages');
const staticOutputDir = path.join(nextDir, 'static');

console.log(colorize('\nAnálise de Páginas:', 'blue'));

// Consegue identificar as páginas?
if (fs.existsSync(pagesDir)) {
  const pages = fs.readdirSync(pagesDir)
    .filter(file => /\.(js|jsx|ts|tsx)$/.test(file) && !file.startsWith('_'));
  
  console.log(colorize(`Páginas encontradas: ${pages.length}`, 'cyan'));
  
  pages.forEach(page => {
    const pageName = page.replace(/\.(js|jsx|ts|tsx)$/, '');
    const outputPath = path.join(htmlOutputDir, `${pageName}.html`);
    const staticOutputPath = path.join(staticOutputDir, 'pages', pageName, 'index.html');
    
    if (fs.existsSync(outputPath)) {
      console.log(colorize(`✓ ${pageName}: Renderizado pelo servidor`, 'green'));
    } else if (fs.existsSync(staticOutputPath)) {
      console.log(colorize(`⚠️ ${pageName}: Exportado estaticamente`, 'yellow'));
      isStaticExport = true;
    } else {
      console.log(colorize(`❓ ${pageName}: Método de renderização indeterminado`, 'yellow'));
    }
    
    // Verificar getStaticProps e getServerSideProps
    try {
      const content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
      
      if (content.includes('getStaticProps')) {
        console.log(colorize(`  → Usa getStaticProps (renderização estática)`, 'cyan'));
      }
      
      if (content.includes('getStaticPaths')) {
        console.log(colorize(`  → Usa getStaticPaths (rotas dinâmicas estáticas)`, 'cyan'));
      }
      
      if (content.includes('getServerSideProps')) {
        console.log(colorize(`  → Usa getServerSideProps (renderização no servidor)`, 'cyan'));
      }
    } catch (error) {
      console.log(colorize(`  → Não foi possível analisar o arquivo: ${error.message}`, 'red'));
    }
  });
} else {
  console.log(colorize('❌ Diretório pages/ não encontrado', 'red'));
}

console.log(colorize('\nVerificando hooks em uso:', 'blue'));
if (fs.existsSync(pagesDir)) {
  // Ler todos os arquivos em pages recursivamente
  const readFilesRecursively = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(readFilesRecursively(file));
      } else {
        if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          results.push(file);
        }
      }
    });
    return results;
  };
  
  const allFiles = readFilesRecursively(pagesDir);
  
  let usesUseEffect = false;
  let usesUseState = false;
  let usesUseRouter = false;
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('useEffect')) {
        usesUseEffect = true;
      }
      
      if (content.includes('useState')) {
        usesUseState = true;
      }
      
      if (content.includes('useRouter')) {
        usesUseRouter = true;
      }
    } catch (error) {
      // Ignore
    }
  });
  
  console.log(colorize(`useEffect: ${usesUseEffect ? '✓ Em uso' : '❌ Não usado'}`, usesUseEffect ? 'green' : 'yellow'));
  console.log(colorize(`useState: ${usesUseState ? '✓ Em uso' : '❌ Não usado'}`, usesUseState ? 'green' : 'yellow'));
  console.log(colorize(`useRouter: ${usesUseRouter ? '✓ Em uso' : '❌ Não usado'}`, usesUseRouter ? 'green' : 'yellow'));
  
  if (!usesUseEffect && !usesUseState) {
    console.log(colorize('⚠️ Nenhum hook de estado detectado, pode indicar componentes estáticos', 'yellow'));
  }
}

console.log(colorize('\nDiagnóstico:', 'blue'));
if (isExportConfigured || isStaticExport) {
  console.log(colorize('⚠️ Seu projeto está sendo renderizado como HTML estático!', 'yellow'));
  console.log(colorize('   Isso explica por que suas alterações não estão aparecendo.', 'yellow'));
  console.log(colorize('\nSoluções possíveis:', 'cyan'));
  console.log(colorize('1. Remova "output: \'export\'" do next.config.js', 'cyan'));
  console.log(colorize('2. Verifique se você está usando data fetching corretamente', 'cyan'));
  console.log(colorize('3. Adicione lógica do lado do cliente com hooks como useState/useEffect', 'cyan'));
  console.log(colorize('4. Execute `npm run clean && npm run dev` para reconstruir sem cache', 'cyan'));
} else {
  console.log(colorize('✓ Seu projeto parece estar configurado para renderização dinâmica', 'green'));
  console.log(colorize('\nSe ainda tiver problemas, verifique:', 'cyan'));
  console.log(colorize('1. O cache do navegador (Ctrl+F5)', 'cyan'));
  console.log(colorize('2. Se seus componentes estão usando hooks adequadamente', 'cyan'));
  console.log(colorize('3. Se há erros no console do navegador', 'cyan'));
}
