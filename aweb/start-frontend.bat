@echo off
chcp 65001 >nul
echo 프론트엔드 서버 시작 중...
cd saas\saas
if not exist node_modules (
    echo 의존성 설치 중...
    call npm install
)
echo.
echo ========================================
echo 프론트엔드 서버가 시작됩니다.
echo 브라우저에서 http://localhost:5173 을 열어주세요.
echo ========================================
echo.
call npm run dev
pause

