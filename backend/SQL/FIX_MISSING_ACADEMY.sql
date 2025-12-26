-- 누락된 학원 데이터 복구
-- Supabase SQL Editor에서 실행하세요

-- 1. users 테이블에 academy_id가 있지만 academies 테이블에 없는 경우 확인
SELECT 
    u.id as user_id,
    u.academy_code,
    u.academy_id,
    u.name as user_name,
    a.id as academy_exists
FROM users u
LEFT JOIN academies a ON u.academy_id = a.id
WHERE a.id IS NULL;

-- 2. 누락된 학원 생성 (예시 - 실제 데이터에 맞게 수정 필요)
-- INSERT INTO academies (id, name, code, created_at, updated_at)
-- SELECT 
--     u.academy_id,
--     '학원 이름', -- 실제 학원 이름으로 변경 필요
--     u.academy_code,
--     u.created_at,
--     NOW()
-- FROM users u
-- LEFT JOIN academies a ON u.academy_id = a.id
-- WHERE a.id IS NULL
-- LIMIT 1;

-- 3. 특정 사용자의 학원 생성 (WF45P9D7)
INSERT INTO academies (id, name, code, created_at, updated_at)
SELECT 
    u.academy_id,
    '렉슬플라이', -- 학원 이름 (실제 이름으로 변경)
    u.academy_code,
    u.created_at,
    NOW()
FROM users u
LEFT JOIN academies a ON u.academy_id = a.id
WHERE u.academy_code = 'WF45P9D7' AND a.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. 확인
SELECT 
    u.id as user_id,
    u.academy_code,
    u.academy_id,
    a.id as academy_id_from_academies,
    a.name as academy_name,
    a.code as academy_code_from_academies
FROM users u
LEFT JOIN academies a ON u.academy_id = a.id
WHERE u.academy_code = 'WF45P9D7';

