-- academies 테이블에 전화번호 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- phone 필드 추가 (이미 존재하는 경우 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academies' AND column_name = 'phone'
  ) THEN
    ALTER TABLE academies 
    ADD COLUMN phone VARCHAR(50);
  END IF;
END $$;

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_academies_phone ON academies(phone);
