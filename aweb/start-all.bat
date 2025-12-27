@echo off
chcp 65001 >nul
echo ========================================
echo 에듀링크 SaaS 애플리케이션 시작
echo ========================================
echo.
echo 두 개의 터미널 창이 열립니다:
echo 1. 백엔드 서버 (포트 3000)
echo 2. 프론트엔드 서버 (포트 5173)
echo.
echo 브라우저에서 http://localhost:5173 을 열어주세요.
echo.
pause

start "백엔드 서버" cmd /k "cd /d %~dp0 && start-backend.bat"
timeout /t 2 /nobreak >nul
start "프론트엔드 서버" cmd /k "cd /d %~dp0 && start-frontend.bat"

echo.
echo 서버들이 시작되었습니다!
echo 각 터미널 창을 닫으면 해당 서버가 종료됩니다.
pause

