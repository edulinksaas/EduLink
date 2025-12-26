-- 테스트용 학원 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 학원이 있는지 확인
SELECT id, name, code, created_at 
FROM academies 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. 테스트용 학원 생성 (코드가 없을 때만 생성)
-- 방법 1: 코드가 없으면 생성 (권장)
INSERT INTO academies (id, name, code, address, floor, logo_url, created_at, updated_at)
SELECT 
  gen_random_uuid(), -- UUID 자동 생성
  '테스트 학원', -- 학원 이름
  'TEST001', -- 학원 코드
  NULL, -- 주소 (선택사항)
  NULL, -- 층수 (선택사항)
  NULL, -- 로고 URL (선택사항)
  NOW(), -- 생성 시간
  NOW() -- 업데이트 시간
WHERE NOT EXISTS (
  SELECT 1 FROM academies WHERE code = 'TEST001'
);

-- 방법 2: 다른 코드로 생성하고 싶다면 아래 주석 해제하고 위 코드 주석 처리
-- INSERT INTO academies (id, name, code, address, floor, logo_url, created_at, updated_at)
-- SELECT 
--   gen_random_uuid(),
--   '테스트 학원',
--   'TEST' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'), -- 시간 기반 고유 코드
--   NULL,
--   NULL,
--   NULL,
--   NOW(),
--   NOW()
-- WHERE NOT EXISTS (
--   SELECT 1 FROM academies WHERE name = '테스트 학원'
-- );

-- 3. 생성된 학원 확인 (가장 최근 학원)
SELECT id, name, code, created_at 
FROM academies 
ORDER BY created_at DESC 
LIMIT 1;

-- 4. 모든 학원 목록 확인
SELECT id, name, code, created_at 
FROM academies 
ORDER BY created_at DESC;

