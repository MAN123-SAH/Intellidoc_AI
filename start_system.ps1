Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "                  IntelliDoc AI - System Launcher" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "Starting IntelliDoc AI Backend API (FastAPI + LayoutLMv3 + Gemini)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\runtime_app\backend'; .\venv\Scripts\activate; python -m uvicorn main:app --host 127.0.0.1 --port 8000"

Write-Host "Starting IntelliDoc AI Frontend UI (Next.js 16)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\runtime_app\frontend'; npm run dev"

Write-Host ""
Write-Host "Waiting 5 seconds for servers to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Write-Host "Opening browser at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "Both Backend (port 8000) and Frontend (port 3000) are running!" -ForegroundColor Green
Write-Host "Swagger API docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Close the opened terminal windows to terminate the servers." -ForegroundColor DarkGray
Write-Host "===============================================================================" -ForegroundColor Cyan
