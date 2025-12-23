# 카카오 로그인 500 에러 완전 체크리스트

## 🔴 현재 상황

카카오 로그인 시 Supabase에서 500 에러 발생:
```
https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
```

## ✅ 확인해야 할 모든 항목 (순서대로)

### 1단계: Supabase Redirect URLs 설정 확인 ⭐ (가장 중요!)

**위치**: Supabase 대시보드 > Authentication > URL Configuration

**확인 사항:**
- [ ] **잘못된 URL이 삭제되었는가?**
  - `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callbackparentapp://auth/callback` 같은 합쳐진 URL이 있으면 삭제

- [ ] **두 개의 URL이 각각 별도로 추가되어 있는가?**
  1. `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
  2. `parentapp://auth/callback`
  - 각각 별도로 표시되어야 함
  - "Total URLs: 2"로 표시되어야 함

- [ ] **URL에 오타가 없는가?**
  - 첫 번째 URL: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
  - 두 번째 URL: `parentapp://auth/callback`
  - 공백이나 특수문자가 없는지 확인

**수정 방법:**
1. 잘못된 URL 삭제
2. 첫 번째 URL 입력 → "Add URL" 클릭
3. 두 번째 URL 입력 → "Add URL" 클릭
4. 페이지 새로고침 후 확인

---

### 2단계: Supabase Kakao Provider 설정 확인 ⭐⭐ (매우 중요!)

**위치**: Supabase 대시보드 > Authentication > Providers > Kakao

**확인 사항:**

#### A. Enabled 설정
- [ ] **Enabled가 ON인가?**
  - OFF라면 ON으로 변경
  - 변경 후 Save 버튼 클릭

#### B. Client ID (REST API Key)
- [ ] **Client ID가 입력되어 있는가?**
- [ ] **Kakao Developers Console의 REST API Key와 정확히 일치하는가?**
  - Kakao Developers Console > 앱 키 > REST API 키 확인
  - Supabase의 Client ID와 비교
  - 다르다면 Supabase에 정확히 입력

#### C. Client Secret ⭐⭐⭐ (가장 중요!)
- [ ] **Client Secret이 입력되어 있는가?**
- [ ] **Kakao Developers Console의 클라이언트 시크릿과 정확히 일치하는가?**
  - Kakao Developers Console > 앱 키 > REST API 키 > 클라이언트 시크릿 확인
  - Supabase의 Client Secret과 비교
  - **다르다면:**
    1. Supabase의 Client Secret 필드 내용 완전히 삭제 (Ctrl+A → Delete)
    2. Kakao에서 클라이언트 시크릿 전체 복사
    3. Supabase에 붙여넣기
    4. 앞뒤 공백 확인 (없어야 함)
    5. 전체가 정확히 입력되었는지 확인

#### D. Redirect URL
- [ ] **Redirect URL이 정확히 입력되어 있는가?**
  - 정확한 형식: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
  - `https://`로 시작하는지 확인
  - `.supabase.co`로 끝나는지 확인
  - `/auth/v1/callback`이 정확히 포함되어 있는지 확인
  - 공백이나 특수문자가 없는지 확인
  - `localhost:3000`이 아닌지 확인

#### E. Allow users without an email
- [ ] **Allow users without an email이 ON인가?**
  - ON으로 설정되어 있어야 함

**수정 후:**
- [ ] **Save 버튼 클릭**
- [ ] **페이지 새로고침 (F5)**
- [ ] **다시 확인**

---

### 3단계: Kakao Developers Console 설정 확인

**위치**: Kakao Developers Console > 내 애플리케이션 > 에듀링크 앱

**확인 사항:**

#### A. Redirect URI 설정
- [ ] **제품 설정 > 카카오 로그인 > Redirect URI 확인**
- [ ] **다음이 정확히 등록되어 있는가?**
  ```
  https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
  ```
- [ ] **오타가 없는가?**
  - `https://`로 시작하는지 확인
  - `munydihxxzojgquumdyt` 프로젝트 ID가 정확한지 확인
  - `.supabase.co`로 끝나는지 확인
  - `/auth/v1/callback`이 정확히 포함되어 있는지 확인
- [ ] **저장되어 있는가?**
  - 저장 버튼 클릭 확인

#### B. REST API Key 확인
- [ ] **앱 키 > REST API 키 확인**
- [ ] **Supabase의 Client ID와 일치하는가?**
  - Kakao REST API Key: `22459018fd3a61dbf1ed0c826f3b95b4` (예시)
  - Supabase Client ID와 비교

#### C. 클라이언트 시크릿 확인
- [ ] **앱 키 > REST API 키 > 클라이언트 시크릿 확인**
- [ ] **클라이언트 시크릿이 활성화되어 있는가?**
- [ ] **Supabase의 Client Secret과 일치하는가?**
  - Kakao 클라이언트 시크릿 전체 복사
  - Supabase Client Secret과 비교
  - 다르다면 Supabase에 정확히 입력

