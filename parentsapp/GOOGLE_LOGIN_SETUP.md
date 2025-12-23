# 구글 로그인 설정 가이드

이 가이드는 구글 로그인을 설정하는 단계별 방법을 설명합니다.

## 1. 구글 클라우드 콘솔 설정

### 1.1 프로젝트 생성

1. [구글 클라우드 콘솔](https://console.cloud.google.com/) 접속
2. 구글 계정으로 로그인
3. 상단의 프로젝트 선택 드롭다운 클릭
4. **새 프로젝트** 클릭
5. 프로젝트 정보 입력:
   - **프로젝트 이름**: 예) "학부모 전용 앱"
   - **조직**: 선택 사항
   - **위치**: 선택 사항
6. **만들기** 클릭

### 1.2 OAuth 동의 화면 설정

1. 좌측 메뉴에서 **API 및 서비스** > **OAuth 동의 화면** 클릭
2. **사용자 유형** 선택:
   - **외부**: 일반 사용자용 (권장)
   - **내부**: Google Workspace 조직 내부용
3. **만들기** 클릭
4. **앱 정보** 입력:
   - **앱 이름**: 예) "학부모 전용 앱"
   - **사용자 지원 이메일**: 본인의 이메일 주소
   - **앱 로고**: 선택 사항 (나중에 추가 가능)
   - **앱 도메인**: 선택 사항
   - **개발자 연락처 정보**: 본인의 이메일 주소
5. **저장 후 계속** 클릭
6. **범위** 섹션:
   - **범위 추가 또는 삭제** 클릭
   - 다음 범위 확인:
     - `openid`
     - `email`
     - `profile`
   - **업데이트** 클릭
7. **저장 후 계속** 클릭
8. **테스트 사용자** 섹션 (외부 사용자 유형인 경우):
   - 테스트할 이메일 주소 추가 (선택 사항, 나중에 추가 가능)
   - **저장 후 계속** 클릭
9. **요약** 섹션에서 정보 확인 후 **대시보드로 돌아가기** 클릭

### 1.3 OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴에서 **API 및 서비스** > **사용자 인증 정보** 클릭
2. 상단의 **+ 사용자 인증 정보 만들기** 클릭
3. **OAuth 클라이언트 ID** 선택
4. **애플리케이션 유형** 선택:
   - **웹 애플리케이션** 선택
5. **이름** 입력: 예) "학부모 전용 앱 - 웹"
6. **승인된 리디렉션 URI** 섹션에서 **+ URI 추가** 클릭
7. 다음 URI 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   > **주의**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경하세요
8. **만들기** 클릭
9. **OAuth 클라이언트** 팝업에서 다음 정보 확인:
   - **클라이언트 ID**: 이것이 Supabase의 Client ID입니다 (복사해두세요)
   - **클라이언트 보안 비밀번호**: 이것이 Supabase의 Client Secret입니다 (복사해두세요)
   - **중요**: 클라이언트 보안 비밀번호는 이 창을 닫으면 다시 볼 수 없으므로 반드시 복사해두세요!

### 1.4 Android 앱용 OAuth 클라이언트 ID 생성 (선택 사항)

모바일 앱에서 네이티브 구글 로그인을 사용하려면 Android용 클라이언트 ID도 생성해야 합니다:

1. **API 및 서비스** > **사용자 인증 정보** 메뉴로 이동
2. **+ 사용자 인증 정보 만들기** 클릭
3. **OAuth 클라이언트 ID** 선택
4. **애플리케이션 유형**: **Android** 선택
5. **이름** 입력: 예) "학부모 전용 앱 - Android"
6. **패키지 이름** 입력:
   ```
   com.parentapp
   ```
   > **참고**: 이 값은 `app/app.json` 파일의 `android.package` 값입니다.
7. **SHA-1 인증서 지문** 입력:
   - 개발용: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android` 명령어로 확인
   - 프로덕션용: 실제 키스토어의 SHA-1 지문
8. **만들기** 클릭

> **참고**: 현재 Supabase를 통한 OAuth 로그인을 사용하는 경우, 웹 애플리케이션 클라이언트 ID만 있으면 됩니다. Android 클라이언트 ID는 나중에 네이티브 구글 로그인을 구현할 때 필요합니다.

## 2. Supabase 설정

### 2.1 Supabase 대시보드 접속

1. [Supabase](https://supabase.com) 접속 및 로그인
2. 프로젝트 선택

### 2.2 Google 프로바이더 활성화

1. 좌측 메뉴에서 **Authentication** > **Providers** 클릭
2. **Google** 프로바이더 찾기
3. **Enabled** 토글을 **ON**으로 설정

### 2.3 Google 인증 정보 입력

다음 정보를 입력합니다:

- **Client ID (for OAuth)**: 
  - 구글 클라우드 콘솔의 **클라이언트 ID** 입력
  
- **Client Secret (for OAuth)**:
  - 구글 클라우드 콘솔의 **클라이언트 보안 비밀번호** 입력

- **Redirect URL** (자동 설정됨):
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```

4. **Save** 버튼 클릭

### 2.4 Redirect URLs 설정 확인

1. **Authentication** > **URL Configuration** 메뉴로 이동
2. **Redirect URLs** 섹션에서 다음 URL들이 등록되어 있는지 확인:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `parentapp://auth/callback`
3. 없다면 각각 추가:
   - 첫 번째 URL 입력 → **Add URL** 클릭
   - 두 번째 URL 입력 → **Add URL** 클릭
4. 페이지 새로고침 후 확인

### 2.5 이메일 없이 로그인 허용 설정 (선택 사항)

