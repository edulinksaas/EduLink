-- 학원 데이터 확인 쿼리
-- Supabase SQL Editor에서 실행하세요

-- 1. 모든 학원 조회
SELECT id, name, code, created_at 
FROM academies 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. 특정 학원 코드로 조회
SELECT id, name, code 
FROM academies 
WHERE code = 'WF45P9D7';

-- 3. 특정 academy_id로 조회
SELECT id, name, code 
FROM academies 
WHERE id = '15fe6c2b-3abd-4b72-8b4c-834a83e69000';

-- 4. 학원 개수 확인
SELECT COUNT(*) as total_academies FROM academies;

-- 5. users 테이블과 academies 테이블 조인 확인
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

