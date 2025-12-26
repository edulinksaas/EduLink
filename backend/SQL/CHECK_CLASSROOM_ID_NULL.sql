-- classroom_id가 NULL이거나 없는 수업 확인

-- 1. classroom_id가 NULL인 수업 확인
SELECT 
  id,
  name,
  academy_id,
  classroom_id,
  start_time,
  end_time,
  created_at
FROM classes
WHERE classroom_id IS NULL
ORDER BY created_at DESC;

-- 2. classroom_id가 NULL인 수업 확인 (UUID 타입은 빈 문자열 비교 불가)
SELECT 
  id,
  name,
  academy_id,
  classroom_id,
  start_time,
  end_time,
  created_at
FROM classes
WHERE classroom_id IS NULL
ORDER BY created_at DESC;

-- 3. 모든 수업의 classroom_id 상태 확인
SELECT 
  id,
  name,
  academy_id,
  classroom_id,
  CASE 
    WHEN classroom_id IS NULL THEN 'NULL'
    WHEN classroom_id::text = '' THEN '빈 문자열'
    WHEN LENGTH(classroom_id::text) < 10 THEN '너무 짧음'
    ELSE '정상'
  END as classroom_id_status,
  start_time,
  end_time,
  created_at
FROM classes
ORDER BY created_at DESC;

-- 4. classroom_id와 실제 classrooms 테이블 매칭 확인
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.classroom_id,
  cr.id as classroom_table_id,
  cr.name as classroom_name,
  CASE 
    WHEN c.classroom_id IS NULL THEN '❌ classroom_id가 NULL'
    WHEN cr.id IS NULL THEN '❌ 강의실이 존재하지 않음'
    WHEN c.classroom_id = cr.id THEN '✅ 매칭됨'
    ELSE '⚠️ 불일치'
  END as match_status
FROM classes c
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
ORDER BY c.created_at DESC;