---

### 4단계: Supabase 프로젝트 URL 확인

**위치**: Supabase 대시보드 > Settings > API

**확인 사항:**
- [ ] **Project URL 확인**
  - 정확히 `https://munydihxxzojgquumdyt.supabase.co`인가?
  - 다르다면 정확한 URL 확인

- [ ] **Redirect URL 구성 확인**
  - Project URL + `/auth/v1/callback`
  - 예: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
  - 이 URL이 Kakao Provider 설정과 일치하는지 확인
  - 이 URL이 Kakao Developers Console Redirect URI와 일치하는지 확인

---

### 5단계: 설정 일치 확인 (최종 확인)

**중요**: 다음 세 곳의 설정이 모두 일치해야 합니다!

#### A. Supabase Settings > API > Project URL
- [ ] `https://munydihxxzojgquumdyt.supabase.co`

#### B. Supabase Authentication > Providers > Kakao > Redirect URL
- [ ] `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`

#### C. Kakao Developers Console > Redirect URI
- [ ] `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`

**모두 동일한 프로젝트 ID (`munydihxxzojgquumdyt`)를 사용해야 합니다!**

#### D. 클라이언트 시크릿 일치 확인
- [ ] Kakao Developers Console의 클라이언트 시크릿
- [ ] Supabase Kakao Provider의 Client Secret
- [ ] **두 값이 정확히 일치하는가?**

---

### 6단계: Supabase 로그 확인

**위치**: Supabase 대시보드 > Logs > Auth Logs

**확인 사항:**
- [ ] **에러 발생 시점의 로그 확인**
- [ ] **구체적인 에러 메시지 확인**
  - 클라이언트 시크릿 검증 실패?
  - Redirect URL 불일치?
  - Kakao API 응답 오류?
  - 기타 서버 측 오류?

**로그에서 확인한 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다!**

---

### 7단계: 앱 재시작

**중요**: 설정을 변경한 후 반드시 앱을 재시작해야 합니다!

```bash
cd app
# 개발 서버 완전히 종료 (Ctrl+C)
npx expo start -c
```

- [ ] **개발 서버 완전히 종료**
- [ ] **캐시 삭제 후 재시작 (`-c` 옵션)**
- [ ] **앱 완전히 종료 후 재시작**

---

## 📝 최종 체크리스트 요약

### Supabase 설정:
- [ ] Redirect URLs: 두 개의 URL이 각각 별도로 추가됨
- [ ] Kakao Provider > Enabled: ON
- [ ] Kakao Provider > Client ID: Kakao REST API Key와 일치
- [ ] Kakao Provider > Client Secret: Kakao 클라이언트 시크릿과 일치 (재입력 완료)
- [ ] Kakao Provider > Redirect URL: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
- [ ] Kakao Provider > Allow users without an email: ON
- [ ] 모든 설정 후 Save 버튼 클릭
- [ ] 페이지 새로고침 후 확인

### Kakao Developers Console:
- [ ] Redirect URI: `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
- [ ] REST API Key: Supabase Client ID와 일치
- [ ] 클라이언트 시크릿: Supabase Client Secret과 일치
- [ ] 저장 확인

### 설정 일치 확인:
- [ ] Supabase Project URL과 Redirect URL의 프로젝트 ID 일치
- [ ] Kakao Redirect URI와 Supabase Redirect URL 일치
- [ ] 클라이언트 시크릿 일치

### 앱:
- [ ] 개발 서버 재시작 완료
- [ ] 앱 재시작 완료

---

## 🆘 여전히 안 되는 경우

1. **Supabase 로그 확인**
   - Logs > Auth Logs에서 구체적인 에러 확인
   - 에러 메시지를 알려주시면 더 정확한 해결 방법 제시 가능

2. **클라이언트 시크릿 재생성**
   - Kakao Developers Console에서 클라이언트 시크릿 재생성
   - 새로 생성된 클라이언트 시크릿을 Supabase에 입력

3. **각 설정을 스크린샷으로 확인**
   - Supabase Redirect URLs 설정
   - Supabase Kakao Provider 설정
   - Kakao Developers Console Redirect URI 설정
   - 스크린샷을 보내주시면 더 정확히 확인 가능

---

## 요약

**500 에러 해결을 위한 확인 순서:**

1. ✅ **Supabase Redirect URLs 설정** (두 개의 URL이 각각 별도로 추가되어 있는지)
2. ✅ **Supabase Kakao Provider 설정** (Client Secret 재입력 포함)
3. ✅ **Kakao Developers Console 설정** (Redirect URI 확인)
4. ✅ **설정 일치 확인** (세 곳의 설정이 모두 일치하는지)
5. ✅ **Supabase 로그 확인** (구체적인 에러 원인 파악)
6. ✅ **앱 재시작**

**핵심**: 클라이언트 시크릿과 Redirect URL이 정확히 설정되어 있고, 세 곳의 설정이 모두 일치해야 합니다!
