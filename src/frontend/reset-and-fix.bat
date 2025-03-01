REM filepath: /c:/Users/lucas/repos/papo-comtxae/src/frontend/reset-and-fix.bat
@echo off
echo Resolvendo problemas do Next.js - Reset completo e correcao de erros...

REM Parar processos node que podem estar em uso
echo Parando processos Node...
taskkill /f /im node.exe >nul 2>&1
echo Processos Node encerrados.

REM Limpar cache e diretórios temporários
echo Limpando cache...
if exist .next rmdir /s /q .next
echo Cache .next removido.

REM Verificar e corrigir node_modules se necessário
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
) else (
    echo Verificando integridade do node_modules...
    call npm ci --prefer-offline
)

REM Garantir que os componentes de erro existam
echo Criando componentes de erro necessarios...

REM Verificar e criar _error.js
if not exist pages\_error.js (
    echo Criando _error.js...
    (
        echo import React from 'react';
        echo.
        echo function Error({ statusCode }) {
        echo   return (
        echo     ^<div^>
        echo       ^<h1^>{statusCode ? `Erro ${statusCode}` : 'Erro no cliente'}^</h1^>
        echo       ^<button onClick={() =^> window.location.href = '/'} style={{marginTop: '20px'}}^>
        echo         Voltar para a pagina inicial
        echo       ^</button^>
        echo     ^</div^>
        echo   ^);
        echo }
        echo.
        echo Error.getInitialProps = ({ res, err }) =^> {
        echo   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
        echo   return { statusCode };
        echo };
        echo.
        echo export default Error;
    ) > pages\_error.js
)

REM Verificar e criar 404.js
if not exist pages\404.js (
    echo Criando 404.js...
    (
        echo import React from 'react';
        echo import Link from 'next/link';
        echo.
        echo export default function Custom404() {
        echo   return (
        echo     ^<div^>
        echo       ^<h1^>404 - Pagina nao encontrada^</h1^>
        echo       ^<Link href="/"^>Voltar para a pagina inicial^</Link^>
        echo     ^</div^>
        echo   ^);
        echo }
    ) > pages\404.js
)

REM Verificar e criar 500.js
if not exist pages\500.js (
    echo Criando 500.js...
    (
        echo import React from 'react';
        echo.
        echo export default function Custom500() {
        echo   return (
        echo     ^<div^>
        echo       ^<h1^>500 - Erro do servidor^</h1^>
        echo       ^<p^>Desculpe, algo deu errado.^</p^>
        echo     ^</div^>
        echo   ^);
        echo }
    ) > pages\500.js
)

REM Criar ou atualizar _app.js se necessário
if not exist pages\_app.js (
    echo Criando _app.js...
    (
        echo import React from 'react';
        echo.
        echo function MyApp({ Component, pageProps }) {
        echo   return ^<Component {...pageProps} /^>;
        echo }
        echo.
        echo export default MyApp;
    ) > pages\_app.js
)

echo.
echo Solucao aplicada! Iniciando servidor de desenvolvimento...
echo.
call npm run dev