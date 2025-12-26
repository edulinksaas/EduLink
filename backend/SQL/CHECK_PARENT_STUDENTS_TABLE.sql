-- parent_students 테이블 존재 여부 확인
-- Supabase SQL Editor에서 실행하세요

-- 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'parent_students'
);

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'parent_students'
ORDER BY ordinal_position;

-- 현재 관계 데이터 확인
SELECT 
  ps.id,
  p.phone as parent_phone,
  p.name as parent_name,
  s.name as student_name,
  ps.relationship,
  ps.created_at
FROM parent_students ps
LEFT JOIN parents p ON ps.parent_id = p.id
LEFT JOIN students s ON ps.student_id = s.id
ORDER BY ps.created_at DESC
LIMIT 20;

