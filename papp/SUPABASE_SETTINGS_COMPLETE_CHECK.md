# Supabase 설정 완전 확인 가이드

## 🔴 500 에러가 계속 발생하는 경우

Supabase 500 에러가 계속 발생한다면, 설정을 처음부터 다시 확인해야 합니다.

## ✅ 완전한 설정 확인 체크리스트

### 1단계: Supabase 프로젝트 정보 확인

1. **Supabase 대시보드** 접속
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Settings** > **API** 메뉴로 이동
   - **Project URL** 확인 및 복사
     - 예: `https://abcdefghijklmnop.supabase.co`
   - **anon public** 키 확인 (앱에서 사용 중인 키)

3. **Project URL 기반 Redirect URL 구성**
   ```
   https://[PROJECT_ID].supabase.co/auth/v1/callback
   ```
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
   - 이 URL을 정확히 복사하세요!

### 2단계: Supabase Authentication 설정

#### A. URL Configuration 확인

1. **Authentication** > **URL Configuration** 메뉴로 이동

2. **Site URL** 확인:
   - `parentapp://` 또는 앱의 메인 URL

3. **Redirect URLs** 확인:
   - 다음이 추가되어 있어야 함:
     ```
     parentapp://auth/callback
     ```
   - `localhost:3000`이 있으면 삭제
   - 다른 잘못된 URL이 있으면 삭제

4. **저장** 버튼 클릭

#### B. Kakao Provider 설정 확인

1. **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **모든 설정을 처음부터 다시 확인:**

   **Enabled**: 
   - [ ] ON으로 설정되어 있는가?

   **Client ID (REST API Key)**:
   - [ ] Kakao Developers Console의 REST API Key와 정확히 일치하는가?
   - [ ] 앞뒤 공백이 없는가?
   - [ ] 예: `22459018fd3a61dbf1ed0c826f3b95b4`

   **Client Secret**:
   - [ ] Kakao Developers Console의 클라이언트 시크릿과 정확히 일치하는가?
   - [ ] 앞뒤 공백이 없는가?
   - [ ] 전체를 정확히 복사했는가?
   - [ ] 클라이언트 시크릿이 활성화되어 있는가?

   **Redirect URL**:
   - [ ] `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식인가?
   - [ ] `[PROJECT_ID]`가 Settings > API의 Project URL과 일치하는가?
   - [ ] `localhost:3000`이 아닌가?
   - [ ] 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

   **Allow users without an email**:
   - [ ] ON으로 설정되어 있는가?

3. **모든 설정 확인 후 Save 버튼 클릭**

4. **페이지 새로고침 후 다시 확인**

### 3단계: Kakao Developers Console 설정 확인

1. **Kakao Developers Console** 접속
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 에듀링크 앱 선택

3. **앱 키** > **REST API 키** 확인:
   - REST API Key 확인
   - 클라이언트 시크릿 확인 및 활성화 상태 확인

4. **제품 설정** > **카카오 로그인** > **Redirect URI** 확인:
   - [ ] `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식인가?
   - [ ] Supabase Settings > API의 Project URL과 일치하는가?
   - [ ] 정확히 입력되어 있는가? (오타 없이)
   - [ ] 저장되어 있는가?

5. **동의 항목** 확인:
   - 프로필 닉네임: 활성화
   - 프로필 사진: 활성화
   - 카카오계정(이메일): 권한 없음 (괜찮음, 코드에서 처리)

### 4단계: 설정 일치 확인

**중요**: 다음 세 곳의 설정이 모두 일치해야 합니다!

1. **Supabase Settings > API > Project URL**
   - 예: `https://abcdefghijklmnop.supabase.co`

2. **Supabase Authentication > Providers > Kakao > Redirect URL**
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

3. **Kakao Developers Console > Redirect URI**
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

**모두 동일한 프로젝트 ID를 사용해야 합니다!**

### 5단계: 클라이언트 시크릿 재확인

**가장 흔한 원인입니다!**

1. **Kakao Developers Console**에서 클라이언트 시크릿 다시 확인
   - 앱 키 > REST API 키 > 클라이언트 시크릿 클릭
   - 전체 클라이언트 시크릿 복사 (전체 선택 후 복사)

2. **Supabase**에서 클라이언트 시크릿 필드 완전히 지우기
   - Authentication > Providers > Kakao
   - Client Secret 필드의 모든 내용 선택 (Ctrl+A)
   - 삭제

3. **새로 붙여넣기**
   - 클라이언트 시크릿 붙여넣기
   - 앞뒤 공백 확인 (없어야 함)
   - 전체가 정확히 입력되었는지 확인

4. **Save 버튼 클릭**

5. **페이지 새로고침 후 다시 확인**

### 6단계: 앱 재시작

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 🔍 Supabase 로그 확인

500 에러의 구체적인 원인을 확인하려면:

1. **Supabase 대시보드** > **Logs** 메뉴
2. **Auth Logs** 확인
3. 에러 발생 시점의 로그 확인
4. 구체적인 에러 메시지 확인

## 📝 최종 체크리스트

### Supabase 설정:
- [ ] Settings > API > Project URL 확인
- [ ] Authentication > URL Configuration > Redirect URLs 확인
- [ ] Authentication > Providers > Kakao > Enabled: ON
- [ ] Authentication > Providers > Kakao > Client ID: 정확히 입력됨
- [ ] Authentication > Providers > Kakao > Client Secret: 정확히 입력됨 (재입력 완료)
- [ ] Authentication > Providers > Kakao > Redirect URL: Project URL + `/auth/v1/callback`
- [ ] Authentication > Providers > Kakao > Allow users without an email: ON
- [ ] 모든 설정 후 Save 버튼 클릭
- [ ] 페이지 새로고침 후 확인

### Kakao Developers Console:
- [ ] REST API Key 확인
- [ ] 클라이언트 시크릿 활성화 확인
- [ ] Redirect URI: Supabase Project URL + `/auth/v1/callback`
- [ ] 저장 확인

### 설정 일치 확인:
- [ ] Supabase Project URL과 Redirect URL의 프로젝트 ID 일치
- [ ] Kakao Redirect URI와 Supabase Redirect URL 일치
- [ ] 클라이언트 시크릿 일치

## 🆘 여전히 안 되는 경우

1. **Supabase 로그 확인**
   - Logs > Auth Logs에서 구체적인 에러 확인

2. **클라이언트 시크릿 재생성**
   - Kakao Developers Console에서 클라이언트 시크릿 재생성
   - 새로 생성된 클라이언트 시크릿을 Supabase에 입력

3. **Supabase 프로젝트 재생성 고려**
   - 모든 설정을 확인했는데도 안 되면
   - 새 Supabase 프로젝트 생성 후 다시 설정

## 요약

**500 에러 해결 순서:**

1. ✅ **Supabase Project URL 정확히 확인**
2. ✅ **모든 설정을 처음부터 다시 확인**
3. ✅ **클라이언트 시크릿 재입력** (가장 중요!)
4. ✅ **세 곳의 설정이 모두 일치하는지 확인**
5. ✅ **앱 재시작**

**핵심**: 클라이언트 시크릿과 Redirect URL이 정확히 설정되어 있고, 세 곳의 설정이 모두 일치해야 합니다!
