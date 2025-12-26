-- 모든 테이블의 RLS 완전히 비활성화
-- ⚠️ 개발 환경에서만 사용하세요!

-- 1. academies 테이블
ALTER TABLE academies DISABLE ROW LEVEL SECURITY;

-- 2. users 테이블
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. subjects 테이블
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;

-- 4. classrooms 테이블
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;

-- 5. teachers 테이블
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;

-- 6. students 테이블
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 7. classes 테이블
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 8. enrollments 테이블
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- 9. schedules 테이블
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- 10. requests 테이블
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

-- 확인: 모든 테이블의 RLS가 비활성화되었는지 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS 활성화 여부",
    CASE 
        WHEN rowsecurity THEN '❌ 활성화됨'
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

-- 모든 테이블의 "RLS 활성화 여부"가 false여야 합니다!

