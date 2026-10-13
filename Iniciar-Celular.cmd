@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME="
set "EXPO_PACKAGER_PROXY_URL="
echo Abra o Expo Go no celular e escaneie o NOVO QR deste terminal.
echo Mantenha este terminal aberto. PC e celular precisam de internet.
call npm start -- --go --tunnel --port 8083
pause
