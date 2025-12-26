# 전체 서버 시작 스크립트 (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "에듀링크 SaaS 애플리케이션 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = $PSScriptRoot

# 백엔드 서버 시작
Write-Host "백엔드 서버 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-backend.ps1" -WindowStyle Normal

# 잠시 대기
Start-Sleep -Seconds 2

# 프론트엔드 서버 시작
Write-Host "프론트엔드 서버 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-frontend.ps1" -WindowStyle Normal

Write-Host ""
Write-Host "서버들이 시작되었습니다!" -ForegroundColor Green
Write-Host "브라우저에서 http://localhost:5173 을 열어주세요." -ForegroundColor Cyan
Write-Host ""
Write-Host "각 PowerShell 창을 닫으면 해당 서버가 종료됩니다." -ForegroundColor Yellow
Write-Host ""

