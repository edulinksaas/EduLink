-- Foreign Key Constraint 문제 임시 해결
-- ⚠️ 개발 환경에서만 사용하세요!

-- 방법 1: Foreign Key Constraint 완전히 삭제
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_academy_id_fkey;

-- 방법 2: Foreign Key Constraint를 DEFERRABLE로 변경 (트랜잭션 내에서 체크 지연)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_academy_id_fkey;
-- ALTER TABLE users ADD CONSTRAINT users_academy_id_fkey 
--   FOREIGN KEY (academy_id) REFERENCES academies(id) 
--   DEFERRABLE INITIALLY DEFERRED;

-- 확인
SELECT 
    tc.table_name, 
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND tc.constraint_name LIKE '%academy_id%';

