@echo off
title IntelliDoc AI - System Launcher
echo ===============================================================================
echo                   IntelliDoc AI - System Launcher
echo ===============================================================================
echo.
echo Starting IntelliDoc AI Backend API (FastAPI + LayoutLMv3 + Gemini)...
start "IntelliDoc AI - Backend API" cmd /k "cd /d %~dp0runtime_app\backend && .\venv\Scripts\activate && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo Starting IntelliDoc AI Frontend UI (Next.js 16)...
start "IntelliDoc AI - Frontend UI" cmd /k "cd /d %~dp0runtime_app\frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 4 /nobreak > nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000


echo.
echo ===============================================================================
echo Both Backend (port 8000) and Frontend (port 3000) are running!
echo Swagger API docs are available at http://127.0.0.1:8000/docs
echo Close the respective command prompt windows to stop the servers.
echo ===============================================================================
pause
