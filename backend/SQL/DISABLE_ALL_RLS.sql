-- 모든 테이블의 RLS 완전 비활성화
-- Supabase SQL Editor에서 실행하세요

-- classes 테이블 RLS 비활성화
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- classrooms 테이블 RLS 비활성화
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책 모두 삭제 (classes)
DROP POLICY IF EXISTS "Enable select for classes" ON classes;
DROP POLICY IF EXISTS "Enable insert for classes" ON classes;
DROP POLICY IF EXISTS "Enable update for classes" ON classes;
DROP POLICY IF EXISTS "Enable delete for classes" ON classes;
DROP POLICY IF EXISTS "Enable all for classes" ON classes;
DROP POLICY IF EXISTS "Enable all operations for classes" ON classes;
DROP POLICY IF EXISTS "Public classes are viewable by everyone" ON classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON classes;

-- 기존 RLS 정책 모두 삭제 (classrooms)
DROP POLICY IF EXISTS "Enable select for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Enable insert for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Enable update for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Enable delete for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Enable all for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Enable all operations for classrooms" ON classrooms;
DROP POLICY IF EXISTS "Public classrooms are viewable by everyone" ON classrooms;
DROP POLICY IF EXISTS "Users can insert their own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Users can update their own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Users can delete their own classrooms" ON classrooms;

-- 확인 쿼리
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('classes', 'classrooms')
ORDER BY tablename;

