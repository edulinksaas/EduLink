# 빠른 배포 가이드

## 🚀 5분 안에 배포하기

### 1️⃣ 백엔드 배포 (Railway - 추천)

1. **Railway 접속**: https://railway.app
2. **GitHub로 로그인**
3. **"New Project" > "Deploy from GitHub repo"**
4. **저장소 선택**
5. **설정**:
   - Root Directory: `saas/server`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **환경 변수 추가** (Variables 탭):
   ```
   SUPABASE_URL=여기에_수파베이스_URL
   SUPABASE_SERVICE_ROLE_KEY=여기에_서비스_키
   PORT=3000
   NODE_ENV=production
   ```
7. **도메인 복사** (예: `your-app.up.railway.app`)

### 2️⃣ 프론트엔드 배포 (Vercel)

1. **Vercel 접속**: https://vercel.com
2. **GitHub로 로그인**
3. **"Add New..." > "Project"**
4. **저장소 선택**
5. **설정**:
   - Framework Preset: `Vite`
   - Root Directory: `saas`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **환경 변수 추가**:
   ```
   VITE_API_BASE_URL=https://your-app.up.railway.app/api
   ```
   (위에서 복사한 Railway 도메인 사용)
7. **"Deploy" 클릭**

### 3️⃣ 확인

- 백엔드: `https://your-app.up.railway.app/health` 접속 → `{"status":"ok"}` 확인
- 프론트엔드: Vercel에서 제공한 도메인 접속 → 로그인 페이지 확인

## 📝 환경 변수 체크리스트

### 백엔드 (Railway/Render)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PORT` (Railway: 3000, Render: 10000)
- [ ] `NODE_ENV=production`

### 프론트엔드 (Vercel)
- [ ] `VITE_API_BASE_URL` (백엔드 URL + `/api`)

## ❓ 문제 발생 시

1. **백엔드가 응답하지 않음**
   - Railway/Render 로그 확인
   - 환경 변수 확인
   - `/health` 엔드포인트 테스트

2. **프론트엔드에서 API 호출 실패**
   - `VITE_API_BASE_URL` 확인
   - 브라우저 콘솔 확인
   - CORS 에러 확인

3. **로그인 실패**
   - Supabase 환경 변수 확인
   - 백엔드 로그 확인

자세한 내용은 `DEPLOYMENT_GUIDE.md` 참고하세요.
