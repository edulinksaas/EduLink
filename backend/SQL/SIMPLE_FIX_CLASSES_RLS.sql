-- classes 테이블 RLS 정책 간단 수정
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 모든 기존 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'classes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON classes';
    END LOOP;
END $$;

-- 2단계: RLS 활성화
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 3단계: 모든 작업을 허용하는 단일 정책 생성
CREATE POLICY "Allow all operations on classes" ON classes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4단계: 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'classes';

-- 5단계: 데이터 확인
SELECT COUNT(*) as class_count FROM classes;
SELECT id, name, academy_id FROM classes LIMIT 5;

