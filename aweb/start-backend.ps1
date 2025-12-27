# 백엔드 서버 시작 스크립트
$backendPath = $PSScriptRoot

if (Test-Path $backendPath) {
    Write-Host "백엔드 디렉토리로 이동 중..." -ForegroundColor Yellow
    Set-Location $backendPath
    
    Write-Host "의존성 확인 중..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        Write-Host "의존성 설치 중..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "백엔드 서버 시작 중..." -ForegroundColor Green
    Write-Host "API 엔드포인트: http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host "헬스 체크: http://localhost:3000/health" -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "백엔드 디렉토리를 찾을 수 없습니다: $backendPath" -ForegroundColor Red
    Write-Host "현재 위치: $PSScriptRoot" -ForegroundColor Yellow
}

