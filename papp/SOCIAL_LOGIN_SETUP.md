# 소셜 로그인 설정 가이드

이 가이드는 구글, 카카오, 네이버 소셜 로그인을 설정하는 방법을 설명합니다.

## 1. 패키지 설치

먼저 필요한 패키지를 설치하세요:

```bash
cd app
npm install
```

설치되는 패키지:
- `expo-auth-session` - OAuth 인증 세션 관리
- `expo-web-browser` - 웹 브라우저 인증
- `expo-linking` - 딥링크 처리
- `react-native-url-polyfill` - URL 폴리필

## 2. Supabase 설정

### 2.1 Supabase 대시보드에서 프로바이더 활성화

1. Supabase 대시보드에 로그인
2. **Authentication** > **Providers** 메뉴로 이동
3. 각 프로바이더를 활성화하고 설정

### 2.2 구글 로그인 설정

1. **Google Cloud Console** 설정:
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - **API 및 서비스** > **사용자 인증 정보** 이동
   - **OAuth 2.0 클라이언트 ID 만들기** 클릭
   - 애플리케이션 유형: **웹 애플리케이션** 선택
   - 승인된 리디렉션 URI 추가:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

2. **Supabase 설정**:
   - Supabase 대시보드 > **Authentication** > **Providers** > **Google**
   - **Enabled** 토글 활성화
   - **Client ID (for OAuth)**에 Google 클라이언트 ID 입력
   - **Client Secret (for OAuth)**에 Google 클라이언트 보안 비밀번호 입력
   - **Save** 클릭

### 2.3 카카오 로그인 설정

1. **Kakao Developers Console** 설정:
   - [Kakao Developers](https://developers.kakao.com/) 접속
   - 내 애플리케이션 추가 또는 기존 앱 선택
   - **앱 설정** > **앱 키**에서 **REST API 키** 확인
   - **제품 설정** > **카카오 로그인** 활성화
   - **카카오 로그인** > **Redirect URI** 설정:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - **고급** > **Client Secret** 생성 및 복사

2. **Supabase 설정**:
   - Supabase 대시보드 > **Authentication** > **Providers** > **Kakao**
   - **Enabled** 토글 활성화
   - **Client ID (for OAuth)**에 Kakao REST API 키 입력
   - **Client Secret (for OAuth)**에 Kakao Client Secret 입력
   - **Save** 클릭

### 2.4 네이버 로그인 설정

1. **Naver Developers Console** 설정:
   - [Naver Developers](https://developers.naver.com/) 접속
   - **Application** > **애플리케이션 등록**
   - 서비스 환경: **Web** 선택
   - **Callback URL** 설정:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - **Client ID**와 **Client Secret** 확인

2. **Supabase 설정**:
   - Supabase 대시보드 > **Authentication** > **Providers** > **Naver**
   - **Enabled** 토글 활성화
   - **Client ID (for OAuth)**에 Naver Client ID 입력
   - **Client Secret (for OAuth)**에 Naver Client Secret 입력
   - **Save** 클릭

## 3. 앱 설정 확인

### 3.1 app.json 확인

`app.json` 파일에 `scheme`이 설정되어 있는지 확인:

```json
{
  "expo": {
    "scheme": "parentapp",
    ...
  }
}
```

### 3.2 환경 변수 확인

`.env` 파일에 Supabase 설정이 되어 있는지 확인:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 테스트

1. 앱 재시작:
   ```bash
   cd app
   npm start
   ```

2. 로그인 화면에서 소셜 로그인 버튼 클릭
3. 각 소셜 로그인 프로바이더로 로그인 테스트

## 5. 문제 해결

### 소셜 로그인이 작동하지 않는 경우

1. **Redirect URI 확인**:
   - 각 프로바이더 콘솔에서 Redirect URI가 정확히 설정되었는지 확인
   - Supabase 프로젝트 URL과 일치해야 함

2. **클라이언트 ID/Secret 확인**:
   - Supabase 대시보드에서 입력한 값이 정확한지 확인
   - 공백이나 특수문자가 포함되지 않았는지 확인

3. **Supabase 프로바이더 활성화 확인**:
   - Supabase 대시보드에서 각 프로바이더가 **Enabled** 상태인지 확인

4. **앱 재시작**:
   - 환경 변수나 설정 변경 후 앱을 완전히 재시작

### "로그인 URL을 가져올 수 없습니다" 오류

- Supabase 프로바이더가 제대로 활성화되지 않았을 수 있습니다
- Supabase 대시보드에서 프로바이더 설정을 다시 확인하세요

### 세션 설정 오류

- Redirect URI가 올바르게 설정되었는지 확인
- 앱의 scheme이 올바르게 설정되었는지 확인 (`app.json`의 `scheme`)

## 6. 추가 참고 자료

- [Supabase 소셜 로그인 가이드](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Kakao OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [Expo AuthSession 문서](https://docs.expo.dev/versions/latest/sdk/auth-session/)
