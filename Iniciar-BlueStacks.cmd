@echo off
cd /d "%~dp0"
call scripts\executar-node.cmd scripts\iniciar.cjs bluestacks
pause
