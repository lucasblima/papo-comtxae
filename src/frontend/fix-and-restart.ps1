# Script para corrigir a configuração do Next.js e reiniciar o servidor

Write-Host "Corrigindo problema de exportação estática..." -ForegroundColor Cyan

# Verificar next.config.js
$configPath = Join-Path $PSScriptRoot "next.config.js"
if (-not (Test-Path $configPath)) {
    Write-Host "❌ Arquivo next.config.js não encontrado!" -ForegroundColor Red
    exit 1
}

# Fazer backup do arquivo original
$backupPath = Join-Path $PSScriptRoot "next.config.js.bak"
Copy-Item -Path $configPath -Destination $backupPath -Force
Write-Host "✓ Backup criado: $backupPath" -ForegroundColor Green

# Ler o conteúdo e verificar se tem output: 'export'
$configContent = Get-Content -Path $configPath -Raw
$hasStaticExport = $configContent -match 'output:\s*["]export["]'

if ($hasStaticExport) {
    Write-Host "✓ Encontrada configuração de exportação estática" -ForegroundColor Green
    
    # Criar nova configuração sem output: 'export'
    $newConfig = $configContent -replace "output:\s*['\"]export['\"]", "// output: 'export' // Removido para permitir renderização dinâmica"
    
    # Salvar novo arquivo
    Set-Content -Path $configPath -Value $newConfig
    Write-Host "✓ Configuração de exportação estática removida" -ForegroundColor Green
} else {
    Write-Host "❓ Não foi encontrada configuração de exportação estática explícita" -ForegroundColor Yellow
    Write-Host "  Verificando outras configurações..." -ForegroundColor Yellow
    
    # Texto de configuração padrão
    $defaultConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Descomente apenas se precisar exportar estaticamente
    // unoptimized: true
  },
  // Outras configurações podem ser adicionadas aqui
}

module.exports = nextConfig
"@
    
    # Perguntar se deseja resetar para configuração padrão
    $resetConfig = Read-Host "Deseja resetar para a configuracao padrao? (s/n)"
    if ($resetConfig -eq "s") {
        Set-Content -Path $configPath -Value $defaultConfig
        Write-Host "✓ Configuração resetada para padrão" -ForegroundColor Green
    }
}

# Limpar cache
Write-Host "`nLimpando cache..." -ForegroundColor Yellow
try {
    npm run clean:all
    Write-Host "✓ Cache limpo com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar a configuração atual
Write-Host "`nExecutando verificador de renderização..." -ForegroundColor Yellow
try {
    node static-check.js
} catch {
    Write-Host "❌ Erro ao executar verificador: $($_.Exception.Message)" -ForegroundColor Red
}

# Perguntar se quer reiniciar o servidor
$restartServer = Read-Host "`nDeseja reiniciar o servidor de desenvolvimento? (s/n)"
if ($restartServer -eq "s") {
    Write-Host "Reiniciando servidor..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "`nPara reiniciar manualmente, execute:" -ForegroundColor Cyan
    Write-Host 'npm run dev' -ForegroundColor White
}
