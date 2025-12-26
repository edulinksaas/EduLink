-- classes 테이블에 start_time, end_time, max_students 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- start_time 컬럼 추가 (시간 형식: VARCHAR 또는 TIME)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS start_time VARCHAR(50);

-- end_time 컬럼 추가 (시간 형식: VARCHAR 또는 TIME)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS end_time VARCHAR(50);

-- max_students 컬럼 추가 (정원)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 10;

-- 기존 데이터가 있으면 기본값 설정 (선택사항)
UPDATE classes 
SET max_students = 10 
WHERE max_students IS NULL;

