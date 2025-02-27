# Stack Tecnológico do Papo Social

## 1. Core Backend (Python + Rust)

### Python Layer (Primary)
- FastAPI para API principal
- CrewAI para orquestração de agentes
- Pydantic para validação de dados
- asyncio para operações assíncronas

### Rust Layer (Performance Critical)
- Microserviços em Axum para componentes críticos
- Processamento de áudio e voz
- Cache e operações de baixa latência
- Integração via gRPC/tonic

## 2. Processamento de Voz (Hybrid)

### Python Components
- OpenAI Whisper para reconhecimento principal
- Transformers para processamento de linguagem
- CrewAI para orquestração de agentes de voz

### Rust Components
- whisper-rs para processamento local quando necessário
- cpal para manipulação de áudio de baixa latência
- Ponte PyO3 para integração Python/Rust

## 3. Estado e Cache

### Principal (Python)
- Redis para estado distribuído
- PostgreSQL para dados persistentes
- SQLAlchemy para ORM

### Performance Layer (Rust)
- sled para cache local de alta performance
- fred para operações Redis críticas

## 4. Frontend

### Web (Primary)
- Next.js para interface principal
- React para componentes
- TailwindCSS para estilização

### Performance Components
- WebAssembly (Rust) para processamento pesado no cliente
- Yew para componentes específicos de alta performance

## 5. IA e ML

### Core ML (Python)
- CrewAI como framework principal
- Transformers/HuggingFace
- LangChain para componentes específicos
- ChromaDB para vector store

### Performance Optimization (Rust)
- onnxruntime-rs para inferência otimizada
- PyO3 para extensões de performance crítica

## Justificativa da Arquitetura Híbrida

1. **Porque não full Rust:**
- CrewAI e ecossistema de IA são primariamente Python
- Desenvolvimento mais rápido em Python
- Maior disponibilidade de desenvolvedores Python

2. **Porque não full Python:**
- Necessidade de performance em componentes críticos
- Processamento de áudio requer baixa latência
- Operações de cache precisam ser extremamente rápidas

3. **Benefícios da Abordagem Híbrida:**
- Melhor dos dois mundos
- Flexibilidade para otimizar pontos críticos
- Manutenção da velocidade de desenvolvimento
- Escalabilidade onde necessário

## Pipeline de Integração

1. **Fluxo Padrão**
```
[Client] → [Next.js] → [FastAPI/CrewAI] → [DB/Cache]
```

2. **Fluxo de Performance**
```
[Client] → [Rust WASM] → [Rust Service] → [sled/Redis]
```

3. **Processamento de Voz**
```
[Audio] → [Rust Processor] → [Whisper Python] → [CrewAI]
```

Esta arquitetura permite crescimento orgânico, onde podemos começar com componentes Python e gradualmente otimizar com Rust conforme necessário.
