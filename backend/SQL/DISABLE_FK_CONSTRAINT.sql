-- Foreign Key Constraint 일시적으로 비활성화 (개발 환경용)
-- ⚠️ 개발 환경에서만 사용하세요!

-- users 테이블의 academy_id foreign key constraint 비활성화
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_academy_id_fkey;

-- 필요시 다시 활성화하려면:
-- ALTER TABLE users ADD CONSTRAINT users_academy_id_fkey 
-- FOREIGN KEY (academy_id) REFERENCES academies(id);

-- 확인
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND kcu.column_name = 'academy_id';

-- 결과가 비어있으면 foreign key constraint가 비활성화된 것입니다.

