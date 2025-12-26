-- classes 테이블 최종 수정 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 모든 기존 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'classes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON classes';
        RAISE NOTICE '정책 삭제: %', r.policyname;
    END LOOP;
END $$;

-- 2단계: RLS 완전히 비활성화 (개발 환경용)
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 3단계: 확인
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 4단계: 전체 수업 개수 확인
SELECT COUNT(*) as total_classes FROM classes;

-- 5단계: 특정 academy_id로 수업 확인
SELECT 
    id,
    name,
    academy_id,
    classroom_id,
    start_time,
    end_time,
    max_students,
    created_at
FROM classes 
WHERE academy_id = '12f11307-f801-48b5-87ca-65daa8792c59'
ORDER BY created_at DESC;

-- 6단계: 전체 수업 목록 (최근 10개)
SELECT 
    id,
    name,
    academy_id,
    classroom_id,
    created_at
FROM classes
ORDER BY created_at DESC
LIMIT 10;

