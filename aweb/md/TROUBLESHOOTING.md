# 연결 문제 해결 가이드

## 현재 상태 확인

### 1. 프론트엔드 서버 (포트 5173)
- ✅ 실행 중입니다
- 브라우저에서 `http://localhost:5173` 접속 확인

### 2. 백엔드 서버 (포트 3000)
- ❓ 실행 중인지 확인 필요
- 별도 터미널에서 실행: `cd server && npm run dev`

### 3. Supabase 연결
- ❓ `.env` 파일에 올바른 값이 설정되었는지 확인 필요

## 문제 해결 단계

### 단계 1: 브라우저에서 접속 확인
1. 브라우저를 열고 `http://localhost:5173` 접속
2. 페이지가 로드되는지 확인

### 단계 2: 백엔드 서버 실행
새 터미널 창에서:
```bash
cd server
npm install  # 아직 설치 안 했다면
npm run dev
```

### 단계 3: Supabase 연결 확인
1. `server/.env` 파일 확인
2. 다음 값들이 올바른지 확인:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### 단계 4: 브라우저 콘솔 확인
- F12를 눌러 개발자 도구 열기
- Console 탭에서 정확한 오류 메시지 확인
- Network 탭에서 API 요청이 실패하는지 확인

## 일반적인 문제들

### 문제 1: "ERR_CONNECTION_REFUSED"
- 백엔드 서버가 실행되지 않음
- 해결: 백엔드 서버 실행

### 문제 2: "CORS error"
- 백엔드 서버의 CORS 설정 문제
- 해결: `server/server.js`에서 CORS가 활성화되어 있는지 확인

### 문제 3: "Supabase 연결 실패"
- `.env` 파일의 값이 잘못됨
- 해결: Supabase 프로젝트에서 올바른 URL과 키 확인

