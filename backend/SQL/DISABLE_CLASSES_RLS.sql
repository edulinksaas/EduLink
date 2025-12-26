-- classes 테이블 RLS 비활성화 (개발 환경용)
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 데이터 확인
SELECT COUNT(*) as class_count FROM classes;
SELECT id, name, academy_id FROM classes WHERE academy_id = '12f11307-f801-48b5-87ca-65daa8792c59';

