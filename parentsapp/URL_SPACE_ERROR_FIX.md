# URL 공백 오류 해결 가이드

## 🔴 문제 발견!

에러 메시지에서 URL 앞에 공백이 있습니다:

```
"parse \"     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback\": first path segment in URL cannot contain colon"
```

URL 앞에 공백이 5개 정도 있어서 파싱 오류가 발생합니다!

## ✅ 해결 방법

### 1단계: Supabase Kakao Provider Callback URL 확인 및 수정

1. **Supabase 대시보드** > **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **Callback URL (for OAuth) 필드 확인**
   - 현재 입력된 값 확인
   - URL 앞뒤에 공백이 있는지 확인

3. **Callback URL 필드 내용 수정**
   - 필드 내용 전체 선택 (Ctrl+A)
   - 삭제 (Delete)
   - **정확히 다음만 입력** (공백 없이):
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
   - 주의사항:
     - URL 앞에 공백 없음
     - URL 뒤에 공백 없음
     - 중간에 공백 없음
     - 정확히 위 URL만 입력

4. **Save 버튼 클릭**

5. **페이지 새로고침 후 다시 확인**
   - URL 앞뒤에 공백이 없는지 확인

### 2단계: Kakao Developers Console Redirect URI 확인 및 수정

1. **Kakao Developers Console** 접속
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션** > 에듀링크 앱 선택

3. **제품 설정** > **카카오 로그인** > **Redirect URI** 확인

4. **Redirect URI 필드 확인**
   - 현재 입력된 값 확인
   - URL 앞뒤에 공백이 있는지 확인

5. **Redirect URI 필드 내용 수정**
   - 필드 내용 전체 선택 (Ctrl+A)
   - 삭제 (Delete)
   - **정확히 다음만 입력** (공백 없이):
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
   - 주의사항:
     - URL 앞에 공백 없음
     - URL 뒤에 공백 없음
     - 중간에 공백 없음
     - 정확히 위 URL만 입력

6. **저장 버튼 클릭**

### 3단계: Supabase Redirect URLs 확인 및 수정

1. **Supabase 대시보드** > **Authentication** > **URL Configuration** 메뉴로 이동

2. **Redirect URLs 섹션 확인**

3. **각 URL 확인**
   - `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
   - `parentapp://auth/callback`
   - 각 URL 앞뒤에 공백이 없는지 확인

4. **공백이 있는 URL 수정**
   - 공백이 있는 URL 삭제
   - 공백 없이 다시 추가
   - 각 URL을 정확히 입력:
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     parentapp://auth/callback
     ```

5. **저장 확인**

### 4단계: 최종 확인

**모든 URL에서 공백이 제거되었는지 확인:**

- [ ] Supabase Kakao Provider > Callback URL: 공백 없음
- [ ] Kakao Developers Console > Redirect URI: 공백 없음
- [ ] Supabase Redirect URLs: 모든 URL에 공백 없음

### 5단계: 앱 재시작

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 📝 확인 체크리스트

### URL 공백 확인:
- [ ] Supabase Kakao Provider > Callback URL 앞뒤 공백 없음
- [ ] Kakao Developers Console > Redirect URI 앞뒤 공백 없음
- [ ] Supabase Redirect URLs 모든 URL 앞뒤 공백 없음

### URL 정확성 확인:
- [ ] `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` (공백 없음)
- [ ] `parentapp://auth/callback` (공백 없음)

## ⚠️ 주의사항

1. **URL 입력 시 공백 주의**
   - URL을 복사할 때 앞뒤 공백이 포함되지 않도록 주의
   - 수동으로 입력할 때 공백을 입력하지 않도록 주의

2. **복사 후 확인**
   - URL을 복사한 후 붙여넣기 전에 확인
   - 붙여넣은 후에도 앞뒤 공백 확인

3. **저장 후 확인**
   - 저장 후 페이지 새로고침하여 확인
   - URL 앞뒤에 공백이 없는지 다시 확인

## 요약

**문제**: URL 앞에 공백이 있어서 파싱 오류 발생

**해결**:
1. ✅ Supabase Kakao Provider > Callback URL에서 공백 제거
2. ✅ Kakao Developers Console > Redirect URI에서 공백 제거
3. ✅ Supabase Redirect URLs에서 모든 URL의 공백 제거
4. ✅ 앱 재시작

**핵심**: 모든 URL에서 앞뒤 공백을 완전히 제거해야 합니다! 공백이 있으면 파싱 오류가 발생합니다!
