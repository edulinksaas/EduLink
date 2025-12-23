# Supabase 500 에러 상세 해결 가이드

## 🔴 에러 상황

카카오 로그인 시 다음 URL에서 500 에러 발생:
```
https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
```

에러 메시지:
```json
{
  "code": 500,
  "error_code": "unexpected_failure",
  "msg": "Unexpected failure, please check server logs for more information"
}
```

## ✅ 해결 방법

### 1단계: Supabase 프로젝트 URL 확인

**중요**: URL에서 프로젝트 ID를 확인했습니다: `munydihxxzojgquumdyt`

1. **Supabase 대시보드** 접속
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Settings** > **API** 메뉴로 이동
   - **Project URL** 확인
   - 정확히 `https://munydihxxzojgquumdyt.supabase.co`인지 확인
   - 다르다면 정확한 URL을 사용하세요!

### 2단계: Supabase Kakao Provider 설정 완전 재설정

**중요**: 모든 설정을 처음부터 다시 확인하세요!

1. **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **모든 설정 확인 및 재입력:**

   **Enabled**: 
   - [ ] OFF로 변경 → Save
   - [ ] 잠시 대기 (5초)
   - [ ] ON으로 변경

   **Client ID (REST API Key)**:
   - [ ] 필드 내용 확인
   - [ ] Kakao Developers Console의 REST API Key와 정확히 일치하는지 확인
   - [ ] 다르다면 삭제 후 다시 입력
   - [ ] 예: `22459018fd3a61dbf1ed0c826f3b95b4`

   **Client Secret**:
   - [ ] **필드 내용 완전히 삭제** (Ctrl+A → Delete)
   - [ ] Kakao Developers Console에서 클라이언트 시크릿 다시 확인
   - [ ] 앱 키 > REST API 키 > 클라이언트 시크릿 클릭
   - [ ] 전체 클라이언트 시크릿 복사 (전체 선택 후 복사)
   - [ ] Supabase에 붙여넣기
   - [ ] 앞뒤 공백 확인 (없어야 함)
   - [ ] 전체가 정확히 입력되었는지 확인

   **Redirect URL**:
   - [ ] 필드 내용 확인
   - [ ] 정확히 다음 형식인지 확인:
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
   - [ ] `https://`로 시작하는지 확인
   - [ ] `.supabase.co`로 끝나는지 확인
   - [ ] `/auth/v1/callback`이 정확히 포함되어 있는지 확인
   - [ ] 공백이나 특수문자가 없는지 확인
   - [ ] 다르다면 삭제 후 정확히 입력

   **Allow users without an email**:
   - [ ] ON으로 설정

3. **Save 버튼 클릭**

4. **페이지 새로고침 (F5)**

5. **다시 확인**
   - 모든 설정이 올바르게 저장되었는지 확인

### 3단계: Kakao Developers Console 설정 확인

1. **Kakao Developers Console** 접속
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 에듀링크 앱 선택

3. **제품 설정** > **카카오 로그인** > **Redirect URI** 확인:
   - [ ] 다음이 정확히 등록되어 있는지 확인:
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
   - [ ] 오타가 없는지 확인
   - [ ] 저장되어 있는지 확인

4. **앱 키** > **REST API 키** 확인:
   - [ ] REST API Key 확인
   - [ ] 클라이언트 시크릿 활성화 확인
   - [ ] Supabase에 입력한 값과 일치하는지 확인

### 4단계: Supabase URL Configuration 확인

1. **Authentication** > **URL Configuration** 메뉴로 이동

2. **Redirect URLs** 확인:
   - [ ] 다음이 추가되어 있는지 확인:
     ```
     parentapp://auth/callback
     ```
   - [ ] `localhost:3000`이 있으면 삭제
   - [ ] 다른 잘못된 URL이 있으면 삭제

3. **Save 버튼 클릭**

### 5단계: Supabase 로그 확인

**중요**: 구체적인 에러 원인을 확인하려면 로그를 확인하세요!

1. **Supabase 대시보드** > **Logs** 메뉴
2. **Auth Logs** 확인
3. 에러 발생 시점의 로그 확인
4. 구체적인 에러 메시지 확인

