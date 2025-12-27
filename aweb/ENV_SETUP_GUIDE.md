# 환경 변수 설정 가이드

## 📋 설정 방법

### 1. 백엔드 .env 파일 설정

프로젝트 루트에 `.env` 파일을 생성하거나 수정하고 다음 내용을 추가하세요:

```env
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# 서버 설정
PORT=3000
NODE_ENV=development

# JWT 설정
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 프론트엔드 URL (이메일 인증 링크용)
FRONTEND_URL=http://localhost:5173

# 이메일 설정 (선택사항)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=your-email@gmail.com
# SMTP_FROM_NAME=EduLink

# reCAPTCHA 설정 (선택사항)
# RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 2. 프론트엔드 .env 파일 설정

`saas/.env` 파일을 생성하거나 수정하고 다음 내용을 추가하세요:

```env
# Supabase 설정 (프론트엔드용)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API 설정
VITE_API_BASE_URL=http://localhost:3000/api

# reCAPTCHA 설정 (선택사항)
# VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## 🔑 Supabase 키 찾는 방법

1. [Supabase](https://supabase.com)에 로그인
2. 프로젝트 선택
3. **Settings** (왼쪽 메뉴) → **API** 클릭
4. 다음 값들을 복사:
   - **Project URL** → `SUPABASE_URL` 및 `VITE_SUPABASE_URL`에 사용
   - **anon public key** → `SUPABASE_ANON_KEY` 및 `VITE_SUPABASE_ANON_KEY`에 사용
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`에 사용
     - ⚠️ **주의**: Service Role Key는 절대 공개하지 마세요! 백엔드에서만 사용합니다.

## 📝 중요 사항

### 백엔드 환경 변수
- `SUPABASE_SERVICE_ROLE_KEY`: 백엔드에서 Supabase Admin API를 사용하기 위해 필요합니다.
- `FRONTEND_URL`: 이메일 인증 링크의 리다이렉트 URL로 사용됩니다.
- `JWT_SECRET`: 프로덕션 환경에서는 반드시 강력한 시크릿 키로 변경하세요.

### 프론트엔드 환경 변수
- `VITE_` 접두사가 붙은 변수만 프론트엔드에서 접근 가능합니다.
- `VITE_API_BASE_URL`: 백엔드 API 서버 주소입니다. 개발 환경에서는 `http://localhost:3000/api`를 사용합니다.

## ✅ 설정 확인

설정이 완료되면:

1. **백엔드 서버 재시작**
   ```bash
   npm run dev
   ```
   콘솔에 `✅ Supabase Service Role Key 사용 중` 메시지가 표시되어야 합니다.

2. **프론트엔드 서버 재시작**
   ```bash
   cd saas
   npm run dev
   ```

3. **브라우저 콘솔 확인**
   - 프론트엔드 콘솔에 Supabase 관련 에러가 없어야 합니다.

## 🚨 문제 해결

### Supabase 연결 오류
- `.env` 파일의 Supabase URL과 키가 정확한지 확인하세요.
- Supabase 대시보드에서 프로젝트가 활성화되어 있는지 확인하세요.

### 이메일 인증 링크가 작동하지 않음
- `FRONTEND_URL`이 올바르게 설정되어 있는지 확인하세요.
- Supabase 대시보드에서 이메일 템플릿이 활성화되어 있는지 확인하세요.

