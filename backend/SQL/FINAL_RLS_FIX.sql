-- 최종 RLS 비활성화 스크립트
-- ⚠️ 이 스크립트를 실행하면 모든 테이블의 RLS가 완전히 비활성화됩니다!

-- 1단계: 모든 테이블의 RLS 비활성화
ALTER TABLE IF EXISTS academies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS requests DISABLE ROW LEVEL SECURITY;

-- 2단계: RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS 활성화 여부",
    CASE 
        WHEN rowsecurity THEN '❌ 활성화됨 (문제!)'
        ELSE '✅ 비활성화됨'
    END as "상태"
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

-- 3단계: 모든 테이블의 RLS 정책 삭제 (선택 사항)
-- RLS가 비활성화되어 있어도 정책이 남아있을 수 있으므로 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'academies', 'users', 'subjects', 'classrooms', 'teachers', 
            'students', 'classes', 'enrollments', 'schedules', 'requests'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all operations" ON %I.%I', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all operations" ON %I.%I', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Public access" ON %I.%I', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 완료 메시지
SELECT '✅ RLS 비활성화 완료! 이제 foreign key constraint 오류가 발생하지 않아야 합니다.' as "결과";

