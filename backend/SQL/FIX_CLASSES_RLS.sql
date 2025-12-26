-- classes 테이블 RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 현재 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 2단계: 기존 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 3단계: 기존 정책 삭제 (모든 가능한 정책 이름 포함)
DROP POLICY IF EXISTS "Allow all operations on classes" ON classes;
DROP POLICY IF EXISTS "Public classes access" ON classes;
DROP POLICY IF EXISTS "Enable insert for all users" ON classes;
DROP POLICY IF EXISTS "Enable select for all users" ON classes;
DROP POLICY IF EXISTS "Enable update for all users" ON classes;
DROP POLICY IF EXISTS "Enable delete for all users" ON classes;
DROP POLICY IF EXISTS "Enable select for classes" ON classes;
DROP POLICY IF EXISTS "Enable insert for classes" ON classes;
DROP POLICY IF EXISTS "Enable update for classes" ON classes;
DROP POLICY IF EXISTS "Enable delete for classes" ON classes;

-- 4단계: RLS 활성화
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 5단계: 모든 작업을 허용하는 정책 생성 (개발 환경용)
-- 기존 정책이 없을 때만 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'classes' 
    AND policyname = 'Allow all operations on classes'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all operations on classes" ON classes FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- 6단계: 또는 개별 작업별 정책 생성 (더 명확함)
-- 기존 정책이 없을 때만 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'classes' 
    AND policyname = 'Enable select for classes'
  ) THEN
    EXECUTE 'CREATE POLICY "Enable select for classes" ON classes FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'classes' 
    AND policyname = 'Enable insert for classes'
  ) THEN
    EXECUTE 'CREATE POLICY "Enable insert for classes" ON classes FOR INSERT WITH CHECK (true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'classes' 
    AND policyname = 'Enable update for classes'
  ) THEN
    EXECUTE 'CREATE POLICY "Enable update for classes" ON classes FOR UPDATE USING (true) WITH CHECK (true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'classes' 
    AND policyname = 'Enable delete for classes'
  ) THEN
    EXECUTE 'CREATE POLICY "Enable delete for classes" ON classes FOR DELETE USING (true)';
  END IF;
END $$;

-- 7단계: 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 8단계: 테스트 쿼리 (실제로 데이터가 있는지 확인)
SELECT COUNT(*) as class_count FROM classes;
SELECT id, name, academy_id, start_time, end_time FROM classes LIMIT 5;

-- 9단계: RLS 비활성화 (임시 해결책 - 개발 환경에서만 사용)
-- ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

