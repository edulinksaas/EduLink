-- parent_students 관계 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 학부모-학생 관계 테이블 생성
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  relationship VARCHAR(50) DEFAULT 'parent',  -- 부/모/조부모 등
  is_primary BOOLEAN DEFAULT true,            -- 주 보호자 여부
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)  -- 중복 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_parent_students_updated_at ON parent_students;
CREATE TRIGGER update_parent_students_updated_at
  BEFORE UPDATE ON parent_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


