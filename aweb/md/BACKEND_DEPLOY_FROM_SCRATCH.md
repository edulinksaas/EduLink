# 백엔드 배포 가이드 (처음부터 다시)

이 가이드는 Render를 사용하여 백엔드를 처음부터 배포하는 방법을 단계별로 설명합니다.

---

## 📋 사전 준비사항

### 1. GitHub 저장소 확인
- 백엔드 코드가 GitHub에 푸시되어 있어야 합니다
- 저장소 이름: `edulinksaas/edulinksaas` (또는 본인의 저장소)
- 백엔드 코드 경로: `saas/server/`

### 2. Supabase 정보 준비
다음 정보를 Supabase 대시보드에서 준비하세요:
- **SUPABASE_URL**: 프로젝트 URL (예: `https://xxxxx.supabase.co`)
- **SUPABASE_SERVICE_ROLE_KEY**: Service Role Key (RLS 우회용, 권장)
- 또는 **SUPABASE_ANON_KEY**: Anon Key (RLS 정책 적용됨)

**Supabase 정보 찾는 방법:**
1. https://supabase.com 로그인
2. 프로젝트 선택
3. Settings (왼쪽 메뉴) > API 클릭
4. **Project URL** 복사 → `SUPABASE_URL`
5. **service_role** 키 복사 → `SUPABASE_SERVICE_ROLE_KEY` (권장)
   또는 **anon public** 키 복사 → `SUPABASE_ANON_KEY`

---

## 🚀 1단계: Render 계정 생성

1. https://render.com 접속
2. **"Get Started for Free"** 또는 **"Sign Up"** 클릭
3. **GitHub로 로그인** 선택
4. GitHub 권한 승인
5. 무료 계정 생성 완료

---

## 🛠️ 2단계: GitHub 저장소 연결

1. Render Dashboard에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - **"Connect account"** 클릭 (처음인 경우)
   - GitHub 권한 승인
   - 저장소 선택: `edulinksaas/edulinksaas` (또는 본인의 저장소)
   - **"Connect"** 클릭

   💡 **자세한 연결 방법은 `GITHUB_RENDER_CONNECTION.md` 파일을 참고하세요.**

---

## ⚙️ 3단계: 서비스 설정

### 기본 설정
- **Name**: `edulink-backend` (원하는 이름으로 변경 가능)
- **Environment**: `Node`
- **Region**: `Singapore` (또는 가장 가까운 지역 선택)
- **Branch**: `main` (또는 `master`, 저장소의 기본 브랜치)

### 중요: Root Directory 설정
- **Root Directory**: `saas/server`
  - ⚠️ **주의**: 전체 경로가 아닌 저장소 루트 기준 상대 경로입니다
  - 저장소 구조가 `saas/server/`라면 `saas/server`로 설정
  - 저장소 구조가 `server/`라면 `server`로 설정

### 빌드 및 시작 명령어
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/health` (선택사항, 자동 감지됨)

---

## 🔐 4단계: 환경 변수 설정

**"Environment Variables"** 섹션에서 다음 변수들을 추가하세요:

### 필수 환경 변수
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=10000
NODE_ENV=production
```

### 환경 변수 설명
- **SUPABASE_URL**: Supabase 프로젝트 URL
- **SUPABASE_SERVICE_ROLE_KEY**: Service Role Key (RLS 우회, 권장)
  - 또는 **SUPABASE_ANON_KEY**: Anon Key 사용 가능 (RLS 정책 적용됨)
- **PORT**: `10000` (Render 무료 티어 기본 포트)
- **NODE_ENV**: `production`

### 환경 변수 추가 방법
1. **"Environment Variables"** 섹션으로 스크롤
2. **"Add Environment Variable"** 클릭
3. Key와 Value 입력
4. 각 변수마다 반복

---

## 🚀 5단계: 배포 시작

1. 모든 설정이 완료되었는지 확인:
   - ✅ Root Directory: `saas/server`
   - ✅ Build Command: `npm install`
   - ✅ Start Command: `npm start`
   - ✅ 환경 변수 모두 추가됨

2. **"Create Web Service"** 클릭

3. 배포 진행 상황 확인:
   - **"Events"** 탭에서 빌드 로그 확인
   - **"Logs"** 탭에서 실시간 로그 확인
   - 배포 완료까지 약 5-10분 소요

---

## ✅ 6단계: 배포 확인

