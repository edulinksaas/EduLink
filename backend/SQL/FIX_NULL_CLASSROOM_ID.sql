-- classroom_id가 NULL인 수업 수정

-- 1. classroom_id가 NULL인 수업 확인
SELECT 
  c.id,
  c.name,
  c.academy_id,
  c.classroom_id,
  c.start_time,
  c.created_at
FROM classes c
WHERE c.classroom_id IS NULL
ORDER BY c.created_at DESC;

-- 2. 각 학원의 첫 번째 강의실 찾기
SELECT 
  a.id as academy_id,
  a.name as academy_name,
  cr.id as first_classroom_id,
  cr.name as first_classroom_name
FROM academies a
LEFT JOIN LATERAL (
  SELECT id, name 
  FROM classrooms 
  WHERE academy_id = a.id 
  ORDER BY created_at ASC 
  LIMIT 1
) cr ON true
ORDER BY a.created_at DESC;

-- 3. classroom_id가 NULL인 수업을 각 학원의 첫 번째 강의실로 업데이트
-- (실제 실행 전에 위 쿼리로 확인 후 실행하세요)
UPDATE classes c
SET classroom_id = (
  SELECT cr.id 
  FROM classrooms cr 
  WHERE cr.academy_id = c.academy_id 
  ORDER BY cr.created_at ASC 
  LIMIT 1
)
WHERE c.classroom_id IS NULL
AND EXISTS (
  SELECT 1 
  FROM classrooms cr 
  WHERE cr.academy_id = c.academy_id
);

-- 4. 업데이트 결과 확인
SELECT 
  c.id,
  c.name,
  c.academy_id,
  c.classroom_id,
  cr.name as classroom_name,
  CASE 
    WHEN c.classroom_id IS NULL THEN '❌ 여전히 NULL'
    WHEN cr.id IS NULL THEN '⚠️ 강의실 없음'
    ELSE '✅ 수정됨'
  END as status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
WHERE c.classroom_id IS NULL OR cr.id IS NULL
ORDER BY c.created_at DESC;

