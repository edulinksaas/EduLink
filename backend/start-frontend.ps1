# 프론트엔드 서버 시작 스크립트
$frontendPath = Join-Path $PSScriptRoot "saas\saas"

if (Test-Path $frontendPath) {
    Write-Host "프론트엔드 디렉토리로 이동 중..." -ForegroundColor Yellow
    Set-Location $frontendPath
    
    Write-Host "의존성 확인 중..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        Write-Host "의존성 설치 중..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "프론트엔드 서버 시작 중..." -ForegroundColor Green
    Write-Host "브라우저에서 http://localhost:5173 을 열어주세요." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "프론트엔드 디렉토리를 찾을 수 없습니다: $frontendPath" -ForegroundColor Red
    Write-Host "현재 위치: $PSScriptRoot" -ForegroundColor Yellow
}

