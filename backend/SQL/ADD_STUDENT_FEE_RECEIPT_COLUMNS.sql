-- students 테이블에 수강료 및 영수증 여부 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS fee INTEGER,
ADD COLUMN IF NOT EXISTS has_receipt BOOLEAN DEFAULT false;


