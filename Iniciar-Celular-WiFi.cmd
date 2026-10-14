@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME="
for /f "delims=" %%I in ('node scripts\ip-rede.cjs') do set "REACT_NATIVE_PACKAGER_HOSTNAME=%%I"
set "EXPO_PACKAGER_PROXY_URL="
set "EXPO_OFFLINE=false"
echo Conecte o celular e o computador ao mesmo roteador.
echo Abra o Expo Go no celular e escaneie o NOVO QR deste terminal.
echo Mantenha este terminal aberto.
echo IP da rede local: %REACT_NATIVE_PACKAGER_HOSTNAME%
call npm start -- --go --lan --port 8084
pause
