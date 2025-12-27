# 모바일 localhost:3000 연결 오류 해결 가이드

## 🔴 문제 원인

모바일에서 카카오 로그인 시 `localhost:3000`에 연결할 수 없다는 에러가 발생합니다.

**원인**: 
- 모바일 기기에서 `localhost`는 기기 자체를 가리킵니다
- 개발 서버가 실행 중인 컴퓨터를 가리키지 않습니다
- Supabase의 Redirect URL 설정이 잘못되었을 가능성이 있습니다

## ✅ 해결 방법

### 1단계: Supabase Redirect URL 확인 및 수정

**중요**: Supabase의 Redirect URL은 **Supabase URL**이어야 합니다!

1. **Supabase 대시보드** 접속
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Authentication** > **URL Configuration** 메뉴로 이동
   - 좌측 사이드바에서 **Authentication** 클릭
   - **URL Configuration** 서브메뉴 클릭

3. **Redirect URLs** 확인
   - **Site URL**: 앱의 메인 URL (예: `parentapp://`)
   - **Redirect URLs**: 다음을 추가:
     ```
     parentapp://auth/callback
     exp://localhost:8081/--/auth/callback
     ```
   - **중요**: `localhost:3000`이 있으면 삭제하세요!

4. **저장**
   - **Save** 버튼 클릭

### 2단계: Supabase Kakao Provider 설정 확인

1. **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **Redirect URL** 확인
   - **Redirect URL** 필드에 다음이 입력되어 있어야 합니다:
     ```
     https://[PROJECT_ID].supabase.co/auth/v1/callback
     ```
   - `[PROJECT_ID]`는 실제 프로젝트 ID로 대체됩니다
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
   - **중요**: `localhost:3000`이 있으면 삭제하고 위 URL로 변경하세요!

3. **저장**
   - **Save** 버튼 클릭

### 3단계: Kakao Developers Console Redirect URI 확인

1. **Kakao Developers Console** 접속
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 에듀링크 앱 선택

3. **제품 설정** > **카카오 로그인** > **Redirect URI** 확인

4. **Redirect URI** 확인
   - 다음이 등록되어 있어야 합니다:
     ```
     https://[PROJECT_ID].supabase.co/auth/v1/callback
     ```
   - `[PROJECT_ID]`는 실제 Supabase 프로젝트 ID
   - **중요**: `localhost:3000`이 있으면 삭제하세요!

5. **저장**
   - **저장** 버튼 클릭

### 4단계: 앱 재시작

```bash
cd app
# 개발 서버 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 🔍 Supabase Redirect URL 찾는 방법

### Supabase 프로젝트 URL 확인:

1. **Supabase 대시보드** > **Settings** > **API**
2. **Project URL** 확인
   - 예: `https://abcdefghijklmnop.supabase.co`
3. **Redirect URL**은 다음과 같이 구성:
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

## 📝 체크리스트

### Supabase 설정:
- [ ] Authentication > URL Configuration > Redirect URLs 확인
- [ ] `parentapp://auth/callback` 추가
- [ ] `localhost:3000` 제거
- [ ] Authentication > Providers > Kakao > Redirect URL 확인
- [ ] `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식 확인
- [ ] `localhost:3000` 제거
- [ ] Save 버튼 클릭

### Kakao Developers Console:
- [ ] Redirect URI 확인
- [ ] `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식 확인
- [ ] `localhost:3000` 제거
- [ ] 저장

### 앱:
- [ ] 개발 서버 재시작
- [ ] 앱 재시작
- [ ] 카카오 로그인 테스트

## ⚠️ 주의사항

1. **모바일에서는 `localhost`를 사용할 수 없습니다**
   - 모바일 기기에서 `localhost`는 기기 자체를 가리킵니다
   - 개발 서버가 실행 중인 컴퓨터를 가리키지 않습니다

2. **Supabase Redirect URL은 항상 Supabase URL이어야 합니다**
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - 이것이 Kakao Developers Console에도 등록되어 있어야 합니다

3. **앱의 Deep Link는 별도로 설정됩니다**
   - `parentapp://auth/callback`은 앱 내부에서 사용됩니다
   - Supabase가 인증 후 이 deep link로 리다이렉트합니다

## 요약

**문제**: 모바일에서 `localhost:3000` 연결 오류

**해결**:
1. ✅ Supabase Redirect URL을 Supabase URL로 변경
2. ✅ Kakao Developers Console Redirect URI 확인
3. ✅ `localhost:3000` 제거
4. ✅ 앱 재시작

**핵심**: Supabase의 Redirect URL은 항상 `https://[PROJECT_ID].supabase.co/auth/v1/callback` 형식이어야 합니다!
