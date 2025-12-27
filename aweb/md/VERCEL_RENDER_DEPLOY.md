# Vercel + Render 배포 가이드

## 배포 아키텍처
- **프론트엔드**: Vercel (React + Vite)
- **백엔드**: Render (Node.js + Express)

---

## 1단계: 백엔드 배포 (Render)

### 1. Render 계정 생성
1. https://render.com 접속
2. GitHub로 로그인
3. 무료 계정 생성

### 2. 새 Web Service 생성
1. Dashboard에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결
   - "Connect account" 클릭 (아직 안 했다면)
   - GitHub 권한 승인
   - 저장소 선택: `edulinksaas/edulinksaas`

### 3. 서비스 설정
- **Name**: `edulink-backend` (원하는 이름)
- **Environment**: `Node`
- **Region**: `Singapore` (또는 가장 가까운 지역)
- **Branch**: `main` (또는 `master`)
- **Root Directory**: `OneDrive/바탕 화면/에듀링크/saas/server`
  - 또는 저장소 구조에 맞게 조정
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. 환경 변수 설정
"Environment Variables" 섹션에서 추가:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=10000
NODE_ENV=production
```
⚠️ Render는 기본 포트를 10000으로 사용합니다.

### 5. 배포 시작
- "Create Web Service" 클릭
- 배포 완료까지 대기 (약 5-10분)
- 배포 완료 후 자동으로 도메인 생성됨
  - 예: `edulink-backend.onrender.com`
- 이 URL을 복사해두세요 (프론트엔드 설정에 필요)

### 6. 배포 확인
브라우저에서 접속:
```
https://your-app.onrender.com/health
```
`{"status":"ok"}` 응답이 오면 성공!

---

## 2단계: 프론트엔드 배포 (Vercel)

### 1. Vercel 계정 생성
1. https://vercel.com 접속
2. GitHub로 로그인

### 2. 새 프로젝트 생성
1. Dashboard에서 "Add New..." 클릭
2. "Project" 선택
3. GitHub 저장소 선택: `edulinksaas/edulinksaas`

### 3. 프로젝트 설정
- **Framework Preset**: `Vite`
- **Root Directory**: `OneDrive/바탕 화면/에듀링크/saas`
  - 또는 저장소 구조에 맞게 조정
- **Build Command**: `npm run build` (자동 감지됨)
- **Output Directory**: `dist` (자동 감지됨)

### 4. 환경 변수 설정
"Environment Variables" 섹션에서 추가:
```
VITE_API_BASE_URL=https://your-app.onrender.com/api
```
(위에서 복사한 Render 백엔드 URL 사용)

### 5. 배포 시작
- "Deploy" 클릭
- 배포 완료까지 대기 (약 2-3분)
- 자동으로 도메인 생성됨
  - 예: `your-app.vercel.app`

### 6. 배포 확인
- Vercel에서 제공한 도메인으로 접속
- 로그인 페이지가 정상적으로 표시되는지 확인

---

## 3단계: 연결 확인

### 백엔드 확인
```
https://your-app.onrender.com/health
```
응답: `{"status":"ok","message":"Server is running"}`

### 프론트엔드 확인
- Vercel 도메인 접속
- 로그인 테스트
- API 호출이 정상적으로 작동하는지 확인

---

## 문제 해결

### Render 배포 실패
- 로그 확인: Render Dashboard > Logs 탭
- 환경 변수 확인
- Root Directory 경로 확인

### Vercel 배포 실패
- 로그 확인: Vercel Dashboard > Deployments > 로그 확인
- 환경 변수 확인
- `VITE_API_BASE_URL`이 올바른지 확인

### 프론트엔드에서 API 호출 실패
- 브라우저 콘솔 확인 (F12)
- CORS 에러 확인
- `VITE_API_BASE_URL` 확인
- Render 서비스가 실행 중인지 확인

---

## 비용

### Render
- 무료 티어: 제공
- 제한: 15분 비활성 시 슬립 모드 (첫 요청 시 깨어남)

### Vercel
- 무료 티어: 제공
- 제한: 거의 없음 (개인 프로젝트 기준)

---

## 다음 단계

배포 완료 후:
1. 실제 사용자로 테스트
2. 성능 모니터링
3. 에러 로그 확인
4. 필요시 커스텀 도메인 설정

---

## 빠른 체크리스트

### Render (백엔드)
- [ ] 계정 생성 완료
- [ ] Web Service 생성
- [ ] Root Directory 설정
- [ ] 환경 변수 추가
- [ ] 배포 완료
- [ ] 도메인 복사

### Vercel (프론트엔드)
- [ ] 계정 생성 완료
- [ ] 프로젝트 생성
- [ ] Root Directory 설정
- [ ] 환경 변수 추가 (`VITE_API_BASE_URL`)
- [ ] 배포 완료
- [ ] 테스트 완료
