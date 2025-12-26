# 서버 실행 가이드

## 네트워크 오류 해결 방법

### 1. 두 개의 터미널 창을 열어주세요

#### 터미널 1: 프론트엔드 서버
```bash
cd "C:\Users\sehwa\OneDrive\바탕 화면\saas"
npm run dev
```

#### 터미널 2: 백엔드 서버
```bash
cd "C:\Users\sehwa\OneDrive\바탕 화면\saas\server"
npm run dev
```

### 2. 서버 실행 확인

#### 프론트엔드 서버 (포트 5173)
브라우저에서 확인:
```
http://localhost:5173
```

#### 백엔드 서버 (포트 3000)
브라우저에서 확인:
```
http://localhost:3000/health
```
정상이면: `{"status":"ok","message":"Server is running"}`

### 3. 문제 해결 체크리스트

#### 백엔드 서버가 시작되지 않을 때
1. `server/.env` 파일이 존재하는지 확인
2. Supabase 환경 변수가 설정되어 있는지 확인
3. 터미널에서 에러 메시지 확인

#### 네트워크 오류가 계속 발생할 때
1. 두 서버 모두 실행 중인지 확인
2. 브라우저를 완전히 닫고 다시 열기
3. `Ctrl + F5`로 강력 새로고침
4. 브라우저 개발자 도구(F12) → Network 탭에서 요청 상태 확인

### 4. 환경 변수 확인

`server/.env` 파일 내용:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### 5. 포트 확인 명령어

PowerShell에서:
```powershell
# 포트 3000 확인
netstat -ano | findstr :3000

# 포트 5173 확인
netstat -ano | findstr :5173
```

### 6. 서버 강제 종료

모든 Node 프로세스 종료:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

