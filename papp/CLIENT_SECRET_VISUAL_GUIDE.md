# 클라이언트 시크릿 찾기 시각적 가이드

## 🎯 어떤 부분을 못 찾으시나요?

### A. Kakao Developers Console에서 클라이언트 시크릿 찾기

#### 경로 1: 앱 키 메뉴 (가장 일반적)

```
Kakao Developers Console
└── 내 애플리케이션 (상단 메뉴 또는 좌측 사이드바)
    └── 에듀링크 앱 클릭
        └── 좌측 사이드바에서 "앱 키" 클릭
            └── 페이지 중앙에 "REST API 키" 섹션
                └── "클라이언트 시크릿" 버튼 클릭
```

**찾는 방법:**
1. https://developers.kakao.com 접속
2. 로그인 후 **내 애플리케이션** 클릭
3. **에듀링크** 앱 선택
4. 좌측 사이드바에서 **"앱 키"** 메뉴 찾기
   - 메뉴 목록: 앱 설정, 앱 키, 플랫폼 키, 제품 설정, 앱 도메인 등
5. **앱 키** 페이지에서:
   - **REST API 키** 섹션 찾기 (큰 박스 형태)
   - 그 아래에 **"클라이언트 시크릿"** 버튼이 있습니다
   - 버튼을 클릭하면 클라이언트 시크릿이 표시됩니다

#### 경로 2: 플랫폼 키 메뉴

```
Kakao Developers Console
└── 내 애플리케이션
    └── 에듀링크 앱 클릭
        └── 좌측 사이드바에서 "플랫폼 키" 클릭
            └── "REST API 키" 섹션
                └── "클라이언트 시크릿" 버튼
```

### B. Supabase에서 Client Secret 입력 위치

#### 경로:

```
Supabase 대시보드
└── 프로젝트 선택
    └── 좌측 사이드바에서 "Authentication" 클릭
        └── "Providers" 서브메뉴 클릭
            └── 페이지에서 "Kakao" 찾기
                └── Kakao 행 클릭 또는 설정 버튼 클릭
                    └── 설정 페이지에서 "Client Secret" 필드 찾기
```

**찾는 방법:**
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. 좌측 사이드바에서 **"Authentication"** 메뉴 찾기
   - 아이콘: 자물쇠 모양 또는 사람 모양
4. **Authentication** 메뉴를 클릭하면 하위 메뉴가 나타납니다:
   - Users
   - Policies
   - **Providers** ← 이걸 클릭!
5. **Providers** 페이지에서:
   - 여러 소셜 로그인 제공자 목록이 보입니다:
     - Google
     - **Kakao** ← 이걸 찾으세요!
     - Naver
     - Apple
     - 등등...
6. **Kakao** 행을 클릭하거나, Kakao 옆의 **"설정"** 또는 **"Edit"** 버튼 클릭
7. 설정 페이지가 열리면:
   - **Enabled**: 토글 스위치
   - **Client ID (REST API Key)**: 입력 필드
   - **Client Secret**: ← **여기가 클라이언트 시크릿 입력 필드입니다!**
   - **Redirect URL**: 입력 필드
   - **Allow users without an email**: 토글 스위치

## 🔍 구체적으로 어디서 막히시나요?

### 1. Kakao Developers Console에서 "앱 키" 메뉴를 못 찾으시나요?
   - 좌측 사이드바를 확인하세요
   - 또는 상단 탭 메뉴를 확인하세요
   - "앱 설정" 옆에 "앱 키"가 있을 것입니다

### 2. "클라이언트 시크릿" 버튼을 못 찾으시나요?
   - REST API 키 섹션 아래를 확인하세요
   - 버튼이 보이지 않으면 클라이언트 시크릿이 비활성화된 것일 수 있습니다
   - "생성" 또는 "활성화" 버튼이 있을 수 있습니다

### 3. Supabase에서 "Authentication" 메뉴를 못 찾으시나요?
   - 좌측 사이드바를 확인하세요
   - "Table Editor", "SQL Editor", "Authentication" 등이 있습니다
   - "Authentication"은 자물쇠 아이콘이 있을 수 있습니다

### 4. Supabase에서 "Providers" 서브메뉴를 못 찾으시나요?
   - "Authentication" 메뉴를 클릭하면 하위 메뉴가 나타납니다
   - "Users", "Policies", "Providers" 등이 있습니다
   - "Providers"를 클릭하세요

### 5. Supabase에서 "Kakao"를 못 찾으시나요?
   - Providers 페이지에서 여러 제공자 목록을 스크롤하세요
   - "Kakao" 또는 "카카오"로 표시되어 있을 수 있습니다
   - 알파벳 순서로 정렬되어 있을 수 있습니다

### 6. Supabase에서 "Client Secret" 필드를 못 찾으시나요?
   - Kakao 설정 페이지에서 여러 필드가 보입니다
   - "Client ID" 아래에 "Client Secret" 필드가 있습니다
   - 입력 필드 형태로 되어 있습니다

## 📸 스크린샷을 보내주시면 더 정확하게 도와드릴 수 있습니다!

어떤 화면에서 막히셨는지 스크린샷을 보내주시면:
- 정확한 위치를 알려드릴 수 있습니다
- 화살표로 표시해드릴 수 있습니다
- 단계별로 더 자세히 안내해드릴 수 있습니다

## 💡 빠른 확인 방법

### Kakao Developers Console
1. 브라우저에서 https://developers.kakao.com 접속
2. 로그인
3. 상단 메뉴에서 **"내 애플리케이션"** 클릭
4. 앱 목록에서 **"에듀링크"** 클릭
5. 좌측 사이드바에서 **"앱 키"** 클릭
6. 페이지 중앙의 **"REST API 키"** 섹션 확인
7. 그 아래 **"클라이언트 시크릿"** 버튼 찾기

### Supabase
1. 브라우저에서 https://app.supabase.com 접속
2. 로그인
3. 프로젝트 선택
4. 좌측 사이드바에서 **"Authentication"** 클릭
5. **"Providers"** 클릭
6. **"Kakao"** 찾기
7. **"Kakao"** 클릭
8. **"Client Secret"** 필드 찾기

## 🆘 여전히 못 찾으시면

다음 정보를 알려주세요:
1. **어느 사이트에서 막히셨나요?** (Kakao Developers Console / Supabase)
2. **어느 단계에서 막히셨나요?** (예: "앱 키 메뉴를 못 찾겠어요")
3. **화면에 무엇이 보이나요?** (스크린샷이 가장 좋습니다!)

이 정보를 주시면 더 정확하게 도와드릴 수 있습니다!
