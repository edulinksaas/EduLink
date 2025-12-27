-- students 테이블에 un_academy_id 필드 추가
-- un_academies 테이블을 참조하는 외래 키 추가
-- Supabase SQL Editor에서 실행하세요

-- un_academy_id 필드 추가 (이미 존재하는 경우 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'un_academy_id'
  ) THEN
    ALTER TABLE students 
    ADD COLUMN un_academy_id UUID REFERENCES un_academies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 인덱스 생성 (이미 존재하는 경우 무시)
CREATE INDEX IF NOT EXISTS idx_students_un_academy_id ON students(un_academy_id);
