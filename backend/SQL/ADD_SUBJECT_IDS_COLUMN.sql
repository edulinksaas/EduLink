-- teachers 테이블에 누락된 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. subject_ids 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'teachers' 
    AND column_name = 'subject_ids'
  ) THEN
    ALTER TABLE teachers 
    ADD COLUMN subject_ids UUID[] DEFAULT ARRAY[]::UUID[];
    
    RAISE NOTICE 'subject_ids 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'subject_ids 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 2. work_days 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'teachers' 
    AND column_name = 'work_days'
  ) THEN
    ALTER TABLE teachers 
    ADD COLUMN work_days VARCHAR(100);
    
    RAISE NOTICE 'work_days 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'work_days 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 컬럼 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'teachers'
AND column_name IN ('subject_id', 'subject_ids', 'work_days')
ORDER BY column_name;

