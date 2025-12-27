-- parents 테이블에 학습 기관 정보 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- 학습 기관명 필드 추가
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255);

-- 학습 기관 유형 필드 추가
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS institution_type VARCHAR(50);

-- 학습 기관 주소 필드 추가
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS institution_address TEXT;

-- 학습 기관 전화번호 필드 추가
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS institution_phone VARCHAR(50);

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_parents_institution_name ON parents(institution_name);
