#!/usr/bin/env python3
import os
import platform
import subprocess
import sys
from pathlib import Path

def create_directory_if_not_exists(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def create_venv():
    """Cria um ambiente virtual Python"""
    print("🔧 Criando ambiente virtual Python...")
    
    # Determinar comando com base no sistema operacional
    if platform.system() == "Windows":
        venv_command = [sys.executable, "-m", "venv", "venv"]
    else:
        venv_command = ["python3", "-m", "venv", "venv"]
    
    try:
        subprocess.run(venv_command, check=True)
        print("✅ Ambiente virtual criado com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao criar ambiente virtual: {e}")
        sys.exit(1)

def setup_backend():
    """Configura o backend Python"""
    print("🔧 Configurando backend...")
    
    # Determinar o ativador do venv com base no SO
    if platform.system() == "Windows":
        pip_cmd = [os.path.join("venv", "Scripts", "pip")]
    else:
        pip_cmd = [os.path.join("venv", "bin", "pip")]
    
    # Garantir estrutura de diretórios
    create_directory_if_not_exists("src/backend/config")
    create_directory_if_not_exists("src/backend/models")
    create_directory_if_not_exists("src/backend/scripts")
    
    # Atualizar pip
    try:
        subprocess.run([*pip_cmd, "install", "--upgrade", "pip"], check=True)
        
        # Instalar requisitos
        backend_reqs = os.path.join("src", "backend", "requirements.txt")
        if os.path.exists(backend_reqs):
            subprocess.run([*pip_cmd, "install", "-r", backend_reqs], check=True)
            print("✅ Dependências Python instaladas!")
        else:
            print("❌ Arquivo requirements.txt não encontrado!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")

def setup_frontend():
    """Verifica se Node.js está instalado e prepara o frontend"""
    print("🔧 Verificando configuração do frontend...")
    
    try:
        # Verificar se Node.js está instalado
        node_version = subprocess.run(["node", "--version"], 
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE,
                                     text=True)
        
        if node_version.returncode == 0:
            print(f"✅ Node.js detectado: {node_version.stdout.strip()}")
            
            # Criar estrutura de diretórios do frontend se necessário
            create_directory_if_not_exists("src/frontend/components")
            create_directory_if_not_exists("src/frontend/pages")
            
            # Se package.json existir, instalar dependências
            if os.path.exists("src/frontend/package.json"):
                print("📦 Instalando dependências do frontend...")
                os.chdir("src/frontend")
                subprocess.run(["npm", "install"], check=True)
                os.chdir("../..")
                print("✅ Dependências do frontend instaladas!")
            else:
                print("ℹ️ Não foi encontrado package.json. Pule a instalação do frontend.")
        else:
            print("❌ Node.js não encontrado. Por favor, instale Node.js para executar o frontend.")
    except Exception as e:
        print(f"❌ Erro ao configurar frontend: {e}")

def create_package_json():
    """Cria um arquivo package.json básico para o frontend se não existir"""
    package_path = os.path.join("src", "frontend", "package.json")
    
    if not os.path.exists(package_path):
        print("📝 Criando package.json para o frontend...")
        create_directory_if_not_exists("src/frontend")
        
        package_content = {
            "name": "papo-social-frontend",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start"
            },
            "dependencies": {
                "next": "^14.0.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "axios": "^1.6.0",
                "tailwindcss": "^3.3.0",
                "postcss": "^8.4.0",
                "autoprefixer": "^10.4.0"
            },
            "devDependencies": {
                "typescript": "^5.0.0",
                "@types/react": "^18.2.0",
                "@types/node": "^20.0.0"
            }
        }
        
        import json
        with open(package_path, 'w') as f:
            json.dump(package_content, f, indent=2)
        
        print("✅ package.json criado!")

def main():
    """Função principal para configurar o ambiente de desenvolvimento"""
    print("🚀 Configurando ambiente de desenvolvimento para Papo Social...")
    
    # Criar ambiente virtual Python
    create_venv()
    
    # Configurar backend
    setup_backend()
    
    # Criar package.json se não existir
    create_package_json()
    
    # Configurar frontend
    setup_frontend()
    
    print("\n✨ Configuração concluída! ✨")
    print("\nPara ativar o ambiente virtual:")
    if platform.system() == "Windows":
        print("  .\\venv\\Scripts\\activate")
    else:
        print("  source venv/bin/activate")
    
    print("\nPara iniciar o backend:")
    print("  cd src/backend")
    print("  uvicorn main:app --reload")
    
    print("\nPara iniciar o frontend (em outro terminal):")
    print("  cd src/frontend")
    print("  npm run dev")

if __name__ == "__main__":
    main()
