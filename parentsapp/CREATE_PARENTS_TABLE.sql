-- 학부모 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- parents 테이블 생성
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- 학부모 이름
  email VARCHAR(255), -- 이메일 (선택사항)
  phone VARCHAR(50) UNIQUE NOT NULL, -- 연락처 (학부모 식별용, students.parent_contact와 연결)
  address TEXT, -- 주소 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_parents_updated_at ON parents;
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- 학부모는 자신의 정보만 조회 가능
CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  USING (phone IN (
    SELECT parent_contact FROM students WHERE parent_contact = auth.jwt() ->> 'phone'
  ) OR true); -- 임시로 모든 사용자가 조회 가능 (나중에 인증 추가 시 수정)

-- 학부모는 자신의 정보만 수정 가능
CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  USING (phone IN (
    SELECT parent_contact FROM students WHERE parent_contact = auth.jwt() ->> 'phone'
  ) OR true); -- 임시로 모든 사용자가 수정 가능

-- 학부모는 자신의 정보만 삽입 가능
CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  WITH CHECK (true); -- 임시로 모든 사용자가 삽입 가능
