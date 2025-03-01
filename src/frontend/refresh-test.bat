REM filepath: /c:/Users/lucas/repos/papo-comtxae/src/frontend/refresh-test.bat
@echo off
echo Limpando cache do navegador e reiniciando o frontend...
echo.

cd /d %~dp0

echo 1. Limpando cache do Next.js...
if exist .next\ (
  rmdir /s /q .next
  echo    Cache limpo!
) else (
  echo    Nenhum cache para limpar.
)

echo 2. Reconstruindo a aplicacao...
call npm run build
echo    Reconstrucao concluida!

echo 3. Instalando dependencias (se necessario)...
call npm install
echo    Dependencias atualizadas!

echo 4. Reiniciando o servidor de desenvolvimento...
start cmd /k "npm run dev"
echo    Servidor iniciado em novo processo!

echo 5. Abrindo o navegador com cache limpo...
start chrome --incognito "http://localhost:3000/"

echo.
echo Processo concluido! O servidor foi reiniciado e o navegador foi aberto no modo anonimo.
echo Para um reset mais completo, use o script PowerShell: reset-frontend.ps1
pause