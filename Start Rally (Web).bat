@echo off
title Rally. web starter
cd /d "%~dp0"
echo.
echo   Starting Rally. in your web browser ...
echo.

rem --- 0. Make .env for the OpenAI key if it's missing ---
if exist .env goto havekey
echo OPENAI_API_KEY=paste-your-key-here> .env
echo   Notepad is opening .env. Replace paste-your-key-here with your NEW OpenAI key,
echo   then save it with Ctrl+S and close Notepad.
start /wait notepad .env
:havekey

rem --- 1. Make sure Node.js is available - no admin password needed ---
where node >nul 2>nul
if not errorlevel 1 goto havenode
if not exist "%LOCALAPPDATA%\RallyNode\node.exe" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\install-node.ps1"
set "PATH=%LOCALAPPDATA%\RallyNode;%PATH%"
:havenode
where node >nul 2>nul
if errorlevel 1 goto nonode

rem --- 2. Install any new packages - quick if nothing changed ---
echo   Checking Rally.'s packages...
call npm install

rem --- 3. Start the AI helper and the web version ---
start "Rally. AI helper - keep open" cmd /k npm run helper
start "Rally. Web - keep open" cmd /k npx expo start --web --port 8082
echo.
echo   Rally. will open in your browser in a moment (http://localhost:8082).
echo   Keep both new windows open. You can close this one.
timeout /t 10 >nul
exit /b

:nonode
echo   Node.js could not be installed. Please restart your computer and try again.
pause
