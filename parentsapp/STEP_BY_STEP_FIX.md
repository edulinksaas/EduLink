# KOE101 에러 해결 - 단계별 가이드

## 🎯 목표: 카카오 로그인이 정상 작동하도록 설정하기

---

## 1단계: Supabase 프로젝트 URL 확인하기

### 📍 Supabase 대시보드에서 프로젝트 URL 찾기

1. **브라우저에서 Supabase 접속**
   - https://supabase.com 접속
   - 로그인

2. **프로젝트 선택**
   - 대시보드에서 사용 중인 프로젝트 클릭

3. **Settings 메뉴 찾기**
   - 좌측 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
   - 또는 좌측 하단의 **Settings** 클릭

4. **API 메뉴 클릭**
   - Settings 메뉴에서 **API** 클릭

5. **Project URL 확인**
   - **Project URL** 섹션에서 URL 확인
   - 예시: `https://abcdefghijklmnop.supabase.co`
   - 이 URL을 복사하거나 메모해두세요!

6. **프로젝트 ID 추출**
   - URL에서 `https://`와 `.supabase.co` 사이의 부분이 프로젝트 ID입니다
   - 예시: `abcdefghijklmnop` (이 부분이 프로젝트 ID)

---

## 2단계: Kakao Developers Console에서 Redirect URI 설정하기

### 📍 Redirect URI 등록하기

1. **Kakao Developers Console 접속**
   - https://developers.kakao.com 접속
   - 카카오 계정으로 로그인

2. **내 애플리케이션 선택**
   - 상단 메뉴에서 **내 애플리케이션** 클릭
   - 등록한 앱 클릭

3. **제품 설정 메뉴로 이동**
   - 좌측 메뉴에서 **제품 설정** 클릭
   - 여러 제품 목록이 표시됩니다

4. **카카오 로그인 클릭**
   - 제품 목록에서 **카카오 로그인** 찾기
   - **카카오 로그인** 클릭

5. **카카오 로그인 활성화 확인**
   - 페이지 상단에 **카카오 로그인 활성화** 토글이 있습니다
   - **ON**으로 설정되어 있는지 확인
   - **OFF**라면 **ON**으로 변경 후 저장

6. **Redirect URI 섹션 찾기**
   - 페이지를 아래로 스크롤
   - **Redirect URI** 또는 **리다이렉트 URI** 섹션 찾기

7. **Redirect URI 추가**
   - **Redirect URI 등록** 또는 **+ 추가** 버튼 클릭
   - 입력 필드에 다음 형식으로 입력:
     ```
     https://[프로젝트ID].supabase.co/auth/v1/callback
     ```
   - 예시 (프로젝트 ID가 `abcdefghijklmnop`인 경우):
     ```
     https://abcdefghijklmnop.supabase.co/auth/v1/callback
     ```

8. **저장**
   - **등록** 또는 **저장** 버튼 클릭
   - 목록에 추가되었는지 확인

### ⚠️ 중요 확인 사항:
- ✅ `https://`로 시작해야 함 (http 아님)
- ✅ `/auth/v1/callback`으로 끝나야 함
- ✅ 프로젝트 ID가 정확해야 함
- ✅ 공백이나 특수문자가 없어야 함

---

## 3단계: Supabase에서 Kakao 프로바이더 설정하기

### 📍 Supabase 대시보드에서 설정하기

1. **Supabase 대시보드 접속**
   - https://supabase.com 접속
   - 프로젝트 선택

2. **Authentication 메뉴로 이동**
   - 좌측 메뉴에서 **Authentication** 클릭
   - **Providers** 메뉴 클릭

3. **Kakao 프로바이더 찾기**
   - 프로바이더 목록에서 **Kakao** 찾기
   - **Kakao** 클릭 또는 설정 열기

4. **Enabled 토글 확인**
   - **Enabled** 토글이 **ON**인지 확인
   - **OFF**라면 **ON**으로 변경

5. **Client ID 입력**
   - **Client ID (for OAuth)** 필드 찾기
   - Kakao Developers Console에서 REST API 키 복사:
     - Kakao Developers Console > 내 애플리케이션 > 앱 선택
     - **앱 설정** > **앱 키** 메뉴로 이동
     - **REST API 키** 복사
   - Supabase의 **Client ID (for OAuth)** 필드에 붙여넣기

6. **Client Secret 입력**
   - **Client Secret (for OAuth)** 필드 찾기
   - Kakao Developers Console에서 Client Secret 확인:
     - Kakao Developers Console > 내 애플리케이션 > 앱 선택
     - **고급** 탭으로 이동
     - **Client Secret 코드 생성** 클릭 (없으면 생성)
     - 생성된 **Client Secret** 복사
   - Supabase의 **Client Secret (for OAuth)** 필드에 붙여넣기

7. **저장**
   - **Save** 버튼 클릭
   - 설정이 저장되었는지 확인

---

## 4단계: 설정 확인 및 테스트

### ✅ 최종 확인 체크리스트

#### Kakao Developers Console:
- [ ] 카카오 로그인 활성화 (ON)
- [ ] Redirect URI 등록됨
- [ ] Redirect URI 형식: `https://[프로젝트ID].supabase.co/auth/v1/callback`
- [ ] REST API 키 확인됨
- [ ] Client Secret 생성됨

#### Supabase:
- [ ] Kakao 프로바이더 활성화 (Enabled ON)
- [ ] Client ID에 REST API 키 입력됨
- [ ] Client Secret 입력됨
- [ ] 설정 저장됨

### 🧪 테스트하기

1. **앱 재시작**
   ```bash
   cd app
   npm start
   ```

2. **카카오 로그인 테스트**
   - 앱 실행
   - 로그인 화면에서 **카카오로 로그인** 버튼 클릭
   - 카카오 로그인 페이지가 정상적으로 열리는지 확인

---

## 🆘 문제 해결

### Redirect URI가 보이지 않는 경우:
- 카카오 로그인을 먼저 활성화해야 Redirect URI 설정이 나타날 수 있습니다
- 카카오 로그인 활성화 토글을 **ON**으로 설정하세요

### 설정이 저장되지 않는 경우:
- 브라우저를 새로고침해보세요
- 다른 브라우저로 시도해보세요
- 설정을 다시 확인하고 저장하세요

### 여전히 에러가 발생하는 경우:
1. 모든 설정을 다시 한 번 확인하세요
2. Redirect URI가 정확한지 다시 확인하세요
3. Supabase와 Kakao Developers Console 모두에서 설정이 저장되었는지 확인하세요

---

## 📝 요약

**가장 중요한 3가지:**

1. ✅ **Redirect URI 설정**: `https://[프로젝트ID].supabase.co/auth/v1/callback`
2. ✅ **Supabase에 REST API 키 입력**: Client ID 필드에
3. ✅ **Supabase에 Client Secret 입력**: Client Secret 필드에

이 3가지만 정확히 설정하면 대부분 해결됩니다!
