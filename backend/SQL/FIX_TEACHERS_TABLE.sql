-- teachers 테이블 컬럼 확인 및 추가 (완전한 버전)
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 현재 컬럼 상태 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'teachers'
ORDER BY ordinal_position;

-- 2단계: subject_ids 컬럼 추가 (없는 경우)
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

-- 3단계: work_days 컬럼 추가 (없는 경우)
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

-- 4단계: created_at 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'teachers' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.teachers 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE '✅ created_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ created_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 5단계: updated_at 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'teachers' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.teachers 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE '✅ updated_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ updated_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 6단계: 최종 컬럼 목록 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'teachers'
ORDER BY ordinal_position;

