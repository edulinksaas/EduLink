-- RLS 상태 확인 쿼리
-- Supabase SQL Editor에서 실행하세요

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

