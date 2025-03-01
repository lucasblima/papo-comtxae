# Script para resetar completamente o frontend

Write-Host "Reiniciando o ambiente de desenvolvimento do Next.js..." -ForegroundColor Cyan

# Parar qualquer processo Node.js que possa estar em execução
Write-Host "[1/5] Parando processos Node.js..." -ForegroundColor Yellow
try {
    Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Encerrando processo Node.js (PID: $($_.Id))" -ForegroundColor Gray
        $_ | Stop-Process -Force
    }
    Write-Host "  ✓ Processos encerrados" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao encerrar processos: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpar o cache do Next.js
Write-Host "[2/5] Limpando cache do Next.js..." -ForegroundColor Yellow
if (Test-Path -Path ".\.next") {
    try {
        Remove-Item -Recurse -Force ".\.next"
        Write-Host "  ✓ Cache limpo" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✓ Não há cache para limpar" -ForegroundColor Green
}

# Verificar node_modules
Write-Host "[3/5] Verificando dependências..." -ForegroundColor Yellow
$reinstallDeps = $false

if (-Not (Test-Path -Path ".\node_modules")) {
    Write-Host "  ⚠ Pasta node_modules não encontrada" -ForegroundColor Yellow
    $reinstallDeps = $true
}

if ($reinstallDeps -or $args[0] -eq "-f" -or $args[0] -eq "--force") {
    Write-Host "  Reinstalando dependências..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "  ✓ Dependências instaladas" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Erro ao instalar dependências: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✓ Dependências já instaladas (use -f para forçar reinstalação)" -ForegroundColor Green
}

# Verificar o arquivo .env no diretório raiz
Write-Host "[4/5] Verificando variáveis de ambiente..." -ForegroundColor Yellow
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envExists = Test-Path -Path "$projectRoot\.env"

if ($envExists) {
    Write-Host "  ✓ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar variáveis NEXT_PUBLIC_
    $envContent = Get-Content -Path "$projectRoot\.env"
    $nextPublicVars = $envContent | Where-Object { $_ -match "NEXT_PUBLIC_" }
    
    if ($nextPublicVars.Count -gt 0) {
        Write-Host "  ✓ $($nextPublicVars.Count) variáveis NEXT_PUBLIC_ encontradas" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Nenhuma variável NEXT_PUBLIC_ encontrada no arquivo .env" -ForegroundColor Yellow
        Write-Host "    As variáveis de ambiente cliente devem começar com NEXT_PUBLIC_" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Arquivo .env não encontrado no diretório raiz" -ForegroundColor Yellow
    
    # Sugerir a criação de um arquivo .env básico
    Write-Host "    Criando arquivo .env básico..." -ForegroundColor Yellow
    
    $envContent = @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true

# UI Configuration
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_DEFAULT_LANGUAGE=pt-BR
"@
    
    try {
        Set-Content -Path "$projectRoot\.env" -Value $envContent
        Write-Host "    ✓ Arquivo .env básico criado" -ForegroundColor Green
    } catch {
        Write-Host "    ✗ Erro ao criar arquivo .env: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Iniciar o servidor de desenvolvimento
Write-Host "[5/5] Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
try {
    npm run dev
} catch {
    Write-Host "  ✗ Erro ao iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nReiniciação do ambiente de desenvolvimento concluída!" -ForegroundColor Cyan
