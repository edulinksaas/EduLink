-- RLS 완전히 비활성화 (개발 환경용)
-- ⚠️ 개발 환경에서만 사용하세요!

-- 1. 모든 테이블의 RLS 비활성화
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

-- 2. RLS 상태 확인
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

-- 모든 테이블의 rowsecurity가 false여야 합니다.

