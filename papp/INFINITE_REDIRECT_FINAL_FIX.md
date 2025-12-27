# 무한 리디렉션 루프 최종 해결 가이드

## 🔴 문제 상황

카카오 로그인 시 무한 리디렉션 루프가 계속 발생합니다.

## ✅ 해결 방법

### 1단계: 코드 수정 (완료)

코드에서 `skipBrowserRedirect: false`로 변경했습니다. 이것이 React Native에서 더 안정적인 방법입니다.

### 2단계: Supabase 설정 확인

**중요**: Supabase의 Redirect URLs 설정이 올바른지 확인하세요!

1. **Supabase 대시보드** > **Authentication** > **URL Configuration** 메뉴로 이동

2. **Redirect URLs 확인**
   - 다음 URL이 추가되어 있어야 합니다:
     - `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
     - `parentapp://auth/callback`
   - 각 URL 앞뒤에 공백이 없는지 확인
   - 각 URL이 각각 별도로 표시되는지 확인

3. **Site URL 확인**
   - Site URL이 `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`로 설정되어 있는지 확인
   - 또는 `parentapp://`로 설정되어 있는지 확인

### 3단계: Supabase Kakao Provider 설정 확인

1. **Supabase 대시보드** > **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **Callback URL 확인**
   - Callback URL이 `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`인지 확인
   - 앞뒤 공백이 없는지 확인

3. **Save 버튼 클릭**

### 4단계: 앱 재시작

**중요**: 코드를 수정했으므로 반드시 앱을 재시작해야 합니다!

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

### 5단계: 테스트

1. **카카오 로그인 버튼 클릭**
2. **카카오 로그인 페이지에서 로그인**
3. **리디렉션 루프가 발생하지 않는지 확인**

## 🔍 추가 확인 사항

### Supabase 설정:
- [ ] Redirect URLs에 `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` 추가됨
- [ ] Redirect URLs에 `parentapp://auth/callback` 추가됨
- [ ] 각 URL 앞뒤에 공백 없음
- [ ] Site URL이 올바르게 설정됨

### Kakao Provider 설정:
- [ ] Callback URL: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
- [ ] 앞뒤 공백 없음

## ⚠️ 여전히 안 되는 경우

### 옵션 1: Supabase Site URL 변경

Site URL을 앱의 deep link로 변경해보세요:
- `parentapp://`

### 옵션 2: Redirect URL을 Supabase URL만 사용

일단 Supabase URL만 사용해보세요:
- Redirect URLs에서 `parentapp://auth/callback` 제거
- `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`만 사용

### 옵션 3: Supabase 로그 확인

Supabase 대시보드 > Logs > Auth Logs에서 리디렉션 관련 에러를 확인하세요.

## 요약

**문제**: 무한 리디렉션 루프

**해결**:
1. ✅ 코드 수정: `skipBrowserRedirect: false` (완료)
2. ✅ Supabase Redirect URLs 설정 확인
3. ✅ Supabase Site URL 확인
4. ✅ 앱 재시작

**핵심**: `skipBrowserRedirect: false`로 설정하면 Supabase가 리디렉션을 처리합니다. Supabase의 Redirect URLs 설정이 올바른지 확인하세요!
