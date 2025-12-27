# Supabase 연결 문제 해결 가이드

## 현재 문제
`users_academy_id_fkey` foreign key constraint 위반 - 학원이 데이터베이스에 저장되지 않음

## 해결 방법

### 방법 1: Service Role Key 설정 (권장)

1. **Supabase 대시보드 접속**
   - Settings → API 메뉴로 이동

2. **Service Role Key 복사**
   - `service_role` key (secret) 복사
   - ⚠️ 이 키는 절대 공개하지 마세요!

3. **server/.env 파일 수정**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_키_붙여넣기
   SUPABASE_ANON_KEY=your-anon-key
   PORT=3000
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

4. **백엔드 서버 재시작**
   - 콘솔에 `✅ Supabase Service Role Key 사용 중 (RLS 우회)` 메시지 확인

### 방법 2: RLS 완전히 비활성화

**Supabase SQL Editor에서 실행:**

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

또는 `QUICK_FIX_RLS.sql` 파일 전체를 실행하세요.

### 방법 3: RLS 상태 확인

**Supabase SQL Editor에서 실행:**

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS 활성화 여부"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'academies', 
    'users', 
    'subjects', 
    'classrooms', 
    'teachers', 
    'students', 
    'classes', 
    'enrollments', 
    'schedules', 
    'requests'
)
ORDER BY tablename;
```

모든 테이블의 `rowsecurity`가 `false`여야 합니다.

## 확인 사항

✅ `server/.env` 파일에 `SUPABASE_SERVICE_ROLE_KEY`가 설정되어 있는지  
✅ 백엔드 콘솔에 `✅ Supabase Service Role Key 사용 중` 메시지가 나오는지  
✅ Supabase SQL Editor에서 RLS가 비활성화되었는지  
✅ 백엔드 서버가 재시작되었는지

## 테스트

회원가입을 다시 시도해보세요. 이제 "학원이 데이터베이스에 저장되지 않았습니다" 오류가 발생하지 않아야 합니다.

