-- 최종 해결 방법: Foreign Key Constraint 비활성화
-- ⚠️ 개발 환경에서만 사용하세요!

-- users 테이블의 academy_id foreign key constraint 완전히 삭제
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_academy_id_fkey;

-- 확인: foreign key constraint가 삭제되었는지 확인
SELECT 
    tc.table_name, 
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND tc.constraint_name LIKE '%academy_id%';

-- 결과가 비어있으면 foreign key constraint가 삭제된 것입니다.
-- 이제 회원가입이 정상적으로 작동해야 합니다!

