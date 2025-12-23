# 네이버 로그인 설정 가이드

이 가이드는 네이버 로그인을 설정하는 단계별 방법을 설명합니다.

## 1. 네이버 개발자 센터 설정

### 1.1 앱 등록

1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 네이버 계정으로 로그인
3. **Application** > **애플리케이션 등록** 클릭
4. 앱 정보 입력:
   - **애플리케이션 이름**: 예) "학부모 전용 앱"
   - **사용 API**: **네이버 로그인** 선택
   - **로그인 오픈 API 서비스 환경**: 
     - **PC 웹**: 선택 (Supabase 콜백용)
     - **모바일 웹**: 선택 (React Native 앱용)
   - **서비스 URL**: 
     ```
     https://your-project-id.supabase.co
     ```
   - **Callback URL**: 
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
     > **주의**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경하세요
5. **등록하기** 클릭

### 1.2 Client ID 및 Client Secret 확인

1. 생성된 애플리케이션 선택
2. **개발자 센터** > **내 애플리케이션** 메뉴로 이동
3. 등록한 애플리케이션 클릭
4. **인증 정보** 섹션에서 다음 정보 확인:
   - **Client ID**: 이것이 Supabase의 Client ID입니다 (복사해두세요)
   - **Client Secret**: 이것이 Supabase의 Client Secret입니다 (복사해두세요)

### 1.3 서비스 URL 및 Callback URL 설정

1. **API 설정** 탭으로 이동
2. **로그인 오픈 API 서비스 환경** 섹션 확인:
   - **PC 웹**:
     - **서비스 URL**: `https://your-project-id.supabase.co`
     - **Callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
   - **모바일 웹**:
     - **서비스 URL**: `https://your-project-id.supabase.co`
     - **Callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
3. **수정** 버튼 클릭하여 저장

### 1.4 안드로이드 앱 설정 (모바일 웹 환경)

**안드로이드 앱 패키지 이름** 섹션에서:

1. **안드로이드 앱 패키지 이름** 입력:
   ```
   com.parentapp
   ```
   > **참고**: 이 값은 `app/app.json` 파일의 `android.package` 값입니다.

2. **다운로드 URL** 입력:
   - **앱이 아직 배포되지 않은 경우**: 
     - 비워두거나 나중에 업데이트 가능
     - 또는 임시로 `https://expo.dev` 입력 (나중에 실제 스토어 URL로 변경)
   
   - **구글 플레이 스토어에 배포된 경우**:
     ```
     https://play.google.com/store/apps/details?id=com.parentapp
     ```
   
   - **네이버 앱스토어에 배포된 경우**:
     ```
     https://nstore.naver.com/appstore/detail?appId=your-app-id
     ```

3. **저장** 버튼 클릭

### 1.5 동의 항목 설정

1. **API 설정** 탭에서 **네이버 로그인** 섹션으로 이동
2. **동의항목** 설정:
   - **필수 동의**:
     - 이름 (필수)
     - 이메일 (필수)
   - **선택 동의**:
     - 프로필 사진 (선택)
     - 닉네임 (선택)
     - 연령대 (선택)
     - 생일 (선택)
     - 성별 (선택)
     - 전화번호 (선택)

> **중요**: 안드로이드 앱 패키지 이름은 반드시 입력해야 합니다. 다운로드 URL은 앱이 배포되지 않았다면 비워두어도 됩니다.

## 2. Supabase 설정

### 2.1 Supabase 대시보드 접속

