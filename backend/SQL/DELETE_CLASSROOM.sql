-- 강의실 1 삭제
-- Supabase SQL Editor에서 실행하세요

-- ID로 강의실 삭제
DELETE FROM classrooms
WHERE id = '57a830a5-ac16-409e-a1e8-5861ff0bba51';

-- 삭제 확인
SELECT 
    id,
    name,
    academy_id
FROM classrooms
WHERE id = '57a830a5-ac16-409e-a1e8-5861ff0bba51';

-- 결과가 비어있으면 삭제 성공!

-- 또는 이름으로 삭제 (더 안전)
-- DELETE FROM classrooms
-- WHERE name = '강의실 1'
-- AND id = '57a830a5-ac16-409e-a1e8-5861ff0bba51';

