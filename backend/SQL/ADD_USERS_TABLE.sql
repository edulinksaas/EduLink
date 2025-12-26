-- 사용자 테이블 추가
-- Supabase SQL Editor에서 실행하세요

-- users 테이블 생성 (학원 관리자용)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_code VARCHAR(50) UNIQUE NOT NULL, -- 학원 코드 (아이디로 사용)
  password_hash VARCHAR(255) NOT NULL, -- 비밀번호 해시
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE NOT NULL, -- 학원 ID
  name VARCHAR(255) NOT NULL, -- 관리자 이름
  email VARCHAR(255), -- 관리자 이메일 (선택사항)
  phone VARCHAR(50), -- 관리자 연락처 (선택사항)
  role VARCHAR(50) DEFAULT 'admin', -- 역할 (admin, teacher 등)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_academy_code ON users(academy_code);
CREATE INDEX IF NOT EXISTS idx_users_academy_id ON users(academy_id);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 (나중에 SUPABASE_RLS_POLICY.sql에 추가)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 데이터를 볼 수 있도록 (임시, 나중에 수정 필요)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true);

