# Supabase 연동 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. 환경 변수 설정

`app` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase URL과 키 찾는 방법:
1. Supabase 대시보드에서 프로젝트 선택
2. 좌측 메뉴에서 **Settings** > **API** 클릭
3. **Project URL**을 `EXPO_PUBLIC_SUPABASE_URL`에 복사
4. **anon public** 키를 `EXPO_PUBLIC_SUPABASE_ANON_KEY`에 복사

## 3. 데이터베이스 스키마 설정

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. `supabase-schema.sql` 파일의 내용을 복사하여 실행
3. 실행 완료 후 **Table Editor**에서 `events` 테이블이 생성되었는지 확인

## 4. 인증 설정 (선택사항)

앱에서 사용자 인증을 사용하려면:

1. Supabase 대시보드 > **Authentication** > **Providers**
2. 원하는 인증 방법 활성화 (Email, Google, Apple 등)

## 5. 앱 재시작

환경 변수를 변경한 후에는 앱을 재시작해야 합니다:

```bash
cd app
npm start
```

그리고 앱을 다시 로드하세요 (개발 서버에서 `r` 키 누르기).

## 6. 테스트

앱이 정상적으로 작동하는지 확인:

1. CalendarScreen에서 일정 추가
2. Supabase 대시보드 > **Table Editor** > **events** 테이블에서 데이터 확인
3. 앱을 재시작해도 일정이 유지되는지 확인

## 문제 해결

### 환경 변수가 로드되지 않는 경우
- `.env` 파일이 `app` 폴더에 있는지 확인
- 파일 이름이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- 앱을 완전히 재시작 (개발 서버 종료 후 다시 시작)

### RLS 정책 오류
- 인증을 사용하지 않는 경우, RLS 정책을 수정하거나 비활성화할 수 있습니다
- SQL Editor에서 다음 실행:
  ```sql
  ALTER TABLE events DISABLE ROW LEVEL SECURITY;
  ```

### 연결 오류
- Supabase URL과 키가 정확한지 확인
- 네트워크 연결 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
