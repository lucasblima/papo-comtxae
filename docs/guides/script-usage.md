# Guia de Uso dos Scripts do Projeto

## Scripts de Diagnóstico

### Check Project (PowerShell)

Este script analisa a estrutura do projeto, verifica os processos em execução e avalia a configuração geral:

```powershell
# Método simples (usando o .bat):
.\run-diagnostics.bat

# Ou diretamente no PowerShell:
powershell -ExecutionPolicy Bypass -File .\src\check-project.ps1
```

> **Importante**: O script funcionará independentemente do diretório em que você estiver, pois ele detecta automaticamente o diretório raiz do projeto.

### Check Routes (Node.js)

Este script identifica as rotas disponíveis no frontend Next.js:

```bash
# Execute com Node.js:
cd src\frontend
node check-routes.js
```

> **Nota**: O script foi atualizado para não precisar de dependências externas.
> Uma versão alternativa que usa ESM e chalk está disponível:
> ```bash
> # Primeiro instale chalk como ESM:
> npm install chalk
> # Em seguida, execute:
> node check-routes-esm.mjs
> ```

## Scripts de Reinicialização

### Next.js Restart Script (Bash/Git Bash)

Para reiniciar o ambiente de desenvolvimento usando Git Bash (MINGW):

```bash
cd /c/Users/lucas/repos/papo-comtxae
bash next-restart.sh
```

### Next.js Restart PowerShell

Para reiniciar o ambiente de desenvolvimento usando PowerShell:

```powershell
cd C:\Users\lucas\repos\papo-comtxae
.\next-restart.ps1
```

### Next.js Restart Batch (CMD)

Para reiniciar o ambiente de desenvolvimento usando Prompt de Comando:

```cmd
cd C:\Users\lucas\repos\papo-comtxae
next-restart.bat
```

## Troubleshooting de Execução de Scripts

### O script não é reconhecido como comando

Se você estiver tentando executar um script e receber um erro como "não é reconhecido como um comando", verifique:

1. **Pasta correta**: Certifique-se de estar na pasta correta
2. **Método de execução correto**:
   - Scripts .sh precisam de `bash script.sh`
   - Scripts .ps1 precisam de `.\script.ps1`
   - Scripts .js precisam de `node script.js`
   - Scripts .bat podem ser executados diretamente: `script.bat`

### "Permission denied" (Permissão negada)

No Windows com PowerShell, você pode precisar alterar a política de execução:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erros com scripts Node.js

Se um script .js retornar erros como "Is a directory" quando executado diretamente, é porque você está tentando executá-lo como um script de shell. Use `node` para executá-lo:

```bash
node check-routes.js
```

Se um script .js usar chalk e mostrar erro como "chalk.blue is not a function", você tem duas opções:
1. Use a versão simplificada que não depende de bibliotecas externas: `check-routes.js`
2. Use a versão ESM com chalk instalado: `check-routes-esm.mjs`

### Erros de localização de arquivos

Se o script de diagnóstico não estiver encontrando os arquivos do projeto:

1. Certifique-se de executá-lo a partir do diretório raiz do projeto
2. Ou use a versão atualizada do script que detecta automaticamente a localização do projeto
3. Use sempre `run-diagnostics.bat` para garantir a execução correta
