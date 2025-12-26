-- classes 테이블 문제 진단
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 테이블 존재 확인
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'classes'
);

-- 2단계: 전체 데이터 개수
SELECT COUNT(*) as total_count FROM classes;

-- 3단계: 모든 수업 데이터 확인 (최근 20개)
SELECT 
    id,
    name,
    academy_id,
    classroom_id,
    start_time,
    end_time,
    max_students,
    created_at,
    updated_at
FROM classes
ORDER BY created_at DESC
LIMIT 20;

-- 4단계: 특정 academy_id로 필터링 (실제 academy_id로 변경하세요)
-- 예: SELECT * FROM classes WHERE academy_id = '12f11307-f801-48b5-87ca-65daa8792c59';

-- 5단계: RLS 상태 확인
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 6단계: 모든 정책 확인
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 7단계: 컬럼 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'classes'
ORDER BY ordinal_position;

