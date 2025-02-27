import os
import subprocess
import platform
import sys

def main():
    """Instala as dependências necessárias para o backend"""
    print("📦 Instalando dependências do backend...")
    
    # Determinar o comando pip com base no SO
    if platform.system() == "Windows":
        pip_cmd = os.path.join("venv", "Scripts", "pip")
    else:
        pip_cmd = os.path.join("venv", "bin", "pip")
    
    # Verificar se o ambiente virtual existe
    if not os.path.exists("venv"):
        print("❌ Ambiente virtual não encontrado.")
        print("   Criando ambiente virtual...")
        
        if platform.system() == "Windows":
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        else:
            subprocess.run(["python3", "-m", "venv", "venv"], check=True)
    
    # Lista de pacotes necessários
    packages = [
        "motor==3.2.0",
        "pymongo==4.4.1",
        "fastapi==0.100.0",
        "uvicorn==0.22.0",
        "pydantic==2.0.3",
        "python-dotenv==1.0.0",
        "email-validator==2.0.0"
    ]
    
    # Instalar cada pacote
    for package in packages:
        try:
            print(f"⬇️ Instalando {package.split('==')[0]}...")
            subprocess.run([pip_cmd, "install", package], check=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao instalar {package}: {e}")
    
    # Salvar as dependências em requirements.txt
    req_dir = os.path.join("src", "backend")
    os.makedirs(req_dir, exist_ok=True)
    
    req_file = os.path.join(req_dir, "requirements.txt")
    with open(req_file, "w") as f:
        for package in packages:
            f.write(f"{package}\n")
    
    print(f"✅ Arquivo requirements.txt criado em {req_file}")
    print("\n✅ Todas as dependências instaladas com sucesso!")
    print("\nAgora você pode iniciar o backend com:")
    print("python start_backend.py")

if __name__ == "__main__":
    main()
