-- users 테이블에 이메일 인증 관련 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- 1단계: email_verified 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN email_verified BOOLEAN DEFAULT false;
    
    RAISE NOTICE '✅ email_verified 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ email_verified 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 2단계: verification_token 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'verification_token'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN verification_token VARCHAR(255);
    
    RAISE NOTICE '✅ verification_token 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ verification_token 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 3단계: verification_token_expires_at 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'verification_token_expires_at'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;
    
    RAISE NOTICE '✅ verification_token_expires_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ verification_token_expires_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 4단계: supabase_user_id 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'supabase_user_id'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN supabase_user_id UUID;
    
    RAISE NOTICE '✅ supabase_user_id 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ supabase_user_id 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 5단계: 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON users(supabase_user_id);

-- 6단계: 최종 컬럼 목록 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;


