@echo off
setlocal
where node >nul 2>&1
if not errorlevel 1 goto executar
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
where node >nul 2>&1
if not errorlevel 1 goto executar
echo Instale Node.js 24 em https://nodejs.org/ ou use o pacote Apresentacao-PC.
exit /b 1
:executar
node %*
exit /b %errorlevel%
