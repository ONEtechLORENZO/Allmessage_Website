@echo off
rem Starts the whole website: Milo (port 5050) and AllMessage (port 2060).
rem Open http://localhost:2060 when both windows say "Ready".

for %%P in (2060 5050) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":%%P .*LISTENING"') do taskkill /PID %%I /F >nul 2>&1
)

start "Milo (5050)" /min cmd /k "cd /d C:\Users\Utente\Desktop\Milo\web && npm start"
start "AllMessage (2060)" /min cmd /k "cd /d "%~dp0web" && npm start"

echo Site starting...
echo   This PC:       http://localhost:2060
echo   Same Wi-Fi:    http://192.168.0.17:2060
echo   Milo page:     http://localhost:2060/products/milo/
