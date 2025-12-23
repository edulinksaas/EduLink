# 클라이언트 시크릿 오타 수정 가이드

## 🔴 문제 발견!

클라이언트 시크릿에 오타가 있습니다!

**Kakao Developers Console:**
```
Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T
```
(끝에서 두 번째 문자가 소문자 `o`)

**Supabase:**
```
Ao2aNgQvVrfYbEN5GtHtBle50PCdMV7T
```
(끝에서 두 번째 문자가 숫자 `0`)

**차이점**: `5o` vs `50` (소문자 `o` vs 숫자 `0`)

이것이 500 에러의 원인입니다!

## ✅ 해결 방법

### 1단계: Supabase에서 클라이언트 시크릿 수정

1. **Supabase 대시보드** > **Authentication** > **Providers** > **Kakao** 메뉴로 이동

2. **Client Secret Code 필드 확인**
   - 현재: `Ao2aNgQvVrfYbEN5GtHtBle50PCdMV7T` (잘못됨)

3. **클라이언트 시크릿 필드 내용 완전히 삭제**
   - 필드 내용 전체 선택 (Ctrl+A)
   - 삭제 (Delete)

4. **Kakao Developers Console에서 정확한 클라이언트 시크릿 복사**
   - Kakao Developers Console > 앱 키 > REST API 키 > 클라이언트 시크릿
   - 클라이언트 시크릿: `Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T`
   - **전체 선택 후 복사** (Ctrl+A → Ctrl+C)
   - 주의: 끝에서 두 번째 문자가 소문자 `o`인지 확인!

5. **Supabase에 붙여넣기**
   - Client Secret Code 필드에 붙여넣기 (Ctrl+V)
   - 정확히 `Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T`인지 확인
   - 끝에서 두 번째 문자가 소문자 `o`인지 확인!

6. **Save 버튼 클릭**

7. **페이지 새로고침 후 다시 확인**
   - 클라이언트 시크릿이 정확히 입력되었는지 확인

### 2단계: 설정 확인

**최종 확인:**

- [ ] Kakao 클라이언트 시크릿: `Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T` (소문자 `o`)
- [ ] Supabase 클라이언트 시크릿: `Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T` (소문자 `o`)
- [ ] 두 값이 정확히 일치하는가?

### 3단계: 앱 재시작

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

앱을 완전히 종료한 후 재시작하세요.

## 📝 확인 사항

### 현재 설정 상태 (스크린샷 기준):

✅ **Kakao Developers Console:**
- Redirect URI: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` ✅
- 클라이언트 시크릿: `Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T` ✅
- 활성화: ON ✅

✅ **Supabase Redirect URLs:**
- `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` ✅
- `parentapp://auth/callback` ✅
- Total URLs: 2 ✅

✅ **Supabase Kakao Provider:**
- Enabled: ON ✅
- REST API Key: `22459018fd3a61dbf1ed0c826f3b95b4` ✅
- Callback URL: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` ✅
- Allow users without an email: ON ✅
- ❌ **Client Secret Code: `Ao2aNgQvVrfYbEN5GtHtBle50PCdMV7T` (잘못됨!)** ← 이것을 수정해야 함!

## ⚠️ 주의사항

1. **클라이언트 시크릿 정확성**
   - 소문자 `o`와 숫자 `0`을 구분해야 합니다
   - 대문자 `O`와 숫자 `0`을 구분해야 합니다
   - 수동으로 입력하지 말고 복사해서 붙여넣기

2. **복사 시 주의**
   - Kakao에서 클라이언트 시크릿을 복사할 때 전체를 정확히 복사
   - 앞뒤 공백이 포함되지 않도록 주의

3. **저장 확인**
   - Supabase에서 입력 후 반드시 **Save** 버튼 클릭
   - 저장 후 페이지 새로고침하여 확인

## 요약

**문제**: 클라이언트 시크릿 오타 (`5o` vs `50`)

**해결**:
1. ✅ Supabase Client Secret Code 필드 내용 삭제
2. ✅ Kakao에서 정확한 클라이언트 시크릿 복사 (`Ao2aNgQvVrfYbEN5GtHtBle5oPCdMV7T`)
3. ✅ Supabase에 붙여넣기
4. ✅ Save 버튼 클릭
5. ✅ 앱 재시작

**핵심**: 클라이언트 시크릿이 정확히 일치해야 합니다! 소문자 `o`와 숫자 `0`을 구분하세요!
