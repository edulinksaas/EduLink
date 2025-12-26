-- tuition_fees 테이블 RLS 설정
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 방법 1: RLS 비활성화 (간단한 방법, 개발 환경용)
-- ============================================

-- tuition_fees 테이블의 RLS 비활성화
ALTER TABLE tuition_fees DISABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Enable select for tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Enable insert for tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Enable update for tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Enable delete for tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Enable all for tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Public tuition_fees are viewable by everyone" ON tuition_fees;
DROP POLICY IF EXISTS "Users can insert their own tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Users can update their own tuition_fees" ON tuition_fees;
DROP POLICY IF EXISTS "Users can delete their own tuition_fees" ON tuition_fees;

-- RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS 활성화 여부",
    CASE 
        WHEN rowsecurity THEN '❌ 활성화됨'
        ELSE '✅ 비활성화됨'
    END as "상태"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'tuition_fees';

-- ============================================
-- 방법 2: RLS 정책 추가 (더 안전한 방법, 프로덕션 환경용)
-- ============================================
-- 위의 방법 1을 실행하지 않고 이 방법을 사용하려면,
-- 먼저 RLS를 활성화한 후 아래 정책들을 추가하세요.
-- (현재는 방법 1을 사용하므로 주석 처리됨)

/*
-- RLS 활성화
ALTER TABLE tuition_fees ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 SELECT 가능
CREATE POLICY "Enable select for tuition_fees"
ON tuition_fees
FOR SELECT
USING (true);

-- 모든 사용자가 INSERT 가능
CREATE POLICY "Enable insert for tuition_fees"
ON tuition_fees
FOR INSERT
WITH CHECK (true);

-- 모든 사용자가 UPDATE 가능
CREATE POLICY "Enable update for tuition_fees"
ON tuition_fees
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 모든 사용자가 DELETE 가능
CREATE POLICY "Enable delete for tuition_fees"
ON tuition_fees
FOR DELETE
USING (true);

-- 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'tuition_fees';
*/

