#!/usr/bin/env python
"""
Script para executar testes com MongoDB mockado
Uso: python run_tests.py [opções]

Opções:
  --unit       Executa apenas testes de unidade
  --integration Executa apenas testes de integração
  --all        Executa todos os testes (padrão)
  --verbose    Mostra saída detalhada
"""

import os
import sys
import pytest

def main():
    """Função principal para executar os testes"""
    # Define flags de linha de comando
    args = sys.argv[1:]
    test_args = []
    
    # Sempre inclui estas flags
    test_args.extend(["-v"])  # verbose output
    
    # Configura quais testes executar
    if "--unit" in args:
        test_args.append("tests/unit/")
        args.remove("--unit")
    elif "--integration" in args:
        test_args.append("tests/integration/")
        args.remove("--integration")
    else:  # default: all tests
        test_args.append("tests/")
    
    # Opções adicionais
    if "--verbose" in args:
        test_args.append("-v")
        args.remove("--verbose")
    
    # Adiciona quaisquer outros argumentos passados
    test_args.extend(args)
    
    print(f"Executando testes com argumentos: {' '.join(test_args)}")
    
    # Configura variáveis de ambiente para os testes
    os.environ["TESTING"] = "1"
    os.environ["USE_MOCK_MONGODB"] = "1"
    
    # Executa os testes
    return pytest.main(test_args)

if __name__ == "__main__":
    sys.exit(main()) 