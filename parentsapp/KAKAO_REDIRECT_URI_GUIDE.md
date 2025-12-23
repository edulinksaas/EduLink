# 카카오 Redirect URI 설정 위치 가이드

## 단계별 안내

### 1단계: Kakao Developers Console 접속

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인

### 2단계: 내 애플리케이션 선택

1. 상단 메뉴에서 **내 애플리케이션** 클릭
2. 등록한 앱을 클릭하여 선택
   - 아직 앱을 등록하지 않았다면 **애플리케이션 추가하기** 클릭하여 먼저 등록

### 3단계: 카카오 로그인 메뉴로 이동

1. 좌측 메뉴에서 **제품 설정** 클릭
2. **카카오 로그인** 항목 찾기
3. **카카오 로그인** 클릭

### 4단계: Redirect URI 설정

**카카오 로그인** 페이지에서:

1. 페이지 중앙 또는 하단에 **Redirect URI** 섹션이 있습니다
2. **Redirect URI 등록** 또는 **+ Redirect URI 추가** 버튼 클릭
3. 입력 필드에 다음 URI 입력:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   > **중요**: `your-project-id`를 실제 Supabase 프로젝트 ID로 변경하세요
   
   예시:
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

4. **등록** 또는 **저장** 버튼 클릭

## Supabase 프로젝트 ID 확인 방법

1. [Supabase](https://supabase.com) 대시보드 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Settings** > **API** 클릭
4. **Project URL**에서 확인:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   여기서 `abcdefghijklmnop` 부분이 프로젝트 ID입니다.

## 스크린샷 위치 설명

### Kakao Developers Console 구조:

```
내 애플리케이션
├── [앱 선택]
    ├── 앱 설정
    │   ├── 앱 키
    │   └── 플랫폼
    ├── 제품 설정  ← 여기!
    │   ├── 카카오 로그인  ← 여기 클릭!
    │   │   ├── 활성화 설정
    │   │   ├── Redirect URI  ← 여기서 설정!
    │   │   └── 동의항목
    │   ├── 카카오톡 메시지
    │   └── 기타 제품들...
    └── 고급
        └── Client Secret
```

## 자세한 단계

### Step 1: 제품 설정 메뉴 찾기

- 좌측 메뉴에서 **제품 설정**을 찾습니다
- 보통 **앱 설정** 아래에 있습니다
- 여러 제품 목록이 표시됩니다

### Step 2: 카카오 로그인 클릭

- **제품 설정** 목록에서 **카카오 로그인** 항목을 찾습니다
- 클릭하면 카카오 로그인 설정 페이지로 이동합니다

### Step 3: Redirect URI 섹션 찾기

카카오 로그인 페이지에서:

1. **활성화 설정** 섹션 확인
   - 여기서 카카오 로그인을 활성화할 수 있습니다
   
2. **Redirect URI** 섹션 찾기
   - 페이지 중앙 또는 하단에 있습니다
   - "Redirect URI" 또는 "리다이렉트 URI" 라고 표시됩니다
   - 기존에 등록된 URI가 있으면 목록으로 표시됩니다

3. **Redirect URI 등록** 버튼 클릭
   - 보통 **+** 아이콘 또는 **등록** 버튼이 있습니다

### Step 4: URI 입력

입력 필드에 다음 형식으로 입력:

```
https://[프로젝트ID].supabase.co/auth/v1/callback
```

예시:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

## 주의사항

1. **정확한 URL 입력**: 
   - `https://`로 시작해야 합니다
   - `/auth/v1/callback`으로 끝나야 합니다
   - 프로젝트 ID가 정확해야 합니다

2. **여러 URI 등록 가능**:
   - 개발용, 프로덕션용 등 여러 URI를 등록할 수 있습니다
   - 각각 별도로 등록하세요

3. **저장 확인**:
   - 등록 후 목록에 표시되는지 확인하세요
   - 목록에 표시되지 않으면 다시 등록하세요

## 문제 해결

### Redirect URI 섹션이 보이지 않는 경우

1. **카카오 로그인 활성화 확인**:
   - 먼저 카카오 로그인을 활성화해야 Redirect URI 설정이 나타날 수 있습니다
   - 활성화 설정에서 토글을 ON으로 변경하세요

2. **페이지 새로고침**:
   - 브라우저를 새로고침해보세요

3. **다른 브라우저로 시도**:
   - 브라우저 캐시 문제일 수 있습니다

### URI 등록이 안 되는 경우

1. **형식 확인**:
   - `https://`로 시작하는지 확인
   - 공백이 없는지 확인

2. **프로젝트 ID 확인**:
   - Supabase 프로젝트 ID가 정확한지 확인

3. **이미 등록된 URI 확인**:
   - 동일한 URI가 이미 등록되어 있으면 중복 등록이 안 될 수 있습니다

## 빠른 체크리스트

- [ ] Kakao Developers Console 접속
- [ ] 내 애플리케이션 > 앱 선택
- [ ] 제품 설정 메뉴 클릭
- [ ] 카카오 로그인 클릭
- [ ] Redirect URI 섹션 찾기
- [ ] Redirect URI 등록 버튼 클릭
- [ ] Supabase 프로젝트 ID 확인
- [ ] URI 입력 (https://[프로젝트ID].supabase.co/auth/v1/callback)
- [ ] 등록/저장 클릭
- [ ] 목록에 표시되는지 확인
