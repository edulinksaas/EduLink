# 카카오 로그인 설정 가이드

이 가이드는 카카오 로그인을 설정하는 단계별 방법을 설명합니다.

## 1. Kakao Developers Console 설정

### 1.1 앱 등록

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **내 애플리케이션** > **애플리케이션 추가하기** 클릭
4. 앱 정보 입력:
   - **앱 이름**: 예) "학부모 전용 앱"
   - **사업자명**: 개인 또는 회사명
5. **저장** 클릭

### 1.2 앱 키 확인

1. 생성된 앱 선택
2. **앱 설정** > **앱 키** 메뉴로 이동
3. 다음 정보 확인:
   - **REST API 키**: 이것이 Client ID입니다 (복사해두세요)
   - **JavaScript 키**: 웹용 (필요시)
   - **Admin 키**: 서버용 (필요시)

### 1.3 카카오 로그인 활성화

1. **제품 설정** > **카카오 로그인** 메뉴로 이동
2. **카카오 로그인 활성화** 토글을 **ON**으로 설정
3. **동의항목** 설정:
   - 필수 동의: 
     - 닉네임 (필수)
     - 프로필 사진 (선택)
   - 선택 동의:
     - 카카오계정(이메일) (선택)
     - 전화번호 (선택)

### 1.4 Redirect URI 설정

1. **카카오 로그인** > **Redirect URI** 섹션으로 이동
2. **Redirect URI 등록** 클릭
3. 다음 URI 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   > **주의**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경하세요
4. **저장** 클릭

### 1.5 Client Secret 생성

1. **고급** 탭으로 이동
2. **Client Secret 코드 생성** 클릭
3. 생성된 **Client Secret** 복사 (한 번만 표시되므로 반드시 저장!)

## 2. Supabase 설정

### 2.1 Supabase 대시보드 접속

1. [Supabase](https://supabase.com) 접속 및 로그인
2. 프로젝트 선택

### 2.2 Kakao 프로바이더 활성화

1. 좌측 메뉴에서 **Authentication** > **Providers** 클릭
2. **Kakao** 프로바이더 찾기
3. **Enabled** 토글을 **ON**으로 설정

### 2.3 Kakao 인증 정보 입력

다음 정보를 입력합니다:

- **Client ID (for OAuth)**: 
  - Kakao Developers Console의 **REST API 키** 입력
  
- **Client Secret (for OAuth)**:
  - Kakao Developers Console에서 생성한 **Client Secret** 입력

- **Redirect URL** (자동 설정됨):
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```

4. **Save** 버튼 클릭

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

### 4.2 카카오 로그인 테스트

1. 앱 실행 후 로그인 화면으로 이동
2. **카카오로 로그인** 버튼 클릭
3. 카카오 로그인 페이지가 열림
4. 카카오 계정으로 로그인
5. 권한 동의 후 앱으로 리다이렉트
6. 로그인 성공 확인

## 5. 문제 해결

### "로그인 URL을 가져올 수 없습니다" 오류

**원인**: Supabase에서 Kakao 프로바이더가 제대로 활성화되지 않음

**해결 방법**:
1. Supabase 대시보드 > Authentication > Providers > Kakao 확인
2. **Enabled** 토글이 **ON**인지 확인
3. Client ID와 Client Secret이 정확히 입력되었는지 확인
4. 저장 후 앱 재시작

### Redirect URI 오류

**원인**: Kakao Developers Console의 Redirect URI가 Supabase URL과 일치하지 않음

**해결 방법**:
1. Kakao Developers Console > 카카오 로그인 > Redirect URI 확인
2. Supabase 프로젝트 URL과 정확히 일치하는지 확인:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
3. 일치하지 않으면 수정 후 저장

### Client Secret 오류

**원인**: Client Secret이 잘못 입력되었거나 만료됨

**해결 방법**:
1. Kakao Developers Console > 고급 > Client Secret 확인
2. 새로 생성한 경우 Supabase에 다시 입력
3. 공백이나 특수문자가 포함되지 않았는지 확인

### 세션 설정 오류

**원인**: 앱의 scheme이 올바르게 설정되지 않음

**해결 방법**:
1. `app.json` 파일에서 `scheme` 확인
2. `"scheme": "parentapp"` 형식으로 설정되어 있는지 확인
3. 변경 후 앱 재시작

### 카카오 로그인 페이지가 열리지 않음

**원인**: 네트워크 문제 또는 앱 설정 문제

**해결 방법**:
1. 인터넷 연결 확인
2. 앱을 완전히 종료 후 재시작
3. 개발 서버 재시작:
   ```bash
   npm start
   ```

## 6. 확인 체크리스트

카카오 로그인 설정이 완료되었는지 확인:

- [ ] Kakao Developers Console에서 앱 등록 완료
- [ ] REST API 키 확인 및 복사
- [ ] 카카오 로그인 활성화
- [ ] Redirect URI 설정 완료
- [ ] Client Secret 생성 및 복사
- [ ] Supabase에서 Kakao 프로바이더 활성화
- [ ] Supabase에 Client ID (REST API 키) 입력
- [ ] Supabase에 Client Secret 입력
- [ ] app.json에 scheme 설정 확인
- [ ] .env 파일에 Supabase 설정 확인
- [ ] 앱 재시작 후 테스트

## 7. 추가 참고 자료

- [Kakao Developers 가이드](https://developers.kakao.com/docs)
- [Supabase Kakao 인증 가이드](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

## 8. 현재 프로젝트 정보

- **앱 패키지 이름**: `com.parentapp` (app.json)
- **앱 Scheme**: `parentapp` (app.json)
- **Supabase Redirect URI**: `https://your-project-id.supabase.co/auth/v1/callback`

> **중요**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경해야 합니다!
