# GitHub Secrets 설정 가이드

이 문서는 GitHub Actions 자동 배포를 위한 Secrets 설정 방법을 단계별로 안내합니다.

## 📋 목차

1. [GitHub Secrets 설정 위치](#1-github-secrets-설정-위치)
2. [프론트엔드 배포용 Secrets (Vercel)](#2-프론트엔드-배포용-secrets-vercel)
3. [백엔드 배포용 Secrets (Railway)](#3-백엔드-배포용-secrets-railway)
4. [백엔드 배포용 Secrets (Render)](#4-백엔드-배포용-secrets-render)
5. [필수 환경 변수](#5-필수-환경-변수)

---

## 1. GitHub Secrets 설정 위치

1. GitHub 저장소로 이동: https://github.com/edulinksaas/EduLink
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** > **Actions** 클릭
4. **New repository secret** 버튼 클릭하여 각 Secret 추가

---

## 2. 프론트엔드 배포용 Secrets (Vercel)

### 2.1 VERCEL_TOKEN 생성

1. Vercel 대시보드 접속: https://vercel.com/account/tokens
2. **Create Token** 클릭
3. Token 이름 입력 (예: `EduLink-GitHub-Actions`)
4. Scope는 **Full Account** 선택
5. **Create** 클릭
6. 생성된 토큰을 복사 (한 번만 표시되므로 안전하게 보관)

**GitHub에 추가:**
- Name: `VERCEL_TOKEN`
- Secret: 복사한 토큰 값

### 2.2 VERCEL_ORG_ID 확인

1. Vercel 대시보드 접속: https://vercel.com/account
2. Organization 이름 옆의 설정 아이콘 클릭
3. **Settings** 탭에서 **Organization ID** 확인
   - 또는 URL에서 확인: `https://vercel.com/[org-id]/...`

**GitHub에 추가:**
- Name: `VERCEL_ORG_ID`
- Secret: Organization ID 값

### 2.3 VERCEL_PROJECT_ID 확인

**방법 1: 기존 프로젝트가 있는 경우**
1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** 탭 클릭
3. **General** 섹션에서 **Project ID** 확인

**방법 2: 새 프로젝트를 생성하는 경우**
1. Vercel 대시보드에서 **Add New** > **Project** 클릭
2. GitHub 저장소 연결: `edulinksaas/EduLink`
3. **Root Directory** 설정: `saas` 폴더 선택
4. **Framework Preset**: Vite 선택
5. **Build Command**: `npm run build` (기본값)
6. **Output Directory**: `dist` (기본값)
7. 프로젝트 생성 후 **Settings** > **General**에서 **Project ID** 확인

**GitHub에 추가:**
- Name: `VERCEL_PROJECT_ID`
- Secret: Project ID 값

### 2.4 VITE_API_URL 설정

백엔드 API 서버의 URL을 설정합니다.

**예시:**
- Railway 사용 시: `https://your-backend.railway.app`
- Render 사용 시: `https://your-backend.onrender.com`
- 로컬 개발: `http://localhost:3000`

**GitHub에 추가:**
- Name: `VITE_API_URL`
- Secret: 백엔드 API URL

---

## 3. 백엔드 배포용 Secrets (Railway)

### 3.1 RAILWAY_TOKEN 생성

1. Railway 대시보드 접속: https://railway.app/account
2. **Settings** 탭 클릭
3. **New Token** 클릭
4. Token 이름 입력 (예: `EduLink-GitHub-Actions`)
5. **Create Token** 클릭
6. 생성된 토큰을 복사 (한 번만 표시되므로 안전하게 보관)

**GitHub에 추가:**
- Name: `RAILWAY_TOKEN`
- Secret: 복사한 토큰 값

### 3.2 Railway 프로젝트 설정

1. Railway 대시보드에서 **New Project** 클릭
2. **Deploy from GitHub repo** 선택
3. `edulinksaas/EduLink` 저장소 선택
4. **Root Directory** 설정: `edulink-backend` 또는 `saas` (백엔드 위치에 따라)
5. 환경 변수 설정:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (또는 Railway가 자동 할당)
   - 기타 필요한 환경 변수들 (Supabase 키 등)

---

## 4. 백엔드 배포용 Secrets (Render)

### 4.1 RENDER_API_KEY 생성

1. Render 대시보드 접속: https://dashboard.render.com/
2. 우측 상단 프로필 아이콘 클릭 > **Account Settings**
3. **API Keys** 섹션으로 이동
4. **Create API Key** 클릭
5. Key 이름 입력 (예: `EduLink-GitHub-Actions`)
6. **Create API Key** 클릭
7. 생성된 API 키를 복사 (한 번만 표시되므로 안전하게 보관)

**GitHub에 추가:**
- Name: `RENDER_API_KEY`
- Secret: 복사한 API 키 값

### 4.2 RENDER_SERVICE_ID 확인

1. Render 대시보드에서 **New** > **Web Service** 클릭
2. GitHub 저장소 연결: `edulinksaas/EduLink`
3. 서비스 설정:
   - **Name**: `edulink-backend`
   - **Root Directory**: `edulink-backend` 또는 `saas`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. 서비스 생성 후, 서비스 페이지 URL에서 Service ID 확인
   - URL 형식: `https://dashboard.render.com/web/[service-id]`
   - 또는 서비스 설정 페이지에서 확인 가능

**GitHub에 추가:**
- Name: `RENDER_SERVICE_ID`
- Secret: Service ID 값

---

## 5. 필수 환경 변수

백엔드 배포 시 다음 환경 변수들도 설정해야 합니다:

### Supabase 관련 (백엔드)
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `SUPABASE_ANON_KEY`: Supabase Anonymous Key

### 기타 환경 변수
- `NODE_ENV`: `production`
- `PORT`: 포트 번호 (Railway/Render가 자동 할당하는 경우도 있음)

**설정 위치:**
- Railway: 프로젝트 설정 > Variables 탭
- Render: 서비스 설정 > Environment 탭

---

## ✅ 설정 완료 확인

모든 Secrets를 설정한 후:

1. GitHub 저장소의 **Settings** > **Secrets and variables** > **Actions**에서 확인
2. 다음 Secrets가 모두 설정되었는지 확인:
   - ✅ `VERCEL_TOKEN`
   - ✅ `VERCEL_ORG_ID`
   - ✅ `VERCEL_PROJECT_ID`
   - ✅ `VITE_API_URL`
   - ✅ `RAILWAY_TOKEN` (또는 `RENDER_API_KEY` + `RENDER_SERVICE_ID`)

3. 테스트 배포:
   - 코드를 수정하고 `master` 브랜치에 푸시
   - GitHub Actions 탭에서 워크플로우 실행 확인
   - 배포 성공 여부 확인

---

## 🔒 보안 주의사항

- Secrets는 절대 코드에 직접 작성하지 마세요
- 토큰이 노출되면 즉시 재생성하세요
- 정기적으로 토큰을 갱신하는 것을 권장합니다
- 팀원과 공유할 때는 안전한 채널을 사용하세요

---

## 📚 참고 자료

- [GitHub Secrets 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel API 문서](https://vercel.com/docs/rest-api)
- [Railway API 문서](https://docs.railway.app/develop/api)
- [Render API 문서](https://render.com/docs/api)

---

## 🆘 문제 해결

### Secrets가 작동하지 않는 경우

1. Secret 이름이 정확한지 확인 (대소문자 구분)
2. 토큰이 만료되지 않았는지 확인
3. GitHub Actions 로그에서 오류 메시지 확인
4. 각 플랫폼의 대시보드에서 토큰 권한 확인

### 배포가 실패하는 경우

1. 로컬에서 빌드가 성공하는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. 각 플랫폼의 배포 로그 확인

