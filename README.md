# Papo Social

Uma plataforma de comunicação inteligente com processamento de voz e orquestração de agentes de IA.

## Documentação
- [Documentação Online](https://lucasblima.github.io/papo-comtxae)
- [Documentação Local](./docs/README.md)

## Arquitetura Híbrida

O Papo Social utiliza uma arquitetura híbrida que combina:
- **Python** (FastAPI) para a API principal e orquestração de IA com CrewAI
- **TypeScript/Next.js** para o frontend interativo
- **Componentes Rust** para processamento de alta performance

## Uso Rápido (Windows)

### Iniciar Servidor de Documentação
```bash
# Via script de projeto
./start-project.sh
# Opção 1) Iniciar servidor de documentação

# OU diretamente
docsify serve docs
```

## Contribuição

Veja nosso [Guia de Contribuição](./docs/CONTRIBUTING.md) para detalhes sobre como participar do desenvolvimento.

## Estrutura
```
papo-comtxae/
├── docs/              # Documentação
├── src/               # Código fonte (futuro)
│   ├── frontend/      # Next.js/React
│   ├── backend/       # FastAPI (Python) 
│   └── rust_core/     # Componentes Rust
└── README.md          # Este arquivo
```

## Licença

Este projeto é privado e proprietário.
