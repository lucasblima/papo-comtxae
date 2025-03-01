REM filepath: /c:/Users/lucas/repos/papo-comtxae/run-diagnostics.bat
@echo off
echo Executando diagnostico do projeto Papo ComTxae...
echo.

REM Detectar diretório do script e usá-lo como base
set "SCRIPT_DIR=%~dp0"
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%src\check-project.ps1"

echo.
echo Diagnostico concluido.
pause