@echo off
title Rally. starter
cd /d "%~dp0"
echo.
echo   Starting Rally. ...
echo.

rem --- 1. Make sure Node.js is available - no admin password needed ---
where node >nul 2>nul
if not errorlevel 1 goto havenode
if not exist "%LOCALAPPDATA%\RallyNode\node.exe" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\install-node.ps1"
set "PATH=%LOCALAPPDATA%\RallyNode;%PATH%"
:havenode
where node >nul 2>nul
if errorlevel 1 goto nonode
for /f %%v in ('node -v') do echo   Node.js %%v is ready.

rem --- 2. First time only: install packages and check them ---
if exist node_modules goto ready
echo   Installing Rally.'s packages - this takes a few minutes the first time...
call npm install
call npx expo install --fix
call npx expo-doctor
:ready

rem --- 3. Start the AI helper and Expo in their own windows ---
start "Rally. AI helper - keep open" cmd /k npm run helper
start "Rally. Expo - keep open" cmd /k npx expo start

rem --- 4. Show the QR code ---
timeout /t 8 /nobreak >nul
call node tools\show-qr.js
echo.
echo   All set! Scan the QR code with Expo Go. You can close this window.
pause
exit /b

:nonode
echo   Node.js could not be installed. Please restart your computer and try again.
pause
