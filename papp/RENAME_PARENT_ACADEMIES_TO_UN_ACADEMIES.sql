-- parent_academies 테이블의 데이터를 un_academies로 마이그레이션
-- un_academies 테이블이 이미 존재하는 경우 사용
-- Supabase SQL Editor에서 실행하세요

-- parent_academies 테이블이 존재하는 경우에만 데이터 마이그레이션
DO $$
BEGIN
  -- parent_academies 테이블이 존재하는지 확인
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parent_academies') THEN
    -- parent_academies의 데이터를 un_academies로 복사 (중복 제외)
    INSERT INTO un_academies (
      id, parent_phone, name, logo_url, address, floor, code, type, phone, created_at, updated_at
    )
    SELECT 
      id, parent_phone, name, logo_url, address, floor, code, type, phone, created_at, updated_at
    FROM parent_academies
    WHERE NOT EXISTS (
      SELECT 1 FROM un_academies WHERE un_academies.id = parent_academies.id
    );
    
    -- parent_academies 테이블의 정책 삭제
    DROP POLICY IF EXISTS "Parents can view own academies" ON parent_academies;
    DROP POLICY IF EXISTS "Parents can insert own academies" ON parent_academies;
    DROP POLICY IF EXISTS "Parents can update own academies" ON parent_academies;
    DROP POLICY IF EXISTS "Parents can delete own academies" ON parent_academies;
    
    -- parent_academies 테이블의 트리거 삭제
    DROP TRIGGER IF EXISTS update_parent_academies_updated_at ON parent_academies;
    
    -- parent_academies 테이블 삭제
    DROP TABLE IF EXISTS parent_academies CASCADE;
  END IF;
END $$;

-- un_academies 테이블의 정책이 없으면 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'un_academies' AND policyname = 'Parents can view own academies'
  ) THEN
    CREATE POLICY "Parents can view own academies"
      ON un_academies FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'un_academies' AND policyname = 'Parents can insert own academies'
  ) THEN
    CREATE POLICY "Parents can insert own academies"
      ON un_academies FOR INSERT
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'un_academies' AND policyname = 'Parents can update own academies'
  ) THEN
    CREATE POLICY "Parents can update own academies"
      ON un_academies FOR UPDATE
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'un_academies' AND policyname = 'Parents can delete own academies'
  ) THEN
    CREATE POLICY "Parents can delete own academies"
      ON un_academies FOR DELETE
      USING (true);
  END IF;
END $$;
