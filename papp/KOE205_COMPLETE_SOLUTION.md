# KOE205 에러 완전 해결 가이드

## 🔴 문제 원인

Supabase가 기본적으로 `account_email` 스코프를 요청하는데, 카카오에서 이 동의 항목이 "권한 없음" 상태이기 때문에 KOE205 에러가 발생합니다.

## ✅ 해결 방법 (우선순위 순)

### 방법 1: 개인 개발자 등록 (가장 확실함) ⭐

이 방법이 가장 확실하고 권장됩니다.

#### 단계별 안내:

1. **Kakao Developers Console 접속**
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 앱 선택

3. **앱 설정** 메뉴로 이동
   - 좌측 메뉴에서 **앱 설정** 클릭

4. **사업자** 탭 클릭
   - 앱 설정 메뉴에서 **사업자** 또는 **Business** 탭 찾기

5. **개인 개발자로 등록**
   - "개인 개발자로 등록" 또는 "Register as Individual" 버튼 클릭
   - 필요한 정보 입력:
     - 이름
     - 연락처
     - 등
   - 등록 완료

6. **동의 항목 활성화**
   - 제품 설정 > 카카오 로그인 > 동의항목
   - 카카오계정(이메일) 행의 **설정** 버튼이 나타남
   - **선택 동의** 또는 **필수 동의**로 설정
   - 저장

7. **테스트**
   - 앱 재시작
   - 카카오 로그인 테스트

### 방법 2: 코드 수정 (이미 완료)

코드에서 이메일 스코프를 제외하도록 수정했습니다:

```javascript
if (provider === 'kakao') {
  options.scopes = 'profile_nickname profile_image';
  options.queryParams = {
    scope: 'profile_nickname profile_image',
  };
}
```

**중요**: 코드 수정 후 반드시 앱을 재시작해야 합니다!

### 방법 3: Supabase 설정 재확인

1. **Supabase 대시보드** 접속
2. **Authentication** > **Providers** > **Kakao**
3. 다음 확인:
   - Enabled: ON
   - REST API Key: 22459018fd3a61dbf1ed0c826f3b95b4
   - Client Secret: 입력됨
   - **Allow users without an email: ON** ← 이것이 중요!
4. **Save** 버튼 클릭
5. 페이지 새로고침 후 다시 확인

## 🚀 빠른 해결 순서

### 1단계: 코드 확인 및 앱 재시작

```bash
cd app
# 개발 서버 종료 (Ctrl+C)
npm start
```

앱 완전히 종료 후 재시작

### 2단계: 여전히 안 되면 개인 개발자 등록

1. Kakao Developers Console > 앱 설정 > 사업자
2. 개인 개발자로 등록
3. 동의 항목에서 카카오계정(이메일) 활성화
4. 테스트

## 체크리스트

### 즉시 확인:
- [ ] 코드 수정 확인 (scopes + queryParams)
- [ ] 개발 서버 재시작 완료
- [ ] 앱 완전히 종료 후 재시작
- [ ] Supabase: Allow users without an email: ON 확인
- [ ] Supabase: Save 버튼 클릭 확인

### 더 확실한 방법:
- [ ] Kakao Developers Console > 앱 설정 > 사업자
- [ ] 개인 개발자로 등록
- [ ] 동의 항목 > 카카오계정(이메일) 활성화
- [ ] 테스트

## 요약

**KOE205 에러 해결 방법:**

1. ✅ **코드 수정**: 완료 (scopes + queryParams)
2. ✅ **앱 재시작**: 필수!
3. ⭐ **개인 개발자 등록**: 가장 확실한 방법 (권장)

**핵심**: 
- 코드 수정 후 **반드시 앱을 재시작**해야 합니다!
- 여전히 안 되면 **개인 개발자 등록**이 가장 확실합니다!

## 여전히 안 되는 경우

구체적인 에러 메시지를 알려주세요:
- 정확한 에러 코드
- 에러 메시지 전체 내용
- 에러 발생 시점

이 정보를 주시면 더 정확한 해결 방법을 제시할 수 있습니다!
