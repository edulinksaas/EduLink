-- academies 테이블 RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 현재 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'academies';

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
AND tablename = 'academies';

-- 3단계: 기존 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on academies" ON academies;
DROP POLICY IF EXISTS "Public academies access" ON academies;
DROP POLICY IF EXISTS "Enable insert for all users" ON academies;
DROP POLICY IF EXISTS "Enable select for all users" ON academies;
DROP POLICY IF EXISTS "Enable update for all users" ON academies;
DROP POLICY IF EXISTS "Enable delete for all users" ON academies;

-- 4단계: RLS 활성화
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;

-- 5단계: 모든 작업을 허용하는 정책 생성
CREATE POLICY "Allow all operations on academies" ON academies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6단계: 또는 개별 작업별 정책 생성 (더 명확함)
CREATE POLICY "Enable select for academies" ON academies
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for academies" ON academies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for academies" ON academies
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for academies" ON academies
  FOR DELETE
  USING (true);

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
AND tablename = 'academies';

-- 8단계: 테스트 쿼리 (실제로 데이터가 있는지 확인)
SELECT COUNT(*) as academy_count FROM academies;
SELECT id, name, code FROM academies LIMIT 5;