구글은 기본적으로 이메일을 제공하지만, 혹시 모를 상황을 대비하여:

1. **Authentication** > **Settings** 메뉴로 이동
2. **Allow users to sign up without an email** 옵션 확인
3. 필요에 따라 활성화 (일반적으로는 비활성화해도 됩니다)

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

### 4.1 앱 재시작

```bash
cd app
npm start
```

### 4.2 구글 로그인 테스트

1. 앱 실행 후 로그인 화면으로 이동
2. **구글로 로그인** 버튼 클릭
3. 구글 로그인 페이지가 열림
4. 구글 계정으로 로그인
5. 권한 동의 후 앱으로 리다이렉트
6. 로그인 성공 확인

## 5. 문제 해결

### "로그인 URL을 가져올 수 없습니다" 오류

**원인**: Supabase에서 Google 프로바이더가 제대로 활성화되지 않음

**해결 방법**:
1. Supabase 대시보드 > Authentication > Providers > Google 확인
2. **Enabled** 토글이 **ON**인지 확인
3. Client ID와 Client Secret이 정확히 입력되었는지 확인
4. 저장 후 앱 재시작

### Redirect URI 오류

**원인**: 구글 클라우드 콘솔의 승인된 리디렉션 URI가 Supabase URL과 일치하지 않음

**해결 방법**:
1. 구글 클라우드 콘솔 > API 및 서비스 > 사용자 인증 정보 확인
2. 웹 애플리케이션 클라이언트 ID 선택
3. 승인된 리디렉션 URI에 다음 URL이 정확히 추가되어 있는지 확인:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. 일치하지 않으면 추가 후 저장

### Client Secret 오류

**원인**: Client Secret이 잘못 입력되었거나 공백 포함

**해결 방법**:
1. 구글 클라우드 콘솔에서 클라이언트 보안 비밀번호 재생성
2. Supabase에 다시 입력 (앞뒤 공백 제거)
3. 공백이나 특수문자가 포함되지 않았는지 확인

### 세션 설정 오류

**원인**: 앱의 scheme이 올바르게 설정되지 않음

**해결 방법**:
1. `app.json` 파일에서 `scheme` 확인
2. `"scheme": "parentapp"` 형식으로 설정되어 있는지 확인
3. 변경 후 앱 재시작

### 구글 로그인 페이지가 열리지 않음

**원인**: 네트워크 문제 또는 앱 설정 문제

**해결 방법**:
1. 인터넷 연결 확인
2. 앱을 완전히 종료 후 재시작
3. 개발 서버 재시작:
   ```bash
   npm start
   ```

### "OAuth 동의 화면이 설정되지 않았습니다" 오류

**원인**: 구글 클라우드 콘솔에서 OAuth 동의 화면이 설정되지 않음

**해결 방법**:
1. 구글 클라우드 콘솔 > API 및 서비스 > OAuth 동의 화면으로 이동
2. 앱 정보 입력 완료
3. 범위 설정 완료 (openid, email, profile)
4. 저장 후 앱 재시작

### "승인되지 않은 클라이언트" 오류

**원인**: OAuth 동의 화면이 테스트 모드이고 테스트 사용자에 등록되지 않음

**해결 방법**:
1. 구글 클라우드 콘솔 > API 및 서비스 > OAuth 동의 화면으로 이동
2. **테스트 사용자** 섹션에서 테스트할 이메일 주소 추가
3. 또는 **앱을 게시**하여 모든 사용자가 사용할 수 있도록 설정

## 6. 확인 체크리스트

구글 로그인 설정이 완료되었는지 확인:

- [ ] 구글 클라우드 콘솔에서 프로젝트 생성 완료
- [ ] OAuth 동의 화면 설정 완료
- [ ] 웹 애플리케이션 OAuth 클라이언트 ID 생성 완료
- [ ] Client ID 확인 및 복사
- [ ] Client Secret 확인 및 복사
- [ ] 승인된 리디렉션 URI 설정 완료 (`https://your-project-id.supabase.co/auth/v1/callback`)
- [ ] Supabase에서 Google 프로바이더 활성화
- [ ] Supabase에 Client ID 입력
- [ ] Supabase에 Client Secret 입력
- [ ] Supabase Redirect URLs에 두 개의 URL 추가 확인
- [ ] app.json에 scheme 설정 확인
- [ ] .env 파일에 Supabase 설정 확인
- [ ] 앱 재시작 후 테스트

## 7. 추가 참고 자료

- [구글 OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google 인증 가이드](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [구글 클라우드 콘솔 문서](https://console.cloud.google.com/)

## 8. 현재 프로젝트 정보

- **앱 패키지 이름**: `com.parentapp` (app.json)
- **앱 Scheme**: `parentapp` (app.json)
- **Supabase Redirect URI**: `https://your-project-id.supabase.co/auth/v1/callback`
- **앱 Deep Link**: `parentapp://auth/callback`

> **중요**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경해야 합니다!

## 9. 구글 로그인 특징

### 네이버/카카오와의 차이점

1. **이메일 필수**: 구글은 기본적으로 이메일을 제공합니다.
2. **프로필 정보**: 구글은 이름, 이메일, 프로필 사진을 기본적으로 제공합니다.
3. **국제적 사용**: 구글은 전 세계적으로 사용되므로 국제 사용자도 지원 가능합니다.

### 코드에서의 처리

현재 코드는 `signInWithGoogle()`을 통해 구글 로그인을 처리하며, `signInWithSocial('google')` 함수를 사용합니다. 구글은 기본적으로 이메일을 제공하므로 Supabase 설정에서 특별한 처리가 필요하지 않습니다.
