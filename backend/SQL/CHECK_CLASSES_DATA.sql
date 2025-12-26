-- 저장된 수업 데이터 확인

-- 1. 전체 수업 목록 조회
SELECT 
  id,
  academy_id,
  subject_id,
  teacher_id,
  classroom_id,
  name,
  level,
  start_time,
  end_time,
  max_students,
  created_at,
  updated_at
FROM classes
ORDER BY created_at DESC;

-- 2. 학원별 수업 개수 확인
SELECT 
  a.id as academy_id,
  a.name as academy_name,
  COUNT(c.id) as class_count
FROM academies a
LEFT JOIN classes c ON c.academy_id = a.id
GROUP BY a.id, a.name
ORDER BY class_count DESC;

-- 3. 강의실별 수업 개수 확인
SELECT 
  cr.id as classroom_id,
  cr.name as classroom_name,
  cr.academy_id,
  COUNT(c.id) as class_count
FROM classrooms cr
LEFT JOIN classes c ON c.classroom_id = cr.id
GROUP BY cr.id, cr.name, cr.academy_id
ORDER BY class_count DESC;

-- 4. 수업의 강의실 ID와 실제 강의실 테이블 매칭 확인
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.classroom_id as class_classroom_id,
  cr.id as classroom_table_id,
  cr.name as classroom_name,
  CASE 
    WHEN c.classroom_id = cr.id THEN '매칭됨'
    ELSE '매칭 안됨'
  END as match_status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
ORDER BY c.created_at DESC;

-- 5. 특정 학원의 수업 상세 확인 (academy_id를 실제 학원 ID로 변경 필요)
-- SELECT 
--   c.*,
--   s.name as subject_name,
--   t.name as teacher_name,
--   cr.name as classroom_name
-- FROM classes c
-- LEFT JOIN subjects s ON c.subject_id = s.id
-- LEFT JOIN teachers t ON c.teacher_id = t.id
-- LEFT JOIN classrooms cr ON c.classroom_id = cr.id
-- WHERE c.academy_id = 'YOUR_ACADEMY_ID_HERE'
-- ORDER BY c.created_at DESC;
