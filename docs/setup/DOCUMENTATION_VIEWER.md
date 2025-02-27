# Documentação Interativa - Guia de Configuração

## Por que Documentação Visualizada?

Uma documentação bem visualizada:
- Facilita a comunicação com stakeholders
- Permite visão holística do projeto
- Serve como fonte única de verdade
- Acelera onboarding de novos desenvolvedores
- Mantém o projeto alinhado com a visão original

## Opções de Visualização

### 1. Docsify (Recomendado para MVP)

Docsify é uma solução leve que não requer build, perfeito para visualização imediata.

#### Instalação

```bash
# Instalar docsify-cli globalmente
npm i docsify-cli -g

# Iniciar servidor para visualização (na raiz do projeto)
docsify serve docs
```

#### Configuração

Crie um arquivo `docs/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Papo Social - Documentação</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'Papo Social',
      repo: '',
      loadSidebar: true,
      subMaxLevel: 3,
      auto2top: true,
      search: {
        placeholder: 'Buscar',
        noData: 'Nenhum resultado encontrado',
        depth: 6
      },
      plantuml: {
        skin: 'default',
      },
      mermaid: {
        theme: 'default'
      }
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-copy-code/dist/docsify-copy-code.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-plantuml/dist/docsify-plantuml.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-mermaid@1.0.0/dist/docsify-mermaid.js"></script>
  <script src="//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</body>
</html>
```

Crie também um arquivo `docs/_sidebar.md`:

```markdown
* [Início](/)
* Arquitetura
  * [Stack Tecnológico](architecture/TECH_STACK.md)
  * [Estrutura do Projeto](architecture/PROJECT_STRUCTURE.md)
* Planejamento
  * [Evolução do MVP](planning/MVP_EVOLUTION.md)
  * [Modelagem de Dados](database/DATA_MODEL.md)
* Setup
  * [Visualização da Documentação](setup/DOCUMENTATION_VIEWER.md)
```

### 2. MkDocs (Para Documentação Mais Estruturada)

Alternativa robusta quando o projeto crescer.

#### Instalação

```bash
# Instalar MkDocs e tema Material
pip install mkdocs mkdocs-material

# Iniciar servidor local
mkdocs serve
```

#### Configuração

Criar arquivo `mkdocs.yml` na raiz:

```yaml
site_name: Papo Social Documentação
theme:
  name: material
  features:
    - navigation.tabs
    - navigation.sections
    - toc.integrate
    - search.suggest
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch
        name: Modo escuro
    - scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch-off-outline
        name: Modo claro

markdown_extensions:
  - pymdownx.highlight
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tasklist
  - pymdownx.emoji

nav:
  - Início: index.md
  - Arquitetura:
    - Stack Tecnológico: architecture/TECH_STACK.md
    - Estrutura do Projeto: architecture/PROJECT_STRUCTURE.md
  - Planejamento:
    - Evolução do MVP: planning/MVP_EVOLUTION.md
    - Modelagem de Dados: database/DATA_MODEL.md
  - Setup:
    - Visualização da Documentação: setup/DOCUMENTATION_VIEWER.md
```

### 3. Solução Rápida (VSCode)

Para visualização rápida individual:

1. Instale a extensão "Markdown Preview Enhanced" no VSCode
2. Abra qualquer arquivo markdown
3. Pressione `Ctrl+K V` (ou `Cmd+K V` no Mac)
4. A visualização aparecerá lado a lado

## Recomendação para Apresentações

Para apresentar a stakeholders:
1. Configure o Docsify (opção mais rápida)
2. Hospede temporariamente no GitHub Pages ou Netlify (gratuito)
3. Compartilhe o link com os interessados

Isso permite acesso fácil sem instalação local para investidores e outros stakeholders.

## Próximos Passos

1. Escolha uma das soluções acima
2. Configure o ambiente de visualização
3. Organize a documentação existente
4. Compartilhe com a equipe e stakeholders
5. Mantenha documentação e código sincronizados
