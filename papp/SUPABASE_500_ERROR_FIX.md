# Supabase 500 에러 해결 가이드

## 🔴 에러 원인

카카오 로그인 시 Supabase에서 500 에러가 발생합니다:
```json
{
  "code": 500,
  "error_code": "unexpected_failure",
  "msg": "Unexpected failure, please check server logs for more information"
}
```

**가능한 원인:**
1. 클라이언트 시크릿이 잘못되었거나 누락됨
2. Redirect URL이 잘못 설정됨
3. Kakao OAuth 설정이 Supabase와 일치하지 않음
4. Supabase 프로젝트 설정 문제

## ✅ 해결 방법

### 1단계: Supabase 설정 확인 (가장 중요!)

#### A. Authentication > Providers > Kakao 설정 확인

1. **Supabase 대시보드** 접속
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Authentication** > **Providers** > **Kakao** 메뉴로 이동

3. **모든 설정 확인:**
   - ✅ **Enabled**: ON
   - ✅ **Client ID (REST API Key)**: Kakao Developers Console의 REST API Key
     - 예: `22459018fd3a61dbf1ed0c826f3b95b4`
   - ✅ **Client Secret**: Kakao Developers Console의 클라이언트 시크릿
     - 정확히 입력되어 있는지 확인
     - 앞뒤 공백 없이 정확히 복사했는지 확인
   - ✅ **Redirect URL**: 다음 형식이어야 함
     ```
     https://[PROJECT_ID].supabase.co/auth/v1/callback
     ```
     - `[PROJECT_ID]`는 실제 프로젝트 ID로 대체
     - 예: `https://quumdyt.supabase.co/auth/v1/callback`
   - ✅ **Allow users without an email**: ON

4. **저장**
   - **Save** 버튼 클릭
   - 페이지 새로고침 후 다시 확인

#### B. Authentication > URL Configuration 확인

1. **Authentication** > **URL Configuration** 메뉴로 이동

2. **Redirect URLs** 확인:
   - 다음이 추가되어 있어야 함:
     ```
     parentapp://auth/callback
     ```
   - `localhost:3000`이 있으면 삭제

3. **저장**

### 2단계: Kakao Developers Console 설정 확인

1. **Kakao Developers Console** 접속
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 에듀링크 앱 선택

3. **제품 설정** > **카카오 로그인** > **Redirect URI** 확인:
   - 다음이 정확히 등록되어 있어야 함:
     ```
     https://quumdyt.supabase.co/auth/v1/callback
     ```
   - 정확한 URL인지 확인 (오타 없이)
   - 저장 확인

4. **앱 키** > **REST API 키** > **클라이언트 시크릿** 확인:
   - 클라이언트 시크릿이 활성화되어 있는지 확인
   - Supabase에 입력한 값과 정확히 일치하는지 확인

### 3단계: 클라이언트 시크릿 재확인 및 재입력

**중요**: 클라이언트 시크릿이 가장 흔한 원인입니다!

1. **Kakao Developers Console**에서 클라이언트 시크릿 다시 확인
   - 앱 키 > REST API 키 > 클라이언트 시크릿 클릭
   - 전체 클라이언트 시크릿 복사

2. **Supabase**에서 클라이언트 시크릿 재입력
   - Authentication > Providers > Kakao
   - **Client Secret** 필드에 붙여넣기
   - 앞뒤 공백 제거 확인
   - **Save** 버튼 클릭

3. **페이지 새로고침 후 다시 확인**

### 4단계: Supabase 프로젝트 URL 확인

1. **Supabase 대시보드** > **Settings** > **API**
2. **Project URL** 확인
   - 예: `https://quumdyt.supabase.co`
3. **Redirect URL**이 다음과 일치하는지 확인:
   ```
   https://quumdyt.supabase.co/auth/v1/callback
   ```

### 5단계: 앱 재시작

```bash
cd app
# 개발 서버 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 🔍 Supabase 로그 확인

Supabase 대시보드에서 로그를 확인할 수 있습니다:

1. **Supabase 대시보드** > **Logs** 메뉴
2. **Auth Logs** 확인
3. 에러 발생 시점의 로그 확인
4. 구체적인 에러 메시지 확인

## 📝 체크리스트

### Supabase 설정:
- [ ] Authentication > Providers > Kakao > Enabled: ON
- [ ] Client ID (REST API Key): 정확히 입력됨
- [ ] Client Secret: 정확히 입력됨 (앞뒤 공백 없음)
- [ ] Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식
- [ ] Allow users without an email: ON
- [ ] Save 버튼 클릭
- [ ] 페이지 새로고침 후 확인

### Kakao Developers Console:
- [ ] Redirect URI: `https://[PROJECT_ID].supabase.co/auth/v1/callback` 정확히 등록됨
- [ ] 클라이언트 시크릿 활성화됨
- [ ] 클라이언트 시크릿이 Supabase와 일치함

### 앱:
- [ ] 개발 서버 재시작
- [ ] 앱 재시작
- [ ] 카카오 로그인 테스트

## ⚠️ 주의사항

1. **클라이언트 시크릿 정확성**
   - 클라이언트 시크릿을 복사할 때 앞뒤 공백이 포함되지 않도록 주의
   - 전체를 정확히 복사했는지 확인

2. **Redirect URL 정확성**
   - URL에 오타가 없는지 확인
   - `https://`로 시작하는지 확인
   - `/auth/v1/callback`으로 끝나는지 확인

3. **저장 확인**
   - Supabase에서 설정 변경 후 반드시 **Save** 버튼 클릭
   - 저장 후 페이지 새로고침하여 확인

## 🆘 여전히 안 되는 경우

1. **Supabase 로그 확인**
   - Logs > Auth Logs에서 구체적인 에러 확인

2. **클라이언트 시크릿 재생성**
   - Kakao Developers Console에서 클라이언트 시크릿 재생성
   - 새로 생성된 클라이언트 시크릿을 Supabase에 입력

3. **Supabase 지원팀 문의**
   - Supabase 대시보드에서 지원팀에 문의
   - 에러 로그와 함께 문의

## 요약

**Supabase 500 에러 해결 순서:**

1. ✅ **Supabase 설정 확인** (가장 중요!)
   - Client Secret 정확성 확인
   - Redirect URL 정확성 확인
   - Save 버튼 클릭

2. ✅ **Kakao Developers Console 설정 확인**
   - Redirect URI 정확성 확인
   - 클라이언트 시크릿 확인

3. ✅ **앱 재시작**
   - 개발 서버 재시작
   - 앱 재시작

**핵심**: 클라이언트 시크릿과 Redirect URL이 정확히 설정되어 있는지 확인하는 것이 가장 중요합니다!
