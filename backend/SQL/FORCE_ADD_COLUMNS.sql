-- teachers 테이블에 컬럼 강제 추가 (이미 있어도 에러 없이 실행)
-- Supabase SQL Editor에서 실행하세요

-- subject_ids 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS subject_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- work_days 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS work_days VARCHAR(100);

-- created_at 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- updated_at 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 컬럼 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'teachers'
ORDER BY ordinal_position;

