-- 강의명을 통해 강의 데이터를 찾고 삭제하는 SQL 문
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 강의명으로 강의 데이터 조회 (삭제 전 확인용)
-- ============================================
-- 아래 '강의명' 부분을 실제 강의명으로 변경하세요
SELECT 
  id,
  name AS 강의명,
  level AS 레벨,
  schedule AS 요일,
  start_time AS 시작시간,
  end_time AS 종료시간,
  max_students AS 정원,
  subject_id,
  teacher_id,
  classroom_id,
  academy_id,
  created_at AS 생성일시
FROM classes
WHERE name = '강의명';  -- 여기에 삭제할 강의명 입력

-- ============================================
-- 2. 강의명으로 강의 삭제
-- ============================================
-- ⚠️ 주의: 이 쿼리는 해당 강의명을 가진 모든 강의를 삭제합니다.
-- 삭제 전에 위의 SELECT 쿼리로 확인하세요.

-- 단일 강의 삭제 (정확한 강의명 일치)
DELETE FROM classes
WHERE name = '강의명';  -- 여기에 삭제할 강의명 입력

-- 부분 일치로 삭제 (강의명에 특정 문자열이 포함된 경우)
-- DELETE FROM classes
-- WHERE name LIKE '%강의명%';  -- 부분 일치 검색

-- ============================================
-- 3. 특정 학원의 강의만 삭제 (더 안전한 방법)
-- ============================================
-- academy_id를 함께 확인하여 특정 학원의 강의만 삭제
-- 먼저 academy_id를 확인하세요:
-- SELECT id, name FROM academies;

-- 특정 학원의 강의명으로 삭제
-- DELETE FROM classes
-- WHERE name = '강의명'
--   AND academy_id = '학원ID';  -- 여기에 학원 UUID 입력

-- ============================================
-- 4. 삭제 전 관련 데이터 확인
-- ============================================
-- 해당 강의에 등록된 학생이 있는지 확인
SELECT 
  c.id AS class_id,
  c.name AS 강의명,
  COUNT(e.id) AS 등록된_학생수
FROM classes c
LEFT JOIN enrollments e ON c.id = e.class_id
WHERE c.name = '강의명'  -- 여기에 강의명 입력
GROUP BY c.id, c.name;

-- 등록된 학생이 있으면 enrollments도 함께 삭제해야 할 수 있습니다:
-- DELETE FROM enrollments
-- WHERE class_id IN (
--   SELECT id FROM classes WHERE name = '강의명'
-- );

-- ============================================
-- 사용 예시:
-- ============================================
-- 1. 먼저 조회하여 확인:
--    SELECT * FROM classes WHERE name = '배드민턴 기초반';
--
-- 2. 확인 후 삭제:
--    DELETE FROM classes WHERE name = '배드민턴 기초반';
--
-- 3. 특정 학원의 강의만 삭제:
--    DELETE FROM classes 
--    WHERE name = '배드민턴 기초반' 
--      AND academy_id = '123e4567-e89b-12d3-a456-426614174000';

