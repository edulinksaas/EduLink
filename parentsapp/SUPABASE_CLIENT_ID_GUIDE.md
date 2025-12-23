# Supabase Client ID 설정 위치 가이드

## 중요: Supabase Client ID는 Kakao REST API 키입니다!

**Supabase 자체의 Client ID가 아니라**, Supabase 대시보드에서 **Kakao 프로바이더 설정** 시 입력하는 필드에 **Kakao REST API 키**를 입력하는 것입니다.

## 설정 위치

### 1단계: Supabase 대시보드 접속

1. [Supabase](https://supabase.com) 접속 및 로그인
2. 프로젝트 선택

### 2단계: Authentication 메뉴로 이동

1. 좌측 메뉴에서 **Authentication** 클릭
2. **Providers** 메뉴 클릭

### 3단계: Kakao 프로바이더 찾기

1. 프로바이더 목록에서 **Kakao** 찾기
2. **Kakao** 클릭 또는 설정 열기

### 4단계: Client ID 입력 필드 확인

Kakao 프로바이더 설정 페이지에서 다음 필드를 찾으세요:

```
┌─────────────────────────────────────┐
│ Kakao Provider Settings             │
├─────────────────────────────────────┤
│ ☑ Enabled (토글)                    │
│                                     │
│ Client ID (for OAuth): [여기 입력] │ ← 이곳!
│                                     │
│ Client Secret (for OAuth): [입력]  │
│                                     │
│ Redirect URL:                       │
│ https://...supabase.co/auth/v1/... │
│                                     │
│ [Save] 버튼                         │
└─────────────────────────────────────┘
```

## 입력해야 할 값

### Client ID (for OAuth) 필드에 입력:

**Kakao Developers Console의 REST API 키**를 입력합니다.

1. Kakao Developers Console 접속
2. 내 애플리케이션 > 앱 선택
3. **앱 설정** > **앱 키** 메뉴로 이동
4. **REST API 키** 복사
5. Supabase의 **Client ID (for OAuth)** 필드에 붙여넣기

### Client Secret (for OAuth) 필드에 입력:

**Kakao Developers Console의 Client Secret**을 입력합니다.

1. Kakao Developers Console > 내 애플리케이션 > 앱 선택
2. **고급** 탭으로 이동
3. **Client Secret 코드 생성** 클릭
4. 생성된 **Client Secret** 복사
5. Supabase의 **Client Secret (for OAuth)** 필드에 붙여넣기

## 단계별 스크린샷 설명

### Supabase 대시보드 구조:

```
Supabase Dashboard
├── 프로젝트 선택
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Authentication  ← 여기 클릭!
│   │   ├── Users
│   │   ├── Policies
│   │   └── Providers  ← 여기 클릭!
│   │       ├── Email
│   │       ├── Google
│   │       ├── Kakao  ← 여기 클릭!
│   │       │   ├── Enabled (토글)
│   │       │   ├── Client ID (for OAuth)  ← REST API 키 입력!
│   │       │   ├── Client Secret (for OAuth)  ← Client Secret 입력!
│   │       │   └── [Save] 버튼
│   │       └── Naver
│   └── Settings
```

## 정확한 설정 순서

### 1. Kakao REST API 키 확인

```
Kakao Developers Console
→ 내 애플리케이션
→ 앱 선택
→ 앱 설정
→ 앱 키
→ REST API 키 복사
```

### 2. Kakao Client Secret 생성

```
Kakao Developers Console
→ 내 애플리케이션
→ 앱 선택
→ 고급 탭
→ Client Secret 코드 생성
→ Client Secret 복사
```

### 3. Supabase에 입력

```
Supabase Dashboard
→ 프로젝트 선택
→ Authentication
→ Providers
→ Kakao
→ Enabled ON
→ Client ID (for OAuth): [REST API 키 붙여넣기]
→ Client Secret (for OAuth): [Client Secret 붙여넣기]
→ Save
```

## 주의사항

1. **Client ID = REST API 키**: Supabase의 "Client ID" 필드에 Kakao의 REST API 키를 입력합니다
2. **Supabase 자체 키 아님**: Supabase의 Anon Key나 Service Role Key가 아닙니다
3. **정확한 값 입력**: 공백이나 특수문자가 포함되지 않았는지 확인
4. **저장 확인**: Save 버튼을 클릭한 후 설정이 저장되었는지 확인

## 확인 방법

설정이 올바르게 되었는지 확인:

1. Supabase > Authentication > Providers > Kakao
2. Enabled가 ON인지 확인
3. Client ID와 Client Secret이 입력되어 있는지 확인
4. 앱에서 카카오 로그인 테스트

## 요약

- **Supabase Client ID 위치**: Authentication > Providers > Kakao > Client ID (for OAuth)
- **입력할 값**: Kakao Developers Console의 REST API 키
- **Client Secret**: Kakao Developers Console의 Client Secret

**핵심**: Supabase의 "Client ID" 필드는 Kakao의 REST API 키를 입력하는 곳입니다!
