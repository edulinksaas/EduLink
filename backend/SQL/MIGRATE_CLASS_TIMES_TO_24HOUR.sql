-- ============================================
-- 수업 시간을 24시간 형식으로 마이그레이션하는 스크립트
-- 오전 시간(00:00~11:59)을 오후 시간(12:00~23:59)으로 변환
-- ============================================

-- 1단계: 현재 상태 확인 (변경 전)
-- 실행 후 결과를 확인하고, 변경될 내용이 맞는지 검토하세요.
SELECT 
  id,
  name,
  schedule as 요일,
  start_time as 변경전_시작시간,
  end_time as 변경전_종료시간,
  CASE 
    WHEN start_time::time < '12:00'::time THEN TO_CHAR(start_time::time + INTERVAL '12 hours', 'HH24:MI')
    ELSE start_time
  END as 변경후_시작시간,
  CASE 
    WHEN end_time::time < '12:00'::time THEN TO_CHAR(end_time::time + INTERVAL '12 hours', 'HH24:MI')
    ELSE end_time
  END as 변경후_종료시간
FROM classes
WHERE 
  start_time::time < '12:00'::time 
  OR end_time::time < '12:00'::time
ORDER BY start_time;

-- 2단계: 변경될 수업 개수 확인
SELECT 
  COUNT(*) as 변경될_수업_개수
FROM classes
WHERE 
  start_time::time < '12:00'::time 
  OR end_time::time < '12:00'::time;

-- 3단계: 실제 업데이트 실행
-- ⚠️ 위의 확인 쿼리 결과를 검토한 후 실행하세요!
-- 오전 시간(00:00~11:59)인 경우에만 12시간 추가하여 오후 시간으로 변경
UPDATE classes
SET 
  start_time = CASE 
    WHEN start_time::time < '12:00'::time THEN TO_CHAR(start_time::time + INTERVAL '12 hours', 'HH24:MI')
    ELSE start_time
  END,
  end_time = CASE 
    WHEN end_time::time < '12:00'::time THEN TO_CHAR(end_time::time + INTERVAL '12 hours', 'HH24:MI')
    ELSE end_time
  END,
  updated_at = NOW()
WHERE 
  start_time::time < '12:00'::time 
  OR end_time::time < '12:00'::time;

-- 4단계: 업데이트 결과 확인 (변경 후)
SELECT 
  id,
  name,
  schedule as 요일,
  start_time as 시작시간,
  end_time as 종료시간,
  updated_at as 업데이트시간
FROM classes
ORDER BY start_time;

-- 5단계: 변경 완료 확인
-- 오전 시간이 남아있는지 확인 (없어야 정상)
SELECT 
  COUNT(*) as 남은_오전시간_수업수
FROM classes
WHERE 
  start_time::time < '12:00'::time 
  OR end_time::time < '12:00'::time;

