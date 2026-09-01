@echo off
title VerifiAI Launcher
color 0A

echo ============================================================
echo               VerifiAI - Fake News Detector                  
echo ============================================================
echo.

:: Step 0: Free up ports 5000 and 5001 if currently in use
echo [0/4] Cleaning up any existing processes on ports 5000 and 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001"') do taskkill /f /pid %%a >nul 2>&1

:: Step 1: Start local MySQL service (MySQL267)
echo [1/4] Starting local MySQL service...
net start MySQL267 >nul 2>&1
if %errorlevel% == 0 (
    echo      [OK] MySQL267 service started successfully.
) else (
    echo      [OK] MySQL267 is already running.
)
echo.

:: Step 2: Start Python ML Flask Service
echo [2/4] Starting Python ML Service (Port 5001)...
start "VerifiAI ML Service" cmd /k "cd /d %~dp0ml_service && python app.py"
timeout /t 3 /nobreak >nul

:: Step 3: Start Express Backend + React App
echo [3/4] Starting Express Server and React App (Port 5000)...
start "VerifiAI Express Server" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 5 /nobreak >nul

:: Step 4: Open browser
echo [4/4] Opening http://localhost:5000 in your browser...
start http://localhost:5000

echo.
echo ============================================================
echo  VerifiAI launched! ML on :5001, App on :5000
echo  Close the console windows to stop the application.
echo ============================================================
pause
