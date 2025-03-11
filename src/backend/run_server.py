#!/usr/bin/env python
"""
Script para iniciar o servidor FastAPI em diferentes modos
Uso: python run_server.py [opções]

Opções:
  --dev        Inicia em modo de desenvolvimento (padrão)
  --test       Inicia em modo de teste com MongoDB mockado
  --prod       Inicia em modo de produção
  --port PORT  Porta para o servidor (padrão: 8000)
  --host HOST  Host para o servidor (padrão: 127.0.0.1)
"""

import os
import sys
import uvicorn
import argparse

def main():
    """Função principal para iniciar o servidor"""
    parser = argparse.ArgumentParser(description="Inicia o servidor FastAPI")
    
    # Adiciona opções
    parser.add_argument("--dev", action="store_true", help="Modo de desenvolvimento")
    parser.add_argument("--test", action="store_true", help="Modo de teste")
    parser.add_argument("--prod", action="store_true", help="Modo de produção")
    parser.add_argument("--port", type=int, default=8000, help="Porta do servidor")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host do servidor")
    
    args = parser.parse_args()
    
    # Configura o modo
    if args.test:
        # Modo de teste com MongoDB mockado
        os.environ["TESTING"] = "1"
        os.environ["USE_MOCK_MONGODB"] = "1"
        print("Iniciando servidor em modo de teste...")
    elif args.prod:
        # Modo de produção
        os.environ["TESTING"] = "0"
        os.environ["USE_MOCK_MONGODB"] = "0"
        print("Iniciando servidor em modo de produção...")
    else:
        # Modo de desenvolvimento (padrão)
        os.environ["TESTING"] = "0"
        os.environ["USE_MOCK_MONGODB"] = "0"
        print("Iniciando servidor em modo de desenvolvimento...")
    
    # Inicia o servidor
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=not args.prod,  # Auto-reload apenas em dev e test
        log_level="info"
    )

if __name__ == "__main__":
    main() 