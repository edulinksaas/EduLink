-- 학부모 앱에서 등록한 학습 기관 정보 테이블 생성
-- academies 테이블과 동일한 구조로 생성
-- Supabase SQL Editor에서 실행하세요

-- 학부모 학습 기관 테이블 생성
CREATE TABLE IF NOT EXISTS un_academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_phone VARCHAR(50) NOT NULL, -- 학부모 연락처 (학부모 식별용)
  name VARCHAR(255) NOT NULL, -- 학원명
  logo_url TEXT, -- 로고 URL
  address TEXT, -- 주소
  floor VARCHAR(50), -- 층수
  code VARCHAR(50), -- 코드 (UNIQUE 제약 없음, 학부모별로 중복 가능)
  type VARCHAR(50), -- 유형 (학원, 과외, 온라인 등)
  phone VARCHAR(50), -- 전화번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_un_academies_parent_phone ON un_academies(parent_phone);
CREATE INDEX IF NOT EXISTS idx_un_academies_name ON un_academies(name);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_un_academies_updated_at ON un_academies;
CREATE TRIGGER update_un_academies_updated_at
  BEFORE UPDATE ON un_academies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정
ALTER TABLE un_academies ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (이미 존재하는 경우를 위해)
DROP POLICY IF EXISTS "Parents can view own academies" ON un_academies;
DROP POLICY IF EXISTS "Parents can insert own academies" ON un_academies;
DROP POLICY IF EXISTS "Parents can update own academies" ON un_academies;
DROP POLICY IF EXISTS "Parents can delete own academies" ON un_academies;

-- 학부모는 자신의 학습 기관 정보만 조회 가능
CREATE POLICY "Parents can view own academies"
  ON un_academies FOR SELECT
  USING (true); -- 임시로 모든 사용자가 조회 가능 (나중에 인증 추가 시 수정)

-- 학부모는 자신의 학습 기관 정보만 생성 가능
CREATE POLICY "Parents can insert own academies"
  ON un_academies FOR INSERT
  WITH CHECK (true); -- 임시로 모든 사용자가 삽입 가능

-- 학부모는 자신의 학습 기관 정보만 수정 가능
CREATE POLICY "Parents can update own academies"
  ON un_academies FOR UPDATE
  USING (true); -- 임시로 모든 사용자가 수정 가능

-- 학부모는 자신의 학습 기관 정보만 삭제 가능
CREATE POLICY "Parents can delete own academies"
  ON un_academies FOR DELETE
  USING (true); -- 임시로 모든 사용자가 삭제 가능
