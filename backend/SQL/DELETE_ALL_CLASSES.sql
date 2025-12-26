-- 모든 수업 정보 삭제

-- 1. 삭제 전 확인: 현재 수업 개수
SELECT COUNT(*) as total_classes FROM classes;

-- 2. 삭제 전 확인: 수업 목록 (최근 10개)
SELECT 
  id,
  name,
  academy_id,
  classroom_id,
  start_time,
  end_time,
  created_at
FROM classes
ORDER BY created_at DESC
LIMIT 10;

-- 3. 모든 수업 삭제 (주의: 되돌릴 수 없습니다!)
DELETE FROM classes;

-- 4. 삭제 후 확인: 수업 개수 (0이어야 함)
SELECT COUNT(*) as remaining_classes FROM classes;

-- 5. (선택사항) 시퀀스 리셋 (id가 시퀀스를 사용하는 경우)
-- ALTER SEQUENCE classes_id_seq RESTART WITH 1;

