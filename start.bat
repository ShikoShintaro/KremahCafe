@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 22.13 or newer from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
for /f "tokens=1,2 delims=v." %%A in ('node --version') do (set NODE_MAJOR=%%A& set NODE_MINOR=%%B)
if %NODE_MAJOR% LSS 22 (
  echo Node.js 22.13 or newer is required.
  node --version
  pause
  exit /b 1
)
if %NODE_MAJOR% EQU 22 if %NODE_MINOR% LSS 13 (
  echo Node.js 22.13 or newer is required.
  node --version
  pause
  exit /b 1
)
if not exist "node_modules\express\package.json" (
  echo Installing required packages. This requires internet access on first run...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
echo Starting Kremah Cafe. Keep this window open while using the app.
start "" /min cmd /c "timeout /t 3 /nobreak ^>nul ^& start http://localhost:3000"
call npm start
pause
