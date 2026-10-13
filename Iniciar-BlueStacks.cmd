@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2"
set "EXPO_PACKAGER_PROXY_URL="
echo No Expo Go do BlueStacks, conecte a exp://10.0.2.2:8081
call npm start -- --go --lan --port 8081
pause
