-- students 테이블에 생년월일, 학년, 휴대폰 번호 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- 생년월일 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 학년 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- 학생 휴대폰 번호 필드 추가 (parent_contact는 학부모 연락처)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_students_birth_date ON students(birth_date);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
