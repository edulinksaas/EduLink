# 카카오 KOE101 에러 해결 가이드

## 에러 정보
- **에러 코드**: KOE101
- **에러 메시지**: 앱 관리자 설정 오류
- **의미**: 카카오 앱 설정에 문제가 있어 서비스를 이용할 수 없음

## 주요 원인

### 1. Redirect URI 설정 오류 (가장 흔함)
- Redirect URI가 등록되지 않았거나 잘못됨
- Supabase 프로젝트 URL과 일치하지 않음

### 2. Client ID/Secret 설정 오류
- Supabase에 잘못된 REST API 키 입력
- Client Secret이 잘못 입력됨

### 3. 카카오 로그인 미활성화
- 카카오 로그인이 활성화되지 않음

### 4. 앱 키 설정 오류
- 잘못된 앱 키 사용

## 해결 방법

### 방법 1: Redirect URI 확인 및 수정 (가장 중요!)

#### 1단계: Supabase 프로젝트 URL 확인
1. Supabase 대시보드 접속
2. 프로젝트 선택
3. **Settings** > **API** 메뉴로 이동
4. **Project URL** 확인 (예: `https://abcdefghijklmnop.supabase.co`)

#### 2단계: Kakao Developers Console에서 Redirect URI 확인
1. Kakao Developers Console 접속
2. **내 애플리케이션** > 앱 선택
3. **제품 설정** > **카카오 로그인** 클릭
4. **Redirect URI** 섹션 확인

#### 3단계: Redirect URI 추가/수정
다음 형식으로 정확히 입력:
```
https://your-project-id.supabase.co/auth/v1/callback
```

**중요 사항**:
- `https://`로 시작해야 함
- `/auth/v1/callback`으로 끝나야 함
- 프로젝트 ID가 정확해야 함
- 공백이나 특수문자가 없어야 함

예시:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### 방법 2: Supabase 설정 확인

#### 1단계: Kakao 프로바이더 활성화 확인
1. Supabase 대시보드 > **Authentication** > **Providers**
2. **Kakao** 프로바이더 찾기
3. **Enabled** 토글이 **ON**인지 확인

#### 2단계: Client ID 확인
1. Kakao Developers Console > **앱 설정** > **앱 키**
2. **REST API 키** 복사
3. Supabase > **Authentication** > **Providers** > **Kakao**
4. **Client ID (for OAuth)**에 REST API 키가 정확히 입력되어 있는지 확인

#### 3단계: Client Secret 확인
1. Kakao Developers Console > **고급** 탭
2. **Client Secret** 확인 (없으면 생성)
3. Supabase > **Authentication** > **Providers** > **Kakao**
4. **Client Secret (for OAuth)**에 Client Secret이 정확히 입력되어 있는지 확인

### 방법 3: 카카오 로그인 활성화 확인

1. Kakao Developers Console > **제품 설정** > **카카오 로그인**
2. **카카오 로그인 활성화** 토글이 **ON**인지 확인
3. **OFF**라면 **ON**으로 변경 후 저장

### 방법 4: 앱 키 확인

1. Kakao Developers Console > **앱 설정** > **앱 키**
2. 현재 사용 중인 **REST API 키** 확인
3. Supabase에 입력한 키와 일치하는지 확인

## 단계별 체크리스트

### Kakao Developers Console 설정:
- [ ] 카카오 로그인 활성화 (ON)
- [ ] Redirect URI 등록됨
- [ ] Redirect URI 형식이 정확함 (`https://...supabase.co/auth/v1/callback`)
- [ ] REST API 키 확인
- [ ] Client Secret 생성됨

### Supabase 설정:
- [ ] Kakao 프로바이더 활성화 (Enabled ON)
- [ ] Client ID에 REST API 키 입력됨
- [ ] Client Secret 입력됨
- [ ] 설정 저장됨

### 확인 사항:
- [ ] Redirect URI가 Supabase 프로젝트 URL과 일치함
- [ ] 공백이나 특수문자가 없음
- [ ] `https://`로 시작하고 `/auth/v1/callback`으로 끝남

## 빠른 해결 순서

### 1단계: Redirect URI 확인 및 수정
```
Kakao Developers Console
→ 제품 설정
→ 카카오 로그인
→ Redirect URI
→ https://[프로젝트ID].supabase.co/auth/v1/callback 추가
```

### 2단계: Supabase 설정 확인
```
Supabase Dashboard
→ Authentication
→ Providers
→ Kakao
→ Enabled ON
→ Client ID: REST API 키 확인
→ Client Secret: Client Secret 확인
→ Save
```

### 3단계: 카카오 로그인 활성화 확인
```
Kakao Developers Console
→ 제품 설정
→ 카카오 로그인
→ 활성화 ON
```

### 4단계: 테스트
1. 앱 재시작
2. 카카오 로그인 버튼 클릭
3. 정상 작동 확인

## 자주 발생하는 실수

### ❌ 잘못된 Redirect URI 예시:
```
http://...supabase.co/auth/v1/callback  (http 사용 - 잘못됨)
https://...supabase.co/auth/callback    (경로 잘못됨)
https://...supabase.co/auth/v1/         (끝부분 잘못됨)
https:// ...supabase.co/auth/v1/callback (공백 포함)
```

### ✅ 올바른 Redirect URI 예시:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

## 추가 확인 사항

### 1. 프로젝트 ID 확인
Supabase 프로젝트 ID가 정확한지 확인:
- Supabase 대시보드 > Settings > API > Project URL
- URL에서 프로젝트 ID 추출

### 2. 설정 저장 확인
- Kakao Developers Console에서 변경 후 **저장** 클릭
- Supabase에서 변경 후 **Save** 클릭

### 3. 캐시 삭제
설정 변경 후:
- 브라우저 캐시 삭제
- 앱 재시작

## 여전히 해결되지 않는 경우

1. **Kakao Developers Console 로그 확인**:
   - 통계 > 오류 로그 확인
   - 최근 오류 메시지 확인

2. **Supabase 로그 확인**:
   - Logs > Auth Logs 확인
   - 최근 인증 시도 확인

3. **모든 설정 재확인**:
   - 위의 체크리스트 다시 확인
   - 각 설정값이 정확한지 재확인

## 요약

KOE101 에러는 주로 **Redirect URI 설정 오류**로 발생합니다.

**가장 중요한 확인 사항**:
1. ✅ Redirect URI가 정확히 등록되었는가?
2. ✅ Redirect URI 형식이 올바른가? (`https://...supabase.co/auth/v1/callback`)
3. ✅ Supabase 프로젝트 ID가 정확한가?
4. ✅ 카카오 로그인이 활성화되었는가?
5. ✅ Supabase에 올바른 키가 입력되었는가?
