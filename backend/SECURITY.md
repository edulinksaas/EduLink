# 보안 가이드

이 문서는 에듀링크 백엔드의 보안 설정 및 모범 사례를 설명합니다.

## 🔒 주요 보안 기능

### 1. 인증 및 인가
- **JWT 토큰 기반 인증**: 모든 API 요청에 JWT 토큰 필요
- **환경 변수 필수화**: `JWT_SECRET`은 반드시 환경 변수로 설정해야 함
- **강력한 비밀번호 정책**: 최소 8자, 숫자/특수문자 포함 필수

### 2. Rate Limiting (요청 제한)
- **일반 API**: 15분당 최대 100개 요청
- **인증 API**: 15분당 최대 5번 시도
- **비밀번호 변경**: 1시간당 최대 3번 시도

### 3. CORS (Cross-Origin Resource Sharing)
- 프로덕션 환경에서는 특정 origin만 허용
- 개발 환경에서는 localhost 허용
- 환경 변수 `ALLOWED_ORIGINS`로 허용할 origin 설정 가능

### 4. 보안 헤더 (Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- XSS Protection
- 기타 보안 헤더 자동 설정

### 5. 입력 검증 및 Sanitization
- 모든 사용자 입력 검증 및 sanitization
- XSS 공격 방지
- SQL Injection 방지 (Supabase 사용으로 자동 방지)
- 학원 코드 형식 검증 (8자리 영숫자)

### 6. 에러 처리
- 프로덕션 환경에서 민감한 정보 노출 방지
- 스택 트레이스는 개발 환경에서만 제공
- 데이터베이스 에러 등 상세 정보 숨김

### 7. 비밀번호 보안
- bcrypt 해싱 (salt rounds: 12)
- 평문 비밀번호 저장 금지
- 타이밍 공격 방지 (사용자 존재 여부 노출 방지)

## 📋 환경 변수 설정

### 필수 환경 변수

`.env` 파일에 다음 변수들을 반드시 설정해야 합니다:

```env
# JWT 설정 (필수)
JWT_SECRET=your-strong-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Supabase 설정 (필수)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 서버 설정
PORT=3000
NODE_ENV=production

# CORS 설정 (프로덕션 권장)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

### JWT_SECRET 생성 방법

강력한 JWT_SECRET을 생성하려면:

```bash
# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL 사용
openssl rand -hex 32
```

## 🚀 배포 전 체크리스트

- [ ] `JWT_SECRET`이 강력한 값으로 설정되어 있는지 확인 (최소 32자)
- [ ] `NODE_ENV=production`으로 설정되어 있는지 확인
- [ ] `ALLOWED_ORIGINS`에 프로덕션 도메인만 포함되어 있는지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 데이터베이스 연결 정보가 안전하게 관리되는지 확인
- [ ] HTTPS가 활성화되어 있는지 확인
- [ ] Rate limiting이 적절히 설정되어 있는지 확인

## 🔍 보안 모니터링

### 로그 확인
- 인증 실패 시도 모니터링
- Rate limiting 트리거 모니터링
- 비정상적인 요청 패턴 감지

### 정기적인 보안 점검
- 의존성 취약점 스캔 (`npm audit`)
- 환경 변수 노출 확인
- API 엔드포인트 접근 권한 검토

## ⚠️ 주의사항

1. **절대 하드코딩 금지**: 비밀번호, API 키 등을 코드에 직접 작성하지 마세요
2. **기본값 사용 금지**: JWT_SECRET 등의 기본값을 프로덕션에서 사용하지 마세요
3. **디버깅 정보 제거**: 프로덕션 환경에서는 상세한 에러 정보를 노출하지 마세요
4. **정기적인 업데이트**: 보안 패키지 및 의존성을 정기적으로 업데이트하세요

## 📚 추가 리소스

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js 보안 모범 사례](https://nodejs.org/en/docs/guides/security/)
- [Express 보안 모범 사례](https://expressjs.com/en/advanced/best-practice-security.html)

