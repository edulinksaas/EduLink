-- 수업 데이터 상세 확인

-- 1. 수업의 academy_id 확인
SELECT 
  c.id,
  c.name,
  c.academy_id,
  c.classroom_id,
  c.start_time,
  c.end_time,
  c.schedule,
  a.name as academy_name,
  cr.name as classroom_name,
  c.created_at
FROM classes c
LEFT JOIN academies a ON c.academy_id = a.id
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
ORDER BY c.created_at DESC;

-- 2. academy_id별 수업 개수
SELECT 
  academy_id,
  COUNT(*) as class_count,
  STRING_AGG(name, ', ') as class_names
FROM classes
GROUP BY academy_id
ORDER BY class_count DESC;

-- 3. start_time과 end_time이 있는 수업 확인
SELECT 
  id,
  name,
  academy_id,
  start_time,
  end_time,
  schedule,
  CASE 
    WHEN start_time IS NULL THEN '❌ start_time 없음'
    WHEN end_time IS NULL THEN '❌ end_time 없음'
    WHEN schedule IS NULL THEN '❌ schedule 없음'
    ELSE '✅ 시간 정보 있음'
  END as time_status
FROM classes
ORDER BY created_at DESC;

-- 4. 특정 academy_id의 수업 확인 (실제 academy_id로 변경 필요)
-- SELECT * FROM classes WHERE academy_id = 'YOUR_ACADEMY_ID_HERE';

