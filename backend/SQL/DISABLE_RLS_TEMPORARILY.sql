-- RLS 일시적으로 비활성화 (테스트용)
-- ⚠️ 개발 환경에서만 사용하세요. 프로덕션에서는 사용하지 마세요!

-- academies 테이블 RLS 비활성화
ALTER TABLE academies DISABLE ROW LEVEL SECURITY;

-- users 테이블 RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('academies', 'users');

