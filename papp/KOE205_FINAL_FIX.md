# KOE205 에러 최종 해결 방법

## 문제 원인

KOE205 에러는 Supabase가 기본적으로 `account_email` 스코프를 요청하는데, 카카오에서 이 동의 항목이 설정되지 않아서 발생합니다.

## 해결 방법

### 코드 수정 완료 ✅

코드에서 카카오 로그인 시 `account_email` 스코프를 제외하고, `profile_nickname`과 `profile_image`만 요청하도록 수정했습니다.

### 수정 내용:

```javascript
// 카카오의 경우 이메일 스코프 제외
if (provider === 'kakao') {
  options.scopes = 'profile_nickname profile_image';
  // account_email을 명시적으로 제외하여 KOE205 에러 방지
}
```

## 다음 단계

### 1단계: 앱 재시작

```bash
cd app
# 개발 서버 종료 (Ctrl+C)
npm start
```

### 2단계: 앱 완전히 재시작

- 앱을 완전히 종료
- 다시 실행

### 3단계: 테스트

1. 로그인 화면에서 **카카오로 로그인** 버튼 클릭
2. 카카오 로그인 페이지에서 이메일 동의 없이 진행
3. 로그인 성공 확인

## 확인 사항

### Supabase 설정:
- [x] Allow users without an email: ON ✅
- [x] Kakao 프로바이더 활성화: ON ✅
- [x] Client ID 입력됨 ✅
- [x] Client Secret 입력됨 ✅

### Kakao Developers Console:
- [x] 카카오 로그인 활성화: ON ✅
- [x] Redirect URI 설정됨 ✅
- [x] 동의 항목: 닉네임, 프로필 사진 (이메일 불필요)

### 코드:
- [x] account_email 스코프 제외 ✅
- [x] profile_nickname, profile_image만 요청 ✅

## 요약

**KOE205 에러 해결:**

1. ✅ **코드 수정 완료**: account_email 스코프 제외
2. ✅ **Supabase 설정 완료**: Allow users without an email: ON
3. ⏳ **앱 재시작 필요**: 변경사항 적용

**핵심**: 코드에서 `scopes: 'profile_nickname profile_image'`로 설정하여 이메일을 요청하지 않도록 했습니다!

앱을 재시작한 후 테스트해보세요!
