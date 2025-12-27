# KOE205 에러 대안 해결 방법

## 현재 상황

코드를 수정했지만 여전히 KOE205 에러가 발생합니다.

## 추가 해결 방법

### 방법 1: Kakao Developers Console에서 개인 개발자 등록

이메일 권한을 받는 가장 확실한 방법입니다.

#### 단계별 안내:

1. **Kakao Developers Console 접속**
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 앱 선택

3. **앱 설정** > **사업자** 메뉴로 이동

4. **개인 개발자 등록**
   - "개인 개발자로 등록" 또는 "Register as Individual" 옵션 선택
   - 필요한 정보 입력
   - 등록 완료

5. **동의 항목 활성화**
   - 제품 설정 > 카카오 로그인 > 동의항목
   - 카카오계정(이메일)을 "선택 동의"로 설정 가능해짐

### 방법 2: 코드 수정 (더 강력한 방법)

현재 코드를 더 명시적으로 수정:

```javascript
if (provider === 'kakao') {
  options.scopes = 'profile_nickname profile_image';
  options.queryParams = {
    scope: 'profile_nickname profile_image',
  };
}
```

### 방법 3: Supabase 설정 재확인

1. **Supabase 대시보드** > **Authentication** > **Providers** > **Kakao**
2. **Allow users without an email**: **ON** 확인
3. **Save** 클릭
4. 페이지 새로고침 후 다시 확인

### 방법 4: 완전히 재설정

1. **Supabase 설정 초기화**
   - Authentication > Providers > Kakao
   - Enabled: OFF로 변경 후 Save
   - 잠시 대기 후 다시 ON으로 변경
   - 모든 값 재입력:
     - REST API Key: 22459018fd3a61dbf1ed0c826f3b95b4
     - Client Secret: 재입력
     - Allow users without an email: ON
   - Save 클릭

2. **Kakao Developers Console 확인**
   - Redirect URI 정확히 확인
   - 저장 확인

3. **앱 완전히 재시작**
   - 개발 서버 종료 후 재시작
   - 앱 완전히 종료 후 재시작

## 가장 확실한 해결 방법

### 개인 개발자 등록 (권장)

이 방법이 가장 확실합니다:

1. **Kakao Developers Console**
   - 앱 설정 > 사업자
   - 개인 개발자로 등록

2. **동의 항목 활성화**
   - 제품 설정 > 카카오 로그인 > 동의항목
   - 카카오계정(이메일)을 "선택 동의"로 설정

3. **테스트**
   - 앱 재시작
   - 카카오 로그인 테스트

## 체크리스트

### 즉시 시도할 수 있는 것:
- [ ] 코드 수정 확인 (scopes + queryParams)
- [ ] Supabase 설정 재확인 및 저장
- [ ] 개발 서버 재시작
- [ ] 앱 재시작

### 더 확실한 방법:
- [ ] Kakao Developers Console에서 개인 개발자 등록
- [ ] 동의 항목에서 카카오계정(이메일) 활성화
- [ ] 테스트

## 요약

**KOE205 에러가 계속 발생하는 경우:**

1. ✅ **코드 수정**: scopes + queryParams 설정 (완료)
2. ✅ **Supabase 설정**: Allow users without an email: ON (확인 필요)
3. 🔄 **개인 개발자 등록**: 가장 확실한 방법 (권장)

**가장 확실한 해결책**: Kakao Developers Console에서 **개인 개발자로 등록**하면 이메일 권한을 받을 수 있습니다!
