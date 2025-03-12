# Papo Social

Uma plataforma de interação social com foco em acessibilidade e interface por voz.

## Sobre o Projeto

Papo Social é uma plataforma que permite interações sociais por meio de uma interface por voz, tornando a tecnologia acessível para pessoas com diferentes níveis de alfabetização. A plataforma utiliza reconhecimento de voz para onboarding e autenticação de usuários.

## Funcionalidades

- **Onboarding por Voz**: Criação de conta usando apenas comandos de voz
- **Autenticação por Voz**: Login utilizando reconhecimento de voz
- **Sistema de Conquistas**: Ganhe distintivos ao interagir com a plataforma
- **Sistema de XP e Níveis**: Evolua na plataforma à medida que participa

## Fluxo de Usuário

1. **Página Inicial**: O usuário chega ao site
2. **Onboarding**:
   - Tela de boas-vindas com introdução
   - Usuário fala seu nome quando solicitado
   - Sistema extrai o nome da fala
   - Usuário confirma seu nome
   - Criação de conta e atribuição de XP
3. **Autenticação**:
   - Autenticação baseada em voz usando Next-Auth
   - Gerenciamento de sessão
4. **Dashboard**: Acesso ao painel personalizado após autenticação

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, DaisyUI
- **Autenticação**: NextAuth.js
- **APIs de Voz**: Web Speech API para reconhecimento e síntese de voz
- **Animações**: Framer Motion para transições suaves

## Configuração de Desenvolvimento

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/papo-comtxae.git
cd papo-comtxae
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

4. Execute o servidor de desenvolvimento
```bash
npm run dev
```

5. Acesse http://localhost:3000

## Estrutura do Projeto

```
src/
├── frontend/
│   ├── components/    # Componentes React
│   │   ├── speech/    # Componentes relacionados a voz
│   │   └── ui/        # Componentes de interface
│   ├── pages/         # Páginas da aplicação
│   │   └── api/       # Rotas de API
│   ├── styles/        # Estilos globais
│   └── types/         # Definições de tipos
└── backend/          # Backend da aplicação (se aplicável)
```

## Implementação de Autenticação

O fluxo de onboarding e autenticação por voz funciona da seguinte maneira:

1. **VoiceOnboarding**:
   - O componente captura a entrada de voz do usuário
   - Extrai o nome do texto transcrito
   - Confirma o nome com o usuário
   - Registra o usuário usando NextAuth

2. **NextAuth**:
   - Provedor customizado para autenticação por voz
   - Armazena dados de voz para futuras autenticações
   - Gerencia sessões de usuário via JWT

3. **Proteção de Rotas**:
   - Middleware Next.js para proteger rotas privadas
   - Redirecionamento para login quando não autenticado
   - Componente AuthCheck para páginas protegidas

## Testes

```bash
npm test
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
