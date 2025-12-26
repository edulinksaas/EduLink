-- 강의 제목 일부분으로 강의명을 찾는 SQL 문
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 기본 부분 일치 검색 (LIKE 사용)
-- ============================================
-- '검색어' 부분을 실제 검색할 강의명의 일부로 변경하세요

-- 앞부분 일치 검색 (예: "배드민턴"으로 시작하는 강의)
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
WHERE name LIKE '검색어%';  -- '검색어'로 시작하는 강의

-- 뒷부분 일치 검색 (예: "기초반"으로 끝나는 강의)
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
WHERE name LIKE '%검색어';  -- '검색어'로 끝나는 강의

-- 중간 포함 검색 (예: "기초"가 포함된 강의)
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
WHERE name LIKE '%검색어%';  -- '검색어'가 포함된 강의 (가장 많이 사용)

-- ============================================
-- 2. 대소문자 구분 없이 검색 (ILIKE 사용 - PostgreSQL/Supabase)
-- ============================================
-- ILIKE는 대소문자를 구분하지 않습니다 (LIKE는 대소문자 구분)

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
WHERE name ILIKE '%검색어%';  -- 대소문자 구분 없이 검색

-- ============================================
-- 3. 여러 검색어 중 하나라도 포함된 강의 찾기
-- ============================================
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
WHERE name LIKE '%검색어1%' 
   OR name LIKE '%검색어2%'
   OR name LIKE '%검색어3%';

-- ============================================
-- 4. 특정 학원의 강의만 검색
-- ============================================
-- academy_id를 함께 사용하여 특정 학원의 강의만 검색
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
WHERE name LIKE '%검색어%'
  AND academy_id = '학원UUID';  -- 여기에 학원 UUID 입력

-- ============================================
-- 5. 정렬 옵션 추가
-- ============================================
-- 강의명 순으로 정렬
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
WHERE name LIKE '%검색어%'
ORDER BY name ASC;  -- 강의명 오름차순 정렬

-- 생성일시 최신순으로 정렬
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
WHERE name LIKE '%검색어%'
ORDER BY created_at DESC;  -- 최신순 정렬

-- ============================================
-- 6. 검색 결과 개수만 확인
-- ============================================
SELECT COUNT(*) AS 검색된_강의수
FROM classes
WHERE name LIKE '%검색어%';

-- ============================================
-- 7. 관련 정보와 함께 조회 (JOIN 사용)
-- ============================================
-- 과목명, 선생님명, 강의실명도 함께 조회
SELECT 
  c.id AS 강의ID,
  c.name AS 강의명,
  c.level AS 레벨,
  c.schedule AS 요일,
  c.start_time AS 시작시간,
  c.end_time AS 종료시간,
  c.max_students AS 정원,
  s.name AS 과목명,
  t.name AS 선생님명,
  cr.name AS 강의실명,
  a.name AS 학원명,
  c.created_at AS 생성일시
FROM classes c
LEFT JOIN subjects s ON c.subject_id = s.id
LEFT JOIN teachers t ON c.teacher_id = t.id
LEFT JOIN classrooms cr ON c.classroom_id = cr.id
LEFT JOIN academies a ON c.academy_id = a.id
WHERE c.name LIKE '%검색어%'
ORDER BY c.name ASC;

-- ============================================
-- 사용 예시:
-- ============================================
-- 1. "배드민턴"이 포함된 모든 강의 찾기:
--    SELECT * FROM classes WHERE name LIKE '%배드민턴%';
--
-- 2. "기초반"으로 끝나는 강의 찾기:
--    SELECT * FROM classes WHERE name LIKE '%기초반';
--
-- 3. "배드민턴"으로 시작하는 강의 찾기:
--    SELECT * FROM classes WHERE name LIKE '배드민턴%';
--
-- 4. 대소문자 구분 없이 검색:
--    SELECT * FROM classes WHERE name ILIKE '%배드민턴%';
--
-- 5. "배드민턴" 또는 "테니스"가 포함된 강의 찾기:
--    SELECT * FROM classes 
--    WHERE name LIKE '%배드민턴%' OR name LIKE '%테니스%';

