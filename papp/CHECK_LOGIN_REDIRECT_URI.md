# 로그인용 Redirect URI 확인 방법

## 단계별 안내

### 1단계: Kakao Developers Console 접속

1. **브라우저에서 접속**
   - https://developers.kakao.com 접속
   - 카카오 계정으로 로그인

2. **내 애플리케이션 선택**
   - 상단 메뉴에서 **내 애플리케이션** 클릭
   - "에듀링크" 앱 클릭

### 2단계: 카카오 로그인 메뉴로 이동

1. **제품 설정 메뉴 클릭**
   - 좌측 메뉴에서 **제품 설정** 클릭

2. **카카오 로그인 클릭**
   - 제품 목록에서 **카카오 로그인** 찾기
   - **카카오 로그인** 클릭

### 3단계: Redirect URI 섹션 찾기

카카오 로그인 페이지에서:

1. **페이지를 아래로 스크롤**
   - 여러 섹션이 있습니다:
     - 활성화 설정
     - Redirect URI ← **여기!**
     - 동의항목
     - 로그아웃 리다이렉트 URI (이건 별도)

2. **Redirect URI 섹션 확인**
   - "Redirect URI" 또는 "리다이렉트 URI" 라는 제목 찾기
   - 로그아웃 리다이렉트 URI와는 **별도의 섹션**입니다

### 4단계: Redirect URI 확인

Redirect URI 섹션에서:

1. **등록된 URI 확인**
   - 목록에 URI가 있는지 확인
   - 다음 형식이어야 합니다:
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
     또는
     ```
     https://munydihxxzoiqguumdyt.supabase.co/auth/v1/callback
     ```

2. **없다면 추가**
   - **Redirect URI 등록** 또는 **+ 추가** 버튼 클릭
   - 입력 필드에 다음 입력:
     ```
     https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
     ```
   - **저장** 또는 **등록** 클릭

### 5단계: 프로젝트 ID 확인

정확한 프로젝트 ID를 확인하려면:

1. **Supabase 대시보드 접속**
   - https://supabase.com 접속
   - 프로젝트 선택

2. **Settings > API 메뉴로 이동**
   - 좌측 메뉴에서 **Settings** 클릭
   - **API** 메뉴 클릭

3. **Project URL 확인**
   - **Project URL** 섹션에서 URL 확인
   - 예시: `https://munydihxxzojgquumdyt.supabase.co`
   - 여기서 `munydihxxzojgquumdyt` 부분이 프로젝트 ID입니다

4. **Kakao Redirect URI와 비교**
   - Kakao Developers Console의 Redirect URI
   - Supabase의 Project URL
   - 프로젝트 ID가 정확히 일치해야 합니다

## 메뉴 구조

```
Kakao Developers Console
└── 내 애플리케이션
    └── [에듀링크 앱 선택]
        └── 제품 설정  ← 여기 클릭!
            └── 카카오 로그인  ← 여기 클릭!
                ├── 활성화 설정
                ├── Redirect URI  ← 여기서 확인!
                ├── 동의항목
                └── 로그아웃 리다이렉트 URI (별도)
```

## 확인 체크리스트

- [ ] Kakao Developers Console 접속
- [ ] 내 애플리케이션 > 앱 선택
- [ ] 제품 설정 > 카카오 로그인 클릭
- [ ] Redirect URI 섹션 찾기 (로그아웃 URI와 별도)
- [ ] 등록된 URI 확인
- [ ] 없으면 추가: `https://[프로젝트ID].supabase.co/auth/v1/callback`
- [ ] 저장 클릭

## 중요 사항

### Redirect URI 형식:
```
https://[프로젝트ID].supabase.co/auth/v1/callback
```

### 확인 사항:
- ✅ `https://`로 시작
- ✅ `/auth/v1/callback`으로 끝남
- ✅ 프로젝트 ID가 정확함
- ✅ 공백이나 특수문자 없음

### 로그인용 vs 로그아웃용:
- **로그인용 Redirect URI**: 카카오 로그인 섹션에 있음
- **로그아웃용 Redirect URI**: 별도 섹션에 있음 (이미 설정됨)

## 요약

**로그인용 Redirect URI 확인 방법:**

1. Kakao Developers Console > 제품 설정 > 카카오 로그인
2. **Redirect URI** 섹션 확인 (로그아웃 URI와 별도)
3. `https://[프로젝트ID].supabase.co/auth/v1/callback` 형식 확인
4. 없으면 추가 후 저장

**핵심**: 로그인용 Redirect URI는 **카카오 로그인** 섹션에 있습니다!
