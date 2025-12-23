-- 자녀와 학원 간의 다대다 관계를 위한 중간 테이블 생성
-- 한 자녀가 여러 학원을 가질 수 있도록 함
-- Supabase SQL Editor에서 실행하세요

-- 중간 테이블 생성
CREATE TABLE IF NOT EXISTS student_un_academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  un_academy_id UUID NOT NULL REFERENCES un_academies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, un_academy_id) -- 중복 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_student_un_academies_student_id ON student_un_academies(student_id);
CREATE INDEX IF NOT EXISTS idx_student_un_academies_un_academy_id ON student_un_academies(un_academy_id);

-- RLS 정책 설정
ALTER TABLE student_un_academies ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (이미 존재하는 경우를 위해)
DROP POLICY IF EXISTS "Parents can view own student academies" ON student_un_academies;
DROP POLICY IF EXISTS "Parents can insert own student academies" ON student_un_academies;
DROP POLICY IF EXISTS "Parents can delete own student academies" ON student_un_academies;

-- 학부모는 자신의 자녀의 학원 정보만 조회 가능
CREATE POLICY "Parents can view own student academies"
  ON student_un_academies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_un_academies.student_id
      AND students.parent_contact = (SELECT auth.jwt() ->> 'phone')
    )
  );

-- 학부모는 자신의 자녀의 학원 정보만 추가 가능
CREATE POLICY "Parents can insert own student academies"
  ON student_un_academies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_un_academies.student_id
      AND students.parent_contact = (SELECT auth.jwt() ->> 'phone')
    )
    AND EXISTS (
      SELECT 1 FROM un_academies
      WHERE un_academies.id = student_un_academies.un_academy_id
      AND un_academies.parent_phone = (SELECT auth.jwt() ->> 'phone')
    )
  );

-- 학부모는 자신의 자녀의 학원 정보만 삭제 가능
CREATE POLICY "Parents can delete own student academies"
  ON student_un_academies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_un_academies.student_id
      AND students.parent_contact = (SELECT auth.jwt() ->> 'phone')
    )
  );
