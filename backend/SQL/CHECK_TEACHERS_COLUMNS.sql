-- teachers 테이블의 컬럼 확인 및 누락된 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 teachers 테이블의 모든 컬럼 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'teachers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. subject_ids 컬럼 확인 및 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'teachers' 
    AND column_name = 'subject_ids'
  ) THEN
    ALTER TABLE public.teachers 
    ADD COLUMN subject_ids UUID[] DEFAULT ARRAY[]::UUID[];
    
    RAISE NOTICE '✅ subject_ids 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ subject_ids 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 3. work_days 컬럼 확인 및 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'teachers' 
    AND column_name = 'work_days'
  ) THEN
    ALTER TABLE public.teachers 
    ADD COLUMN work_days VARCHAR(100);
    
    RAISE NOTICE '✅ work_days 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ work_days 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 4. 최종 컬럼 목록 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'teachers'
AND table_schema = 'public'
AND column_name IN ('id', 'academy_id', 'name', 'contact', 'subject_id', 'subject_ids', 'work_days', 'created_at', 'updated_at')
ORDER BY 
  CASE column_name
    WHEN 'id' THEN 1
    WHEN 'academy_id' THEN 2
    WHEN 'name' THEN 3
    WHEN 'contact' THEN 4
    WHEN 'subject_id' THEN 5
    WHEN 'subject_ids' THEN 6
    WHEN 'work_days' THEN 7
    WHEN 'created_at' THEN 8
    WHEN 'updated_at' THEN 9
    ELSE 10
  END;

