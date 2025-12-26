-- tuition_fees 테이블에 수업 유형과 결제 방법 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- 수업 유형 필드 추가
ALTER TABLE tuition_fees
ADD COLUMN IF NOT EXISTS class_type VARCHAR(50);

-- 결제 방법 필드 추가
ALTER TABLE tuition_fees
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- 기존 데이터에 기본값 설정 (선택 사항)
-- UPDATE tuition_fees SET class_type = '일반' WHERE class_type IS NULL;
-- UPDATE tuition_fees SET payment_method = '월납' WHERE payment_method IS NULL;

-- 필드 추가 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tuition_fees'
AND column_name IN ('class_type', 'payment_method');

