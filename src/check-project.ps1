# Diagnóstico completo do projeto Papo ComTxae

# Encontrar o diretório raiz do projeto, independente de onde o script é executado
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDirectory

# Mudar para o diretório raiz do projeto para garantir que os caminhos relativos funcionem
Push-Location $projectRoot
Write-Host "Diretório atual: $projectRoot" -ForegroundColor Gray

Write-Host "`n========== DIAGNÓSTICO DO PROJETO ==========" -ForegroundColor Cyan

# Verificar estrutura de diretórios
Write-Host "`n[1] Verificando estrutura de diretórios..." -ForegroundColor Yellow
$frontendExists = Test-Path -Path "$projectRoot\src\frontend"
$backendExists = Test-Path -Path "$projectRoot\src\backend"

if ($frontendExists) {
    Write-Host "✓ Pasta src\frontend encontrada" -ForegroundColor Green
    
    # Verificar se é App Router ou Pages Router
    $appRouterExists = Test-Path -Path "$projectRoot\src\frontend\app"
    $pagesRouterExists = Test-Path -Path "$projectRoot\src\frontend\pages"
    
    if ($appRouterExists) {
        Write-Host "  ↪ Usando App Router (app/)" -ForegroundColor Cyan
    } elseif ($pagesRouterExists) {
        Write-Host "  ↪ Usando Pages Router (pages/)" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠ Não foi possível determinar o roteador (app/ ou pages/ não encontrados)" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Pasta src\frontend não encontrada" -ForegroundColor Red
}

if ($backendExists) {
    Write-Host "✓ Pasta src\backend encontrada" -ForegroundColor Green
} else {
    Write-Host "✗ Pasta src\backend não encontrada" -ForegroundColor Red
}

# Verificar arquivos de configuração
Write-Host "`n[2] Verificando arquivos de configuração..." -ForegroundColor Yellow
$nextConfigExists = Test-Path -Path "$projectRoot\src\frontend\next.config.js"
if ($nextConfigExists) {
    Write-Host "✓ next.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ next.config.js não encontrado - usando configuração padrão" -ForegroundColor Yellow
}

$packageJsonExists = Test-Path -Path "$projectRoot\src\frontend\package.json"
if ($packageJsonExists) {
    Write-Host "✓ package.json encontrado" -ForegroundColor Green
    
    # Verificar dependências principais
    $packageJson = Get-Content -Path "$projectRoot\src\frontend\package.json" | ConvertFrom-Json
    Write-Host "  ↪ Next.js versão: $($packageJson.dependencies.next)" -ForegroundColor Cyan
    Write-Host "  ↪ React versão: $($packageJson.dependencies.react)" -ForegroundColor Cyan
} else {
    Write-Host "✗ package.json não encontrado" -ForegroundColor Red
}

# Verificar processos em execução
Write-Host "`n[3] Verificando processos em execução..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✓ Processos Node.js em execução:" -ForegroundColor Green
    foreach ($process in $nodeProcesses) {
        Write-Host "  ↪ PID: $($process.Id), Memória: $([math]::Round($process.WorkingSet / 1MB, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Nenhum processo Node.js em execução" -ForegroundColor Red
}

# Verificar portas em uso
Write-Host "`n[4] Verificando portas..." -ForegroundColor Yellow
$port3000 = netstat -ano | Select-String ":3000"
if ($port3000) {
    Write-Host "✓ Porta 3000 em uso (frontend)" -ForegroundColor Green
    $port3000PID = ($port3000 -split '\s+')[-1]
    try {
        $process = Get-Process -Id $port3000PID
        Write-Host "  ↪ PID: $port3000PID, Processo: $($process.ProcessName)" -ForegroundColor Cyan
    } catch {
        Write-Host "  ↪ PID: $port3000PID" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Porta 3000 não está em uso (frontend não está rodando)" -ForegroundColor Red
}

$port8000 = netstat -ano | Select-String ":8000"
if ($port8000) {
    Write-Host "✓ Porta 8000 em uso (backend)" -ForegroundColor Green
    $port8000PID = ($port8000 -split '\s+')[-1]
    try {
        $process = Get-Process -Id $port8000PID
        Write-Host "  ↪ PID: $port8000PID, Processo: $($process.ProcessName)" -ForegroundColor Cyan
    } catch {
        Write-Host "  ↪ PID: $port8000PID" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Porta 8000 não está em uso (backend não está rodando)" -ForegroundColor Red
}

# Verificar cache Next.js
Write-Host "`n[5] Verificando cache do Next.js..." -ForegroundColor Yellow
$nextCacheExists = Test-Path -Path "$projectRoot\src\frontend\.next"
if ($nextCacheExists) {
    Write-Host "✓ Pasta .next encontrada" -ForegroundColor Green
    
    # Verificar tamanho do cache
    $nextCacheSize = (Get-ChildItem -Path "$projectRoot\src\frontend\.next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ↪ Tamanho do cache: $([math]::Round($nextCacheSize, 2)) MB" -ForegroundColor Cyan
    
    # Verificar data de modificação
    $latestModification = (Get-ChildItem -Path "$projectRoot\src\frontend\.next" -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
    Write-Host "  ↪ Última modificação: $latestModification" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Pasta .next não encontrada - o projeto não foi compilado" -ForegroundColor Yellow
}

# Verificar variáveis de ambiente
Write-Host "`n[6] Verificando arquivos .env..." -ForegroundColor Yellow
$envFileExists = Test-Path -Path "$projectRoot\.env"
if ($envFileExists) {
    Write-Host "✓ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar se contém variáveis NEXT_PUBLIC
    $envContent = Get-Content -Path "$projectRoot\.env"
    $nextPublicVars = $envContent | Where-Object { $_ -match "NEXT_PUBLIC_" }
    
    if ($nextPublicVars) {
        Write-Host "  ↪ Variáveis NEXT_PUBLIC_ encontradas: $($nextPublicVars.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠ Nenhuma variável NEXT_PUBLIC_ encontrada no arquivo .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Arquivo .env não encontrado" -ForegroundColor Red
}

# Testar conectividade com o backend
Write-Host "`n[7] Testando conectividade com o backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ API responde na porta 8000" -ForegroundColor Green
    Write-Host "  ↪ Resposta: $response" -ForegroundColor Cyan
} catch {
    # Tentar endpoints alternativos comuns
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ API responde na raiz (/) da porta 8000" -ForegroundColor Green
    } catch {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/docs" -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✓ API FastAPI responde no endpoint de documentação (/docs)" -ForegroundColor Green
        } catch {
            Write-Host "✗ Não foi possível conectar ao backend na porta 8000" -ForegroundColor Red
            Write-Host "  ↪ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n========== RECOMENDAÇÕES ==========" -ForegroundColor Cyan

if (-not $nextCacheExists -or $nodeProcesses.Count -eq 0 -or -not $port3000) {
    Write-Host "1. Reinicie o servidor de desenvolvimento Next.js:" -ForegroundColor Yellow
    Write-Host "   cd $projectRoot\src\frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}

if ($nextCacheExists -and $nodeProcesses.Count -gt 0 -and $port3000) {
    Write-Host "1. Limpe o cache do Next.js e reinicie:" -ForegroundColor Yellow
    Write-Host "   cd $projectRoot\src\frontend" -ForegroundColor White
    Write-Host "   rmdir /s /q .next" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}

if (-not $port8000) {
    Write-Host "2. Inicie o servidor backend:" -ForegroundColor Yellow
    Write-Host "   cd $projectRoot\src\backend" -ForegroundColor White
    Write-Host "   uvicorn main:app --reload" -ForegroundColor White
}

Write-Host "`nExecute o script check-routes.js para ver as rotas disponíveis:" -ForegroundColor Yellow
Write-Host "   cd $projectRoot\src\frontend" -ForegroundColor White
Write-Host "   node check-routes.js" -ForegroundColor White

# Restaurar o diretório de trabalho original
Pop-Location

Write-Host "`nDiagnóstico concluído!" -ForegroundColor Green
