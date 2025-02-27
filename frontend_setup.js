const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constantes
const FRONTEND_DIR = path.join(__dirname, 'src', 'frontend');
const COMPONENTS_DIR = path.join(FRONTEND_DIR, 'components');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');

// Função auxiliar para criar diretório se não existir
function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Diretório criado: ${dir}`);
  }
}

// Função para verificar e criar estrutura básica de diretórios
function createFolderStructure() {
  console.log('🔧 Criando estrutura de diretórios do frontend...');
  
  createDirIfNotExists(FRONTEND_DIR);
  createDirIfNotExists(COMPONENTS_DIR);
  createDirIfNotExists(PAGES_DIR);
}

// Função para criar package.json se não existir
function createPackageJson() {
  const packagePath = path.join(FRONTEND_DIR, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('📝 Criando package.json...');
    
    const packageJson = {
      "name": "papo-social-frontend",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      "dependencies": {
        "next": "^14.0.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "axios": "^1.6.0"
      },
      "devDependencies": {
        "typescript": "^5.0.0",
        "@types/react": "^18.2.0",
        "@types/node": "^20.0.0",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.0",
        "autoprefixer": "^10.4.0"
      }
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json criado');
  }
}

// Função para criar arquivo de configuração do Tailwind
function createTailwindConfig() {
  const configPath = path.join(FRONTEND_DIR, 'tailwind.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log('📝 Criando configuração do Tailwind CSS...');
    
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    
    fs.writeFileSync(configPath, tailwindConfig);
    console.log('✅ tailwind.config.js criado');
  }
}

// Função para criar arquivo PostCSS
function createPostCSSConfig() {
  const postcssPath = path.join(FRONTEND_DIR, 'postcss.config.js');
  
  if (!fs.existsSync(postcssPath)) {
    console.log('📝 Criando configuração do PostCSS...');
    
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    
    fs.writeFileSync(postcssPath, postcssConfig);
    console.log('✅ postcss.config.js criado');
  }
}

// Função para criar arquivo tsconfig.json
function createTSConfig() {
  const tsconfigPath = path.join(FRONTEND_DIR, 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log('📝 Criando configuração do TypeScript...');
    
    const tsConfig = {
      "compilerOptions": {
        "target": "es5",
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      "exclude": ["node_modules"]
    };
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
    console.log('✅ tsconfig.json criado');
  }
}

// Função para instalar dependências
function installDependencies() {
  if (!fs.existsSync(path.join(FRONTEND_DIR, 'node_modules'))) {
    console.log('📦 Instalando dependências do frontend...');
    
    try {
      process.chdir(FRONTEND_DIR);
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependências instaladas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao instalar dependências:', error.message);
    }
  } else {
    console.log('✅ Dependências já instaladas');
  }
}

// Função principal
function main() {
  console.log('🚀 Configurando ambiente do frontend...');
  
  createFolderStructure();
  createPackageJson();
  createTailwindConfig();
  createPostCSSConfig();
  createTSConfig();
  installDependencies();
  
  console.log('\n✨ Configuração do frontend concluída! ✨');
  console.log('\nPara iniciar o servidor de desenvolvimento:');
  console.log('  cd src/frontend');
  console.log('  npm run dev');
}

// Executar função principal
main();
