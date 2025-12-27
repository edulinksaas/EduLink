-- students 테이블에 학교 정보 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- 학교명 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_name VARCHAR(255);

-- 학교 학년 필드 추가 (기존 grade와 구분)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_grade VARCHAR(50);

-- 학교 반 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_class VARCHAR(50);

-- 학교 주소 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_address TEXT;

-- 학교 전화번호 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_phone VARCHAR(50);

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_students_school_name ON students(school_name);
