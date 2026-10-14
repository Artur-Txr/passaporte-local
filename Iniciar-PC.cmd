@echo off
setlocal
cd /d "%~dp0"
call scripts\executar-node.cmd scripts\iniciar.cjs pc
pause
