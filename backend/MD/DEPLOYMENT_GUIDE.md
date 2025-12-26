# 배포 가이드

이 가이드는 에듀링크 SaaS 애플리케이션을 배포하는 방법을 설명합니다.

## 배포 아키텍처

- **프론트엔드**: Vercel (무료, 자동 배포)
- **백엔드**: Railway 또는 Render (무료 티어 제공)

## 사전 준비

### 1. GitHub 저장소 준비
- 프로젝트를 GitHub에 푸시합니다
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다

### 2. Supabase 프로젝트 확인
- Supabase 프로젝트 URL과 API 키를 준비합니다
- `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` (또는 `SUPABASE_ANON_KEY`) 필요

---

## 1단계: 백엔드 배포 (Railway)

### Railway 사용 (추천)

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택

3. **서비스 설정**
   - Root Directory: `saas/server` 설정
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **환경 변수 설정**
   - Railway 대시보드에서 "Variables" 탭 클릭
   - 다음 변수 추가:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     PORT=3000
     NODE_ENV=production
     ```

5. **도메인 확인**
   - 배포 완료 후 Railway가 자동으로 도메인 제공 (예: `your-app.up.railway.app`)
   - 이 URL을 복사해두세요 (프론트엔드 설정에 필요)

### Render 사용 (대안)

1. **Render 계정 생성**
   - https://render.com 접속
   - GitHub로 로그인

2. **새 Web Service 생성**
   - "New +" > "Web Service" 클릭
   - 저장소 선택

3. **서비스 설정**
   - Name: `edulink-backend` (원하는 이름)
   - Root Directory: `saas/server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **환경 변수 설정**
   - "Environment" 섹션에서 다음 변수 추가:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     PORT=10000
     NODE_ENV=production
     ```
   - Render는 기본 포트를 10000으로 사용합니다

5. **도메인 확인**
   - 배포 완료 후 Render가 자동으로 도메인 제공 (예: `your-app.onrender.com`)

---

## 2단계: 프론트엔드 배포 (Vercel)

### Vercel 배포

1. **Vercel 계정 생성**
   - https://vercel.com 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "Add New..." > "Project" 클릭
   - GitHub 저장소 선택

3. **프로젝트 설정**
   - Framework Preset: `Vite`
   - Root Directory: `saas` (또는 프로젝트 루트)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 추가:
     ```
     VITE_API_BASE_URL=https://your-backend-url.up.railway.app/api
     ```
   - 또는 Render 사용 시:
     ```
     VITE_API_BASE_URL=https://your-app.onrender.com/api
     ```

5. **배포**
   - "Deploy" 클릭
   - 배포 완료 후 Vercel이 자동으로 도메인 제공 (예: `your-app.vercel.app`)

---

## 3단계: 배포 확인

### 백엔드 확인
1. 브라우저에서 백엔드 Health Check 엔드포인트 접속:
   ```
   https://your-backend-url.up.railway.app/health
   ```
   또는
   ```
   https://your-app.onrender.com/health
   ```

2. 응답 예시:
   ```json
   {
     "status": "ok",
     "message": "Server is running",
     "supabase": "connected"
   }
   ```

### 프론트엔드 확인
1. Vercel에서 제공한 도메인으로 접속
2. 로그인 페이지가 정상적으로 표시되는지 확인
3. 로그인 테스트

---

## 환경 변수 요약

### 백엔드 (Railway/Render)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000 (Railway) 또는 10000 (Render)
NODE_ENV=production
```

### 프론트엔드 (Vercel)
```
VITE_API_BASE_URL=https://your-backend-url/api
```

---

## 문제 해결

### 백엔드가 응답하지 않을 때
1. Railway/Render 로그 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Supabase 연결 상태 확인 (`/health` 엔드포인트)

### 프론트엔드에서 API 호출 실패
1. `VITE_API_BASE_URL`이 올바르게 설정되었는지 확인
2. 브라우저 콘솔에서 CORS 에러 확인
3. 백엔드 CORS 설정 확인 (이미 `cors()` 미들웨어 사용 중)

### 로그인 실패
1. Supabase 환경 변수 확인
2. 백엔드 로그에서 Supabase 연결 상태 확인
3. Supabase 프로젝트의 RLS 정책 확인

---

## 추가 설정 (선택사항)

### 커스텀 도메인 설정
- **Vercel**: Settings > Domains에서 커스텀 도메인 추가
- **Railway**: Settings > Networking에서 커스텀 도메인 추가
- **Render**: Settings > Custom Domains에서 커스텀 도메인 추가

### 자동 배포 설정
- GitHub에 푸시하면 자동으로 배포됩니다
- Vercel, Railway, Render 모두 자동 배포 지원

---

## 비용

- **Vercel**: 무료 (개인 프로젝트)
- **Railway**: 무료 티어 제공 ($5 크레딧/월)
- **Render**: 무료 티어 제공 (15분 비활성 시 슬립 모드)

---

## 다음 단계

배포 완료 후:
1. 실제 사용자로 테스트
2. 성능 모니터링
3. 에러 로그 확인
4. 필요시 스케일링