로그에서 확인할 수 있는 정보:
- 클라이언트 시크릿 검증 실패
- Redirect URL 불일치
- Kakao API 응답 오류
- 기타 서버 측 오류

### 6단계: 클라이언트 시크릿 재생성 (최후의 수단)

모든 설정을 확인했는데도 안 되면:

1. **Kakao Developers Console**에서 클라이언트 시크릿 재생성
   - 앱 키 > REST API 키 > 클라이언트 시크릿
   - 기존 클라이언트 시크릿 비활성화 또는 삭제
   - 새로 생성

2. **새로 생성된 클라이언트 시크릿을 Supabase에 입력**
   - Authentication > Providers > Kakao
   - Client Secret 필드에 새 클라이언트 시크릿 입력
   - Save 버튼 클릭

### 7단계: 앱 재시작

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 🔍 확인 사항 체크리스트

### Supabase 설정:
- [ ] Settings > API > Project URL: `https://munydihxxzojgquumdyt.supabase.co`
- [ ] Authentication > Providers > Kakao > Enabled: ON
- [ ] Authentication > Providers > Kakao > Client ID: Kakao REST API Key와 일치
- [ ] Authentication > Providers > Kakao > Client Secret: 정확히 입력됨 (재입력 완료)
- [ ] Authentication > Providers > Kakao > Redirect URL: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
- [ ] Authentication > Providers > Kakao > Allow users without an email: ON
- [ ] Authentication > URL Configuration > Redirect URLs: `parentapp://auth/callback` 추가됨
- [ ] 모든 설정 후 Save 버튼 클릭
- [ ] 페이지 새로고침 후 확인

### Kakao Developers Console:
- [ ] Redirect URI: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
- [ ] 클라이언트 시크릿 활성화됨
- [ ] 클라이언트 시크릿이 Supabase와 일치함

### 설정 일치 확인:
- [ ] Supabase Project URL과 Redirect URL의 프로젝트 ID 일치 (`munydihxxzojgquumdyt`)
- [ ] Kakao Redirect URI와 Supabase Redirect URL 일치
- [ ] 클라이언트 시크릿 일치

## ⚠️ 주의사항

1. **클라이언트 시크릿 정확성**
   - 클라이언트 시크릿을 복사할 때 앞뒤 공백이 포함되지 않도록 주의
   - 전체를 정확히 복사했는지 확인
   - 수동으로 입력하지 말고 복사해서 붙여넣기

2. **Redirect URL 정확성**
   - URL에 오타가 없는지 확인
   - `https://`로 시작하는지 확인
   - `.supabase.co`로 끝나는지 확인
   - `/auth/v1/callback`이 정확히 포함되어 있는지 확인

3. **저장 확인**
   - Supabase에서 설정 변경 후 반드시 **Save** 버튼 클릭
   - 저장 후 페이지 새로고침하여 확인

## 🆘 여전히 안 되는 경우

1. **Supabase 로그 확인**
   - Logs > Auth Logs에서 구체적인 에러 확인
   - 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다

2. **Supabase 지원팀 문의**
   - Supabase 대시보드에서 지원팀에 문의
   - 에러 로그와 함께 문의

3. **새 Supabase 프로젝트 생성 고려**
   - 모든 설정을 확인했는데도 안 되면
   - 새 Supabase 프로젝트 생성 후 다시 설정

## 요약

**500 에러 해결 순서:**

1. ✅ **Supabase Project URL 확인** (`munydihxxzojgquumdyt`)
2. ✅ **Kakao Provider 설정 완전 재설정**
   - Enabled OFF → ON
   - Client Secret 재입력
   - Redirect URL 정확히 확인
3. ✅ **Kakao Developers Console 설정 확인**
4. ✅ **Supabase 로그 확인** (구체적인 에러 원인 파악)
5. ✅ **앱 재시작**

**핵심**: 클라이언트 시크릿을 완전히 지우고 다시 입력하고, Redirect URL이 정확히 `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`인지 확인하세요!
