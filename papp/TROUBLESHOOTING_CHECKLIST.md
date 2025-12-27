# 카카오 로그인 에러 해결 체크리스트

## 🔍 단계별 확인 사항

### 1단계: Redirect URI 재확인

#### Kakao Developers Console에서:
- [ ] Redirect URI가 정확히 입력되었는가?
  - 형식: `https://munydihxxzoiqguumdyt.supabase.co/auth/v1/callback`
  - 빨간 밑줄이 없는가?
  - 저장 버튼이 활성화되어 있는가?
  - 저장을 클릭했는가?

#### 확인 방법:
1. Kakao Developers Console > 제품 설정 > 카카오 로그인
2. Redirect URI 섹션 확인
3. 목록에 올바른 URI가 등록되어 있는지 확인

---

### 2단계: 카카오 로그인 활성화 확인

#### Kakao Developers Console에서:
- [ ] 카카오 로그인 활성화 토글이 **ON**인가?
- [ ] 저장을 클릭했는가?

#### 확인 방법:
1. Kakao Developers Console > 제품 설정 > 카카오 로그인
2. 페이지 상단의 "카카오 로그인 활성화" 토글 확인
3. OFF라면 ON으로 변경 후 저장

---

### 3단계: Supabase 설정 확인

#### Supabase 대시보드에서:

##### Kakao 프로바이더 활성화:
- [ ] Authentication > Providers > Kakao
- [ ] Enabled 토글이 **ON**인가?
- [ ] Save 버튼을 클릭했는가?

##### Client ID 확인:
- [ ] Client ID (for OAuth) 필드에 값이 입력되어 있는가?
- [ ] 입력된 값이 Kakao의 REST API 키와 일치하는가?

**확인 방법:**
1. Kakao Developers Console > 앱 설정 > 앱 키
2. REST API 키 복사
3. Supabase > Authentication > Providers > Kakao
4. Client ID (for OAuth) 필드와 비교

##### Client Secret 확인:
- [ ] Client Secret (for OAuth) 필드에 값이 입력되어 있는가?
- [ ] 입력된 값이 Kakao의 Client Secret과 일치하는가?

**확인 방법:**
1. Kakao Developers Console > 고급 탭
2. Client Secret 확인 (없으면 생성)
3. Supabase > Authentication > Providers > Kakao
4. Client Secret (for OAuth) 필드와 비교

---

### 4단계: 설정 저장 확인

#### Kakao Developers Console:
- [ ] 모든 변경사항을 저장했는가?
- [ ] 페이지를 새로고침해도 설정이 유지되는가?

#### Supabase:
- [ ] 모든 변경사항을 Save 버튼으로 저장했는가?
- [ ] 페이지를 새로고침해도 설정이 유지되는가?

---

### 5단계: 브라우저 캐시 및 앱 재시작

#### 브라우저:
- [ ] 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
- [ ] 페이지 강력 새로고침 (Ctrl + Shift + R)

#### 앱:
- [ ] 개발 서버 재시작:
  ```bash
  cd app
  npm start
  ```
- [ ] 앱 완전히 종료 후 재시작

---

## 🆘 여전히 에러가 발생하는 경우

### 에러 메시지 확인

어떤 에러 메시지가 표시되는지 확인하세요:

1. **KOE101 에러**: 설정 오류
   - 위의 체크리스트 다시 확인

2. **"로그인 URL을 가져올 수 없습니다"**: Supabase 설정 문제
   - Supabase에서 Kakao 프로바이더가 활성화되어 있는지 확인
   - Client ID와 Client Secret이 정확한지 확인

3. **"인증 세션을 가져올 수 없습니다"**: 세션 문제
   - 앱 재시작
   - 브라우저 캐시 삭제

### 로그 확인

#### Kakao Developers Console:
1. 통계 > 오류 로그 확인
2. 최근 오류 메시지 확인

#### Supabase:
1. Logs > Auth Logs 확인
2. 최근 인증 시도 확인

---

## 📋 최종 확인 체크리스트

### Kakao Developers Console:
- [ ] 카카오 로그인 활성화 (ON)
- [ ] Redirect URI: `https://munydihxxzoiqguumdyt.supabase.co/auth/v1/callback`
- [ ] Redirect URI 저장 완료
- [ ] REST API 키 확인
- [ ] Client Secret 생성 및 확인

### Supabase:
- [ ] Kakao 프로바이더 활성화 (Enabled ON)
- [ ] Client ID: REST API 키 입력됨
- [ ] Client Secret: Client Secret 입력됨
- [ ] 설정 저장 완료

### 테스트:
- [ ] 브라우저 캐시 삭제
- [ ] 개발 서버 재시작
- [ ] 앱 재시작
- [ ] 카카오 로그인 버튼 클릭 테스트

---

## 💡 추가 팁

### 설정이 저장되지 않는 경우:
1. 다른 브라우저로 시도
2. 시크릿 모드에서 시도
3. 브라우저 확장 프로그램 비활성화

### 여전히 안 되는 경우:
구체적인 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.
