-- Supabase RLS (Row Level Security) 정책 설정
-- SQL Editor에서 실행하세요

-- RLS 활성화 (필요한 경우)
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 생성 (개발 환경용)
-- 프로덕션에서는 더 엄격한 정책을 사용해야 합니다

-- academies 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on academies" ON academies;
CREATE POLICY "Allow all operations on academies" ON academies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- subjects 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on subjects" ON subjects;
CREATE POLICY "Allow all operations on subjects" ON subjects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- classrooms 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on classrooms" ON classrooms;
CREATE POLICY "Allow all operations on classrooms" ON classrooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- teachers 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on teachers" ON teachers;
CREATE POLICY "Allow all operations on teachers" ON teachers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- students 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on students" ON students;
CREATE POLICY "Allow all operations on students" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- classes 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on classes" ON classes;
CREATE POLICY "Allow all operations on classes" ON classes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- enrollments 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on enrollments" ON enrollments;
CREATE POLICY "Allow all operations on enrollments" ON enrollments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- schedules 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on schedules" ON schedules;
CREATE POLICY "Allow all operations on schedules" ON schedules
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- requests 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on requests" ON requests;
CREATE POLICY "Allow all operations on requests" ON requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- users 테이블 정책
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

