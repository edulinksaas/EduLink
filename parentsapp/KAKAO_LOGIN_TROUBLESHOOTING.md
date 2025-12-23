# 카카오 로그인 에러 해결 가이드

## 일반적인 에러와 해결 방법

### 1. "로그인 URL을 가져올 수 없습니다" 에러

**원인**: Supabase에서 Kakao 프로바이더가 제대로 활성화되지 않음

**해결 방법**:
1. Supabase 대시보드 > Authentication > Providers > Kakao 확인
2. **Enabled** 토글이 **ON**인지 확인
3. Client ID와 Client Secret이 정확히 입력되었는지 확인
4. 저장 후 앱 재시작

### 2. "Supabase가 초기화되지 않았습니다" 에러

**원인**: 환경 변수가 설정되지 않음

**해결 방법**:
1. `app/.env` 파일 확인:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. 파일이 존재하는지 확인
3. 앱 재시작 (개발 서버 종료 후 다시 시작)

### 3. Redirect URI 오류

**원인**: Kakao Developers Console의 Redirect URI가 Supabase URL과 일치하지 않음

**해결 방법**:
1. Kakao Developers Console > 카카오 로그인 > Redirect URI 확인
2. Supabase 프로젝트 URL과 정확히 일치하는지 확인:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
3. 일치하지 않으면 수정 후 저장

### 4. "인증 세션을 가져올 수 없습니다" 에러

**원인**: URL 파싱 문제 또는 세션 설정 실패

**해결 방법**:
1. 앱을 완전히 종료 후 재시작
2. 개발 서버 재시작:
   ```bash
   npm start
   ```
3. 브라우저 캐시 삭제 후 다시 시도

### 5. "사용자 정보를 가져올 수 없습니다" 에러

**원인**: 카카오 로그인은 성공했지만 사용자 정보를 가져오지 못함

**해결 방법**:
1. Supabase 대시보드 > Authentication > Users에서 사용자가 생성되었는지 확인
2. 카카오 동의항목에서 필요한 정보(이메일, 전화번호 등)가 동의되었는지 확인

### 6. 카카오 로그인 페이지가 열리지 않음

**원인**: 네트워크 문제 또는 앱 설정 문제

**해결 방법**:
1. 인터넷 연결 확인
2. 앱을 완전히 종료 후 재시작
3. 개발 서버 재시작

### 7. "로그인이 취소되었습니다" 메시지

**원인**: 사용자가 카카오 로그인을 취소함

**해결 방법**:
- 정상적인 동작입니다. 다시 로그인 버튼을 클릭하세요.

## 디버깅 방법

### 1. 콘솔 로그 확인

앱 실행 시 터미널에서 다음 로그를 확인하세요:

```bash
npm start
```

에러 메시지가 표시되면 해당 메시지를 확인하세요.

### 2. Supabase 로그 확인

1. Supabase 대시보드 > Logs > Auth Logs
2. 최근 인증 시도 확인
3. 에러 메시지 확인

### 3. Kakao Developers Console 확인

1. Kakao Developers Console > 내 애플리케이션 > 앱 선택
2. 통계 > 오류 로그 확인
3. 최근 오류 확인

## 체크리스트

에러가 발생하면 다음을 확인하세요:

- [ ] Supabase 프로바이더가 활성화되어 있는가?
- [ ] Client ID (REST API 키)가 정확한가?
- [ ] Client Secret이 정확한가?
- [ ] Redirect URI가 정확한가?
- [ ] .env 파일이 올바르게 설정되어 있는가?
- [ ] 앱을 재시작했는가?
- [ ] 개발 서버를 재시작했는가?

## 빠른 해결 방법

1. **모든 설정 확인**:
   - Supabase: Authentication > Providers > Kakao
   - Kakao Developers: 카카오 로그인 > Redirect URI

2. **앱 재시작**:
   ```bash
   # 개발 서버 종료 (Ctrl+C)
   cd app
   npm start
   ```

3. **캐시 삭제**:
   ```bash
   # Expo 캐시 삭제
   npx expo start -c
   ```

4. **환경 변수 확인**:
   - `.env` 파일이 `app` 폴더에 있는지 확인
   - 파일 내용이 정확한지 확인

## 여전히 해결되지 않는 경우

구체적인 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.

다음 정보를 제공해주세요:
1. 에러 메시지 전체 내용
2. 에러가 발생하는 시점 (버튼 클릭 시? 페이지 로드 시?)
3. 터미널에 표시되는 로그
4. Supabase Auth Logs의 에러 내용