### 1. 배포 완료 확인
배포가 완료되면 자동으로 도메인이 생성됩니다:
- 예: `edulink-backend.onrender.com`
- 이 URL을 복사해두세요 (프론트엔드 설정에 필요)

### 2. Health Check 테스트
브라우저에서 다음 URL로 접속:
```
https://your-app-name.onrender.com/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "supabase": "connected"
}
```

### 3. Supabase 연결 확인
```
https://your-app-name.onrender.com/health/supabase
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Supabase connection is working"
}
```

---

## 🔍 문제 해결

### 배포 실패 시

#### 1. 로그 확인
- Render Dashboard > 서비스 선택 > **"Logs"** 탭
- 에러 메시지 확인

#### 2. 일반적인 문제들

**문제: "Cannot find module"**
- **원인**: `package.json`의 dependencies가 설치되지 않음
- **해결**: Root Directory가 올바른지 확인 (`saas/server`)

**문제: "Port already in use"**
- **원인**: PORT 환경 변수가 잘못 설정됨
- **해결**: PORT를 `10000`으로 설정 (Render 기본 포트)

**문제: "Supabase connection failed"**
- **원인**: 환경 변수가 잘못 설정됨
- **해결**: 
  - `SUPABASE_URL`이 올바른지 확인
  - `SUPABASE_SERVICE_ROLE_KEY` 또는 `SUPABASE_ANON_KEY`가 올바른지 확인
  - 환경 변수 이름에 오타가 없는지 확인

**문제: "Root Directory not found"**
- **원인**: Root Directory 경로가 잘못됨
- **해결**: 
  - GitHub 저장소에서 실제 경로 확인
  - 저장소 루트 기준 상대 경로로 설정
  - 예: `saas/server` 또는 `server`

#### 3. 환경 변수 재설정
- 서비스 선택 > **"Environment"** 탭
- 환경 변수 수정 후 **"Save Changes"**
- 자동으로 재배포됨

#### 4. 수동 재배포
- 서비스 선택 > **"Manual Deploy"** > **"Deploy latest commit"**

---

## 📝 배포 후 체크리스트

- [ ] Render 계정 생성 완료
- [ ] GitHub 저장소 연결 완료
- [ ] Web Service 생성 완료
- [ ] Root Directory 설정 (`saas/server`)
- [ ] Build Command 설정 (`npm install`)
- [ ] Start Command 설정 (`npm start`)
- [ ] 환경 변수 추가 완료:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (또는 `SUPABASE_ANON_KEY`)
  - [ ] `PORT=10000`
  - [ ] `NODE_ENV=production`
- [ ] 배포 완료
- [ ] `/health` 엔드포인트 테스트 성공
- [ ] `/health/supabase` 엔드포인트 테스트 성공
- [ ] 백엔드 URL 복사 완료 (프론트엔드 설정에 사용)

---

## 🔗 다음 단계

백엔드 배포가 완료되면:

1. **백엔드 URL 복사**: `https://your-app-name.onrender.com`
2. **프론트엔드 배포**: Vercel에서 프론트엔드 배포 시 `VITE_API_BASE_URL` 환경 변수에 백엔드 URL 설정
   - 예: `VITE_API_BASE_URL=https://your-app-name.onrender.com/api`

---

## 💡 참고사항

### Render 무료 티어 제한사항
- **슬립 모드**: 15분간 요청이 없으면 서비스가 슬립 모드로 전환됨
- **첫 요청 지연**: 슬립 모드에서 깨어날 때 첫 요청이 느릴 수 있음 (약 30초)
- **월 사용량**: 제한이 있지만 일반적인 사용에는 충분함

### 포트 설정
- Render는 자동으로 `PORT` 환경 변수를 설정합니다
- 무료 티어는 기본적으로 포트 `10000`을 사용합니다
- 코드에서 `process.env.PORT || 3000`으로 설정되어 있다면, Render에서 자동으로 `10000`을 사용합니다

### 환경 변수 보안
- 환경 변수는 Render 대시보드에서만 관리됩니다
- 코드에 직접 작성하지 마세요
- `.env` 파일은 로컬 개발용입니다

---

## 📞 추가 도움말

문제가 계속되면:
1. Render 공식 문서: https://render.com/docs
2. Render 커뮤니티: https://community.render.com
3. 프로젝트 로그 확인: Render Dashboard > Logs 탭
