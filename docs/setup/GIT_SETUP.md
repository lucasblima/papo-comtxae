# Configuração do Repositório Git 

Este guia explica como configurar o repositório Git local com o GitHub.

## Configuração Inicial do Repositório

### 1. Criar um novo repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Configure o novo repositório:
   - Nome: `papo-comtxae`
   - Descrição: `Uma plataforma de comunicação inteligente com processamento de voz e IA`
   - Visibilidade: Pública (recomendado) ou Privada
   - **NÃO** inicialize com README, .gitignore ou licença
4. Clique em "Create repository"

### 2. Conectar o repositório local ao GitHub 

Copie o URL do repositório que aparecerá nas instruções (algo como `https://github.com/seu-usuario/papo-comtxae.git`).

Execute os seguintes comandos no terminal (Git Bash):

```bash
# Adicionar a origem remota
git remote add origin https://github.com/lucasblima/papo-comtxae.git

# Verificar se foi adicionado corretamente
git remote -v

# Enviar o código para o GitHub
git push -u origin main
```

### 3. Habilitar GitHub Pages

Para publicar a documentação online:

1. Acesse o repositório no GitHub
2. Vá para "Settings" (aba)
3. Role até a seção "GitHub Pages"
4. Em Source, selecione a branch "gh-pages"
5. Clique em "Save"

A documentação ficará disponível em `https://seu-usuario.github.io/papo-comtxae`.

## Resolução de Problemas

### Erro ao fazer push

Se você ver o erro:
```
fatal: No configured push destination.
Either specify the URL from the command-line or configure a remote repository using

    git remote add <name> <url>
```

Significa que você precisa configurar o repositório remoto conforme as instruções acima.

### Erro de autenticação

Se você receber erros de autenticação ao tentar fazer push:

1. **Usando HTTPS**: O GitHub agora requer token de acesso pessoal em vez de senha
   - Vá para Settings > Developer settings > Personal access tokens
   - Gere um novo token com escopo "repo"
   - Use esse token como senha quando solicitado

2. **Usando SSH**: Configure chaves SSH:
   ```bash
   # Gerar chave SSH
   ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
   
   # Iniciar ssh-agent
   eval "$(ssh-agent -s)"
   
   # Adicionar chave privada
   ssh-add ~/.ssh/id_ed25519
   
   # Copie a chave pública para adicionar ao GitHub
   cat ~/.ssh/id_ed25519.pub
   ```
   - Cole a chave em GitHub > Settings > SSH and GPG keys

### Erro de push rejeitado (divergência de históricos)

Se você receber um erro como:
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/seu-usuario/papo-comtxae.git'
```

Isso acontece quando o repositório remoto tem commits que não existem no seu repositório local. Para resolver:

1. **Opção 1:** Integrar as mudanças remotas (recomendado se o repositório remoto tiver conteúdo importante):
   ```bash
   # Baixar as alterações do repositório remoto
   git pull --rebase origin main
   
   # Depois de resolver qualquer conflito, faça o push novamente
   git push -u origin main
   ```

2. **Opção 2:** Forçar o push (use apenas se tiver certeza que pode substituir o conteúdo remoto):
   ```bash
   # CUIDADO: isso sobrescreverá o histórico remoto
   git push -f origin main
   ```

3. **Opção 3:** Se o repositório foi inicializado com README/arquivos e seu repositório local já tem histórico:
   ```bash
   # Unir históricos divergentes
   git pull --allow-unrelated-histories origin main
   
   # Resolver conflitos se necessário e confirmar a mesclagem
   git commit -m "Mesclando históricos inicial e local"
   
   # Enviar para o repositório remoto
   git push -u origin main
   ```
