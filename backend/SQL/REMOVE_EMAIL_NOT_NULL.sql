-- email 컬럼의 NOT NULL 제약 조건 제거
-- Supabase SQL Editor에서 실행하세요

-- email 컬럼의 NOT NULL 제약 조건 제거
ALTER TABLE public.users 
ALTER COLUMN email DROP NOT NULL;

-- phone 컬럼의 NOT NULL 제약 조건 제거 (있는 경우)
ALTER TABLE public.users 
ALTER COLUMN phone DROP NOT NULL;

-- 확인
SELECT 
    column_name, 
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name IN ('email', 'phone');

