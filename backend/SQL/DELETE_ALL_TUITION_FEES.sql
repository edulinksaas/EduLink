-- 해당 학원의 모든 수강료 삭제
-- Supabase SQL Editor에서 실행하세요

-- ⚠️ 주의: 이 스크립트는 해당 학원의 모든 수강료를 삭제합니다!

-- 학원 ID (로그에서 확인한 ID)
-- academy_id: '12f11307-f801-48b5-87ca-65daa8792c59'

-- 방법 1: 특정 학원의 모든 수강료 삭제
DELETE FROM tuition_fees
WHERE academy_id = '12f11307-f801-48b5-87ca-65daa8792c59';

-- 삭제 확인
SELECT 
    id,
    academy_id,
    amount,
    value,
    created_at
FROM tuition_fees
WHERE academy_id = '12f11307-f801-48b5-87ca-65daa8792c59';

-- 결과가 비어있으면 삭제 성공!

-- ============================================
-- 방법 2: 모든 수강료 삭제 (모든 학원)
-- ============================================
-- ⚠️ 매우 위험합니다! 모든 학원의 수강료가 삭제됩니다!
-- 주석을 해제하고 실행하면 모든 수강료가 삭제됩니다.

/*
DELETE FROM tuition_fees;

-- 삭제 확인
SELECT COUNT(*) as "남은 수강료 개수" FROM tuition_fees;
-- 결과가 0이면 모든 수강료가 삭제되었습니다.
*/

