Write-Host "Verificando e finalizando processos nas portas: 3000, 3001, 8000" -ForegroundColor Yellow

$ports = @(3000, 3001, 8000)

foreach ($port in $ports) {
    Write-Host "Verificando porta $port..." -ForegroundColor Cyan
    $processInfo = netstat -ano | Select-String ":$port "
    
    if ($processInfo) {
        try {
            $processId = ($processInfo -split '\s+')[-1]
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Host "Encontrado processo: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "✓ Processo finalizado com sucesso" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "! Erro ao finalizar processo na porta $port : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Nenhum processo encontrado na porta $port" -ForegroundColor Gray
    }
}

Write-Host "`nPortas liberadas! Você pode iniciar o servidor novamente." -ForegroundColor Green
