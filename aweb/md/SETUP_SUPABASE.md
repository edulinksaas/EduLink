# Supabase 연결 설정 가이드

## 문제 해결 단계

### 1단계: Supabase Service Role Key 확인 및 설정

1. Supabase 대시보드 접속
2. Settings → API 메뉴로 이동
3. `service_role` key (secret) 복사
   - ⚠️ 이 키는 절대 공개하지 마세요!
   - ⚠️ 프론트엔드에서 사용하지 마세요!

### 2단계: server/.env 파일 수정

`server/.env` 파일을 열고 다음을 추가/수정:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3단계: RLS 비활성화 (개발 환경용)

Supabase SQL Editor에서 `QUICK_FIX_RLS.sql` 파일의 내용을 실행:

```sql
ALTER TABLE academies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
```

### 4단계: 백엔드 서버 재시작

변경사항 적용을 위해 백엔드 서버를 재시작하세요.

### 5단계: 연결 테스트

브라우저에서 `http://localhost:3000/health/supabase` 접속하여 연결 상태 확인

## 확인 사항

- ✅ `server/.env` 파일에 `SUPABASE_SERVICE_ROLE_KEY`가 설정되어 있는지
- ✅ Supabase SQL Editor에서 RLS가 비활성화되었는지
- ✅ 백엔드 서버가 재시작되었는지
- ✅ 백엔드 콘솔에 `✅ Supabase Service Role Key 사용 중` 메시지가 나오는지

