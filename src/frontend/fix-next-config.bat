REM filepath: /c:/Users/lucas/repos/papo-comtxae/src/frontend/fix-next-config.bat
@echo off
echo Corrigindo next.config.js para remover exportacao estatica...

REM Criar backup do arquivo original
copy next.config.js next.config.js.bak
echo Backup criado: next.config.js.bak

REM Criar versao corrigida sem output: 'export'
@echo /** @type {import('next').NextConfig} */ > next.config.js.new
@echo const nextConfig = { >> next.config.js.new
@echo   reactStrictMode: true, >> next.config.js.new
@echo   swcMinify: true, >> next.config.js.new
@echo   images: { >> next.config.js.new
@echo     // unoptimized: true, >> next.config.js.new
@echo   }, >> next.config.js.new
@echo } >> next.config.js.new
@echo >> next.config.js.new
@echo module.exports = nextConfig >> next.config.js.new

REM Substituir arquivo original
move /y next.config.js.new next.config.js
echo Arquivo next.config.js corrigido!

REM Limpar cache e reiniciar
echo.
echo Limpando cache...
call npm run clean:all

echo.
echo Para reiniciar o servidor de desenvolvimento:
echo npm run dev
echo.
echo Feito! Pressione qualquer tecla para sair.
pause > nul