-- 수업의 classroom_id와 시간표 강의실 매칭 확인

-- 1. 모든 수업과 강의실 매칭 상태 확인
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.classroom_id,
  c.start_time,
  c.academy_id,
  cr.id as classroom_table_id,
  cr.name as classroom_name,
  cr.academy_id as classroom_academy_id,
  CASE 
    WHEN c.classroom_id IS NULL THEN '❌ classroom_id가 NULL'
    WHEN cr.id IS NULL THEN '❌ 강의실이 존재하지 않음'
    WHEN c.classroom_id = cr.id THEN '✅ 매칭됨'
    ELSE '⚠️ 불일치'
  END as match_status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
ORDER BY c.created_at DESC;

-- 2. 각 학원별로 수업과 강의실 매칭 확인
SELECT 
  a.id as academy_id,
  a.name as academy_name,
  COUNT(DISTINCT c.id) as total_classes,
  COUNT(DISTINCT CASE WHEN cr.id IS NOT NULL THEN c.id END) as matched_classes,
  COUNT(DISTINCT CASE WHEN cr.id IS NULL AND c.classroom_id IS NOT NULL THEN c.id END) as unmatched_classes,
  COUNT(DISTINCT cr.id) as total_classrooms
FROM academies a
LEFT JOIN classes c ON c.academy_id = a.id
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
GROUP BY a.id, a.name
ORDER BY total_classes DESC;

-- 3. 매칭되지 않은 수업 상세 확인
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.classroom_id as class_classroom_id,
  c.start_time,
  c.academy_id,
  a.name as academy_name,
  '강의실이 존재하지 않음' as reason
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
LEFT JOIN academies a ON c.academy_id = a.id
WHERE c.classroom_id IS NOT NULL 
  AND cr.id IS NULL
ORDER BY c.created_at DESC;

-- 4. 각 학원의 강의실 목록 확인
SELECT 
  a.id as academy_id,
  a.name as academy_name,
  cr.id as classroom_id,
  cr.name as classroom_name,
  COUNT(c.id) as class_count
FROM academies a
LEFT JOIN classrooms cr ON cr.academy_id = a.id
LEFT JOIN classes c ON c.classroom_id = cr.id
GROUP BY a.id, a.name, cr.id, cr.name
ORDER BY a.created_at DESC, cr.created_at ASC;

-- 5. 특정 시간대의 수업과 강의실 매칭 확인 (예: 01:00)
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.classroom_id,
  c.start_time,
  cr.id as classroom_table_id,
  cr.name as classroom_name,
  CASE 
    WHEN c.classroom_id = cr.id THEN '✅ 매칭'
    WHEN cr.id IS NULL THEN '❌ 강의실 없음'
    ELSE '⚠️ 불일치'
  END as match_status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
WHERE c.start_time LIKE '%01:00%' OR c.start_time = '01:00'
ORDER BY c.created_at DESC;