1. [Supabase](https://supabase.com) 접속 및 로그인
2. 프로젝트 선택

### 2.2 Naver 프로바이더 활성화

1. 좌측 메뉴에서 **Authentication** > **Providers** 클릭
2. **Naver** 프로바이더 찾기
3. **Enabled** 토글을 **ON**으로 설정

### 2.3 Naver 인증 정보 입력

다음 정보를 입력합니다:

- **Client ID (for OAuth)**: 
  - 네이버 개발자 센터의 **Client ID** 입력
  
- **Client Secret (for OAuth)**:
  - 네이버 개발자 센터의 **Client Secret** 입력

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

### 4.2 네이버 로그인 테스트

1. 앱 실행 후 로그인 화면으로 이동
2. **네이버로 로그인** 버튼 클릭
3. 네이버 로그인 페이지가 열림
4. 네이버 계정으로 로그인
5. 권한 동의 후 앱으로 리다이렉트
6. 로그인 성공 확인

## 5. 문제 해결

### "로그인 URL을 가져올 수 없습니다" 오류

**원인**: Supabase에서 Naver 프로바이더가 제대로 활성화되지 않음

**해결 방법**:
1. Supabase 대시보드 > Authentication > Providers > Naver 확인
2. **Enabled** 토글이 **ON**인지 확인
3. Client ID와 Client Secret이 정확히 입력되었는지 확인
4. 저장 후 앱 재시작

### Redirect URI 오류

**원인**: 네이버 개발자 센터의 Callback URL이 Supabase URL과 일치하지 않음

**해결 방법**:
1. 네이버 개발자 센터 > 내 애플리케이션 > API 설정 확인
2. Supabase 프로젝트 URL과 정확히 일치하는지 확인:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
3. 일치하지 않으면 수정 후 저장

### Client Secret 오류

**원인**: Client Secret이 잘못 입력되었거나 공백 포함

**해결 방법**:
1. 네이버 개발자 센터 > 인증 정보 > Client Secret 확인
2. Supabase에 다시 입력 (앞뒤 공백 제거)
3. 공백이나 특수문자가 포함되지 않았는지 확인

### 세션 설정 오류

**원인**: 앱의 scheme이 올바르게 설정되지 않음

**해결 방법**:
1. `app.json` 파일에서 `scheme` 확인
2. `"scheme": "parentapp"` 형식으로 설정되어 있는지 확인
3. 변경 후 앱 재시작

### 네이버 로그인 페이지가 열리지 않음

**원인**: 네트워크 문제 또는 앱 설정 문제

**해결 방법**:
1. 인터넷 연결 확인
2. 앱을 완전히 종료 후 재시작
3. 개발 서버 재시작:
   ```bash
   npm start
   ```

### "잘못된 요청입니다" 오류

**원인**: 네이버 개발자 센터의 서비스 URL 또는 Callback URL이 잘못 설정됨

**해결 방법**:
1. 네이버 개발자 센터 > API 설정 > 로그인 오픈 API 서비스 환경 확인
2. 서비스 URL과 Callback URL이 정확히 입력되었는지 확인
3. URL에 공백이나 특수문자가 없는지 확인
4. 저장 후 앱 재시작

## 6. 확인 체크리스트

네이버 로그인 설정이 완료되었는지 확인:

- [ ] 네이버 개발자 센터에서 애플리케이션 등록 완료
- [ ] Client ID 확인 및 복사
- [ ] Client Secret 확인 및 복사
- [ ] 서비스 URL 설정 완료
- [ ] Callback URL 설정 완료 (`https://your-project-id.supabase.co/auth/v1/callback`)
- [ ] 동의 항목 설정 완료
- [ ] Supabase에서 Naver 프로바이더 활성화
- [ ] Supabase에 Client ID 입력
- [ ] Supabase에 Client Secret 입력
- [ ] Supabase Redirect URLs에 두 개의 URL 추가 확인
- [ ] app.json에 scheme 설정 확인
- [ ] .env 파일에 Supabase 설정 확인
- [ ] 앱 재시작 후 테스트

## 7. 추가 참고 자료

- [네이버 개발자 센터 가이드](https://developers.naver.com/docs/login/overview/)
- [Supabase Naver 인증 가이드](https://supabase.com/docs/guides/auth/social-login/auth-naver)
- [네이버 로그인 API 문서](https://developers.naver.com/docs/login/overview/)

## 8. 현재 프로젝트 정보

- **앱 패키지 이름**: `com.parentapp` (app.json)
- **앱 Scheme**: `parentapp` (app.json)
- **Supabase Redirect URI**: `https://your-project-id.supabase.co/auth/v1/callback`
- **앱 Deep Link**: `parentapp://auth/callback`

> **중요**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경해야 합니다!

## 9. 네이버 로그인 특징

### 카카오와의 차이점

1. **이메일 필수**: 네이버는 기본적으로 이메일을 제공하므로 이메일 없이 로그인하는 경우가 거의 없습니다.
2. **동의 항목**: 네이버는 이름과 이메일이 필수 동의 항목입니다.
3. **프로필 정보**: 네이버는 더 많은 프로필 정보를 제공합니다 (연령대, 생일, 성별 등).

### 코드에서의 처리

현재 코드는 `signInWithSocial('naver')`를 통해 네이버 로그인을 처리하며, 카카오와 달리 특별한 스코프 제외 처리가 필요하지 않습니다. 네이버는 기본적으로 이메일을 제공하므로 Supabase 설정에서 "Allow users without an email" 옵션을 확인할 필요가 없습니다.
