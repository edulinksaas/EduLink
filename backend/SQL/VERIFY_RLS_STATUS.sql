-- RLS 상태 확인 및 비활성화 스크립트

-- 1. 현재 RLS 상태 확인
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

-- 2. RLS 비활성화 (위에서 활성화된 테이블이 있다면 실행)
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

-- 3. 다시 확인 (모두 false여야 함)
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

