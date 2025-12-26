-- classes 테이블 RLS 임시 비활성화 (개발 환경용)
-- Supabase SQL Editor에서 실행하세요

-- RLS 비활성화 (개발 중에만 사용)
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 데이터 확인
SELECT COUNT(*) as class_count FROM classes;
SELECT id, name, academy_id FROM classes LIMIT 5;

