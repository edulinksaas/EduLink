# Redirect URI 유효성 검사 오류 해결 가이드

## 🔴 문제 상황

Redirect URI 입력 필드에 빨간 밑줄이 표시되고 저장 버튼이 비활성화되어 있습니다.

**입력된 URL**: `https://munydihxxzoiqguumdytyt.supabase.co/auth/v1/callback`

## ✅ 해결 방법

### 1단계: Supabase 프로젝트 URL 정확히 확인

**중요**: Redirect URI는 Supabase 프로젝트의 정확한 URL과 일치해야 합니다!

1. **Supabase 대시보드** 접속
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Settings** > **API** 메뉴로 이동
   - 좌측 사이드바에서 **Settings** 클릭
   - **API** 서브메뉴 클릭

3. **Project URL** 확인
   - **Project URL** 필드에서 정확한 URL 확인
   - 예: `https://abcdefghijklmnop.supabase.co`
   - 이 URL을 정확히 복사하세요!

4. **Redirect URI 구성**
   - Project URL + `/auth/v1/callback`
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

### 2단계: Redirect URI 정확히 입력

1. **Kakao Developers Console**에서 Redirect URI 입력 필드로 이동

2. **기존 내용 삭제**
   - 입력 필드의 모든 내용 선택 (Ctrl+A)
   - 삭제

3. **정확한 URL 입력**
   - Supabase에서 확인한 Project URL + `/auth/v1/callback`
   - 예: `https://[정확한_PROJECT_ID].supabase.co/auth/v1/callback`
   - **주의사항**:
     - `https://`로 시작
     - `.supabase.co`로 끝나는지 확인
     - `/auth/v1/callback`이 정확히 포함되어 있는지 확인
     - 공백이나 특수문자가 없는지 확인

4. **저장 버튼 활성화 확인**
   - 빨간 밑줄이 사라지고 저장 버튼이 활성화되어야 합니다

### 3단계: Supabase 설정도 확인

1. **Supabase 대시보드** > **Authentication** > **Providers** > **Kakao**

2. **Redirect URL** 필드 확인
   - Kakao Developers Console에 입력한 것과 동일한 URL이어야 합니다
   - 예: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

3. **저장**
   - **Save** 버튼 클릭

## 🔍 확인 사항

### URL 형식 체크리스트:
- [ ] `https://`로 시작하는가?
- [ ] `.supabase.co`로 끝나는가?
- [ ] `/auth/v1/callback`이 정확히 포함되어 있는가?
- [ ] 공백이 없는가?
- [ ] 특수문자가 잘못 포함되지 않았는가?
- [ ] 프로젝트 ID가 정확한가?

### 일반적인 오류:
1. **프로젝트 ID 오류**
   - 잘못된 프로젝트 ID 사용
   - 해결: Supabase Settings > API에서 정확한 Project URL 확인

2. **URL 형식 오류**
   - `http://` 대신 `https://` 사용해야 함
   - `.supabase.co` 대신 다른 도메인 사용
   - 해결: 정확한 형식으로 입력

3. **공백 또는 특수문자**
   - URL에 공백이나 잘못된 특수문자 포함
   - 해결: 공백 제거, 정확히 복사

## 📝 단계별 확인

### 1. Supabase 프로젝트 URL 확인:
```
Supabase 대시보드 > Settings > API > Project URL
예: https://abcdefghijklmnop.supabase.co
```

### 2. Redirect URI 구성:
```
Project URL + /auth/v1/callback
예: https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### 3. Kakao Developers Console에 입력:
```
제품 설정 > 카카오 로그인 > Redirect URI
위에서 구성한 URL 입력
```

### 4. Supabase에도 동일하게 입력:
```
Authentication > Providers > Kakao > Redirect URL
위와 동일한 URL 입력
```

## ⚠️ 주의사항

1. **프로젝트 ID는 대소문자를 구분합니다**
   - 정확히 복사해서 사용하세요

2. **URL 끝에 슬래시(/)가 있으면 안 됩니다**
   - 올바름: `https://xxx.supabase.co/auth/v1/callback`
   - 잘못됨: `https://xxx.supabase.co/auth/v1/callback/`

3. **공백이 포함되면 안 됩니다**
   - 앞뒤 공백 제거 확인

## 요약

**문제**: Redirect URI에 빨간 밑줄, 저장 버튼 비활성화

**해결**:
1. ✅ Supabase Settings > API에서 정확한 Project URL 확인
2. ✅ Project URL + `/auth/v1/callback` 형식으로 Redirect URI 구성
3. ✅ Kakao Developers Console에 정확히 입력
4. ✅ Supabase에도 동일하게 입력

**핵심**: Supabase 프로젝트의 정확한 URL을 확인하고, 그 URL + `/auth/v1/callback` 형식으로 입력해야 합니다!
