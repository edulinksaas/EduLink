-- attendance_records 테이블에 enrollment_id 컬럼 추가
-- 수업 관련 모달창에서 출석/결석/이월 체크 시 학생 개인 페이지의 출석 상세 보기에 자동 등록되도록 하기 위함

-- 1. attendance_records 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'present' | 'absent' | 'late' | 'sick' | 'official' | 'carryover'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. enrollment_id 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_records' 
    AND column_name = 'enrollment_id'
  ) THEN
    ALTER TABLE attendance_records 
    ADD COLUMN enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_attendance_records_academy_id ON attendance_records(academy_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_class_id ON attendance_records(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_enrollment_id ON attendance_records(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);

-- 4. updated_at 자동 업데이트 트리거 추가
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. status check constraint 수정 (official 상태 추가)
-- 기존 constraint 제거
ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;

-- 새로운 constraint 추가 (official, carryover 포함)
ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_status_check 
CHECK (status IN ('present', 'absent', 'late', 'sick', 'official', 'carryover', 'earlyLeave'));

