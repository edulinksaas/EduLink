-- users 테이블 수정 (컬럼 추가)
-- Supabase SQL Editor에서 실행하세요

-- 1단계: 현재 users 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2단계: academy_code 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'academy_code'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN academy_code VARCHAR(50) UNIQUE;
    
    RAISE NOTICE '✅ academy_code 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ academy_code 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 3단계: password_hash 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN password_hash VARCHAR(255);
    
    RAISE NOTICE '✅ password_hash 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ password_hash 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 4단계: academy_id 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'academy_id'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN academy_id UUID REFERENCES academies(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ academy_id 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ academy_id 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 5단계: name 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN name VARCHAR(255);
    
    RAISE NOTICE '✅ name 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ name 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 6단계: email 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN email VARCHAR(255);
    
    RAISE NOTICE '✅ email 컬럼이 추가되었습니다.';
  ELSE
    -- email 컬럼이 이미 존재하면 NOT NULL 제약 조건 제거
    ALTER TABLE public.users 
    ALTER COLUMN email DROP NOT NULL;
    
    RAISE NOTICE 'ℹ️ email 컬럼이 이미 존재합니다. NOT NULL 제약 조건을 제거했습니다.';
  END IF;
END $$;

-- 7단계: phone 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN phone VARCHAR(50);
    
    RAISE NOTICE '✅ phone 컬럼이 추가되었습니다.';
  ELSE
    -- phone 컬럼이 이미 존재하면 NOT NULL 제약 조건 제거 (있는 경우)
    BEGIN
      ALTER TABLE public.users 
      ALTER COLUMN phone DROP NOT NULL;
      RAISE NOTICE 'ℹ️ phone 컬럼이 이미 존재합니다. NOT NULL 제약 조건을 제거했습니다.';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ phone 컬럼이 이미 존재합니다. (NOT NULL 제약 조건 제거 시도 중 오류, 무시됨)';
    END;
  END IF;
END $$;

-- 8단계: role 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role VARCHAR(50) DEFAULT 'admin';
    
    RAISE NOTICE '✅ role 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ role 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 9단계: created_at 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE '✅ created_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ created_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 10단계: updated_at 컬럼 확인 및 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE '✅ updated_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ updated_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 11단계: academy_code에 UNIQUE 제약 조건 추가 (이미 있으면 에러 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'users_academy_code_key'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_academy_code_key UNIQUE (academy_code);
    
    RAISE NOTICE '✅ academy_code UNIQUE 제약 조건이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️ academy_code UNIQUE 제약 조건이 이미 존재합니다.';
  END IF;
END $$;

-- 12단계: 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_academy_code ON users(academy_code);
CREATE INDEX IF NOT EXISTS idx_users_academy_id ON users(academy_id);

-- 13단계: updated_at 자동 업데이트 트리거 (update_updated_at_column 함수가 있어야 함)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 14단계: RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 15단계: RLS 정책 생성 (기존 정책이 있으면 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true);

-- 16단계: 최종 컬럼 목록 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

