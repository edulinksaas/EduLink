# 보안 업데이트 배포 가이드

이 문서는 보안 개선 사항을 배포하는 방법을 설명합니다.

## 🚀 배포 전 확인 사항

### 1. 환경 변수 확인

배포 플랫폼(Railway 또는 Render)에서 다음 환경 변수가 설정되어 있는지 확인하세요:

#### 필수 환경 변수
```env
JWT_SECRET=your-strong-secret-key-minimum-32-characters-long
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
PORT=3000  # 또는 Render의 경우 10000
```

#### 선택적 환경 변수 (프로덕션 권장)
```env
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
JWT_EXPIRES_IN=7d
```

### 2. JWT_SECRET 생성

강력한 JWT_SECRET이 없다면 다음 명령어로 생성하세요:

```bash
# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 32
```

## 📦 배포 단계

### Railway 사용 시

1. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "보안 개선: Rate limiting, Helmet, 입력 검증 강화"
   git push origin main  # 또는 clean-structure 브랜치
   ```

2. **Railway 대시보드에서 환경 변수 확인**
   - 프로젝트 선택 > Variables 탭
   - `JWT_SECRET`이 설정되어 있는지 확인
   - 없으면 추가 (강력한 값으로!)

3. **자동 재배포**
   - Railway는 GitHub 푸시 시 자동으로 재배포됩니다
   - 또는 수동으로 "Redeploy" 클릭

4. **배포 확인**
   - 배포 로그에서 에러 확인
   - Health check: `https://your-app.up.railway.app/health`

### Render 사용 시

1. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "보안 개선: Rate limiting, Helmet, 입력 검증 강화"
   git push origin main
   ```

2. **Render 대시보드에서 환경 변수 확인**
   - 서비스 선택 > Environment 탭
   - `JWT_SECRET`이 설정되어 있는지 확인
   - 없으면 "Add Environment Variable" 클릭하여 추가

3. **수동 재배포**
   - "Manual Deploy" > "Deploy latest commit" 클릭
   - 또는 자동 배포가 활성화되어 있으면 자동으로 재배포됨

4. **배포 확인**
   - 배포 로그에서 에러 확인
   - Health check: `https://your-app.onrender.com/health`

## ⚠️ 중요: JWT_SECRET 설정

**JWT_SECRET이 없으면 서버가 시작되지 않습니다!**

서버 시작 시 다음 검증이 수행됩니다:
- `JWT_SECRET` 환경 변수 존재 확인
- 기본값(`your-secret-key-change-in-production`) 사용 시 서버 시작 불가
- 최소 32자 길이 권장

## 🔍 배포 후 확인

1. **서버 로그 확인**
   - Railway/Render 대시보드에서 로그 확인
   - "✅ Supabase 연결 성공!" 메시지 확인
   - 에러가 없으면 정상 배포

2. **Health Check**
   ```bash
   curl https://your-backend-url/health
   ```
   응답 예시:
   ```json
   {
     "status": "ok",
     "message": "Server is running"
   }
   ```

3. **API 테스트**
   - 로그인 API 테스트
   - Rate limiting이 작동하는지 확인 (5번 이상 시도 시 제한)

## 🐛 문제 해결

### 서버가 시작되지 않는 경우

1. **환경 변수 확인**
   - `JWT_SECRET`이 설정되어 있는지 확인
   - 기본값이 아닌 강력한 값인지 확인

2. **로그 확인**
   - 배포 플랫폼의 로그에서 에러 메시지 확인
   - 일반적으로 "필수 환경 변수가 설정되지 않았습니다" 메시지가 표시됨

3. **패키지 설치 확인**
   - `package.json`에 새로운 패키지가 추가되었는지 확인
   - `npm install`이 정상적으로 실행되었는지 확인

### Rate Limiting이 너무 엄격한 경우

`server/middleware/rateLimiter.js` 파일에서 제한을 조정할 수 있습니다:

```javascript
// 예: 로그인 시도 제한을 5번에서 10번으로 변경
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 변경
  // ...
});
```

## 📝 변경 사항 요약

1. ✅ Rate Limiting 추가 (API 남용 방지)
2. ✅ Helmet 추가 (보안 헤더)
3. ✅ CORS 설정 개선 (특정 origin만 허용)
4. ✅ 입력 검증 및 Sanitization 강화
5. ✅ JWT_SECRET 환경 변수 필수화
6. ✅ 프로덕션 환경에서 디버깅 정보 제거
7. ✅ 비밀번호 보안 강화 (bcrypt salt rounds 증가)
8. ✅ 에러 핸들러 개선 (민감한 정보 노출 방지)

## 🔗 참고 문서

- `SECURITY.md`: 상세한 보안 가이드
- `README_ENV.md`: 환경 변수 설정 가이드

