-- 특정 학원의 수업 데이터 확인 (실제 academy_id로 변경 필요)

-- 1. 모든 학원 목록 확인
SELECT id, name, code FROM academies ORDER BY created_at DESC;

-- 2. 특정 학원의 수업 확인 (아래 YOUR_ACADEMY_ID_HERE를 실제 학원 ID로 변경)
-- SELECT 
--   c.id,
--   c.name,
--   c.academy_id,
--   c.classroom_id,
--   c.start_time,
--   c.end_time,
--   cr.name as classroom_name,
--   a.name as academy_name
-- FROM classes c
-- LEFT JOIN classrooms cr ON c.classroom_id = cr.id
-- LEFT JOIN academies a ON c.academy_id = a.id
-- WHERE c.academy_id = 'YOUR_ACADEMY_ID_HERE'
-- ORDER BY c.created_at DESC;

-- 3. 수업의 classroom_id와 실제 classrooms 테이블 매칭 확인
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.academy_id,
  c.classroom_id,
  cr.id as classroom_table_id,
  cr.name as classroom_name,
  CASE 
    WHEN c.classroom_id = cr.id THEN '✅ 매칭'
    WHEN cr.id IS NULL THEN '❌ 강의실 없음'
    ELSE '⚠️ 불일치'
  END as status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
ORDER BY c.created_at DESC
LIMIT 20;

-- 4. academy_id별 수업 개수 상세
SELECT 
  a.id,
  a.name as academy_name,
  COUNT(c.id) as total_classes,
  COUNT(DISTINCT c.classroom_id) as unique_classrooms,
  COUNT(DISTINCT c.subject_id) as unique_subjects
FROM academies a
LEFT JOIN classes c ON c.academy_id = a.id
GROUP BY a.id, a.name
ORDER BY total_classes DESC;
