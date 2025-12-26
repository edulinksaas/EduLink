@echo off
chcp 65001 >nul
echo 백엔드 서버 시작 중...
cd /d "%~dp0"
if not exist node_modules (
    echo 의존성 설치 중...
    call npm install
)
echo.
echo ========================================
echo 백엔드 서버가 시작됩니다.
echo API 엔드포인트: http://localhost:3000/api
echo 헬스 체크: http://localhost:3000/health
echo ========================================
echo.
call npm run dev
pause

