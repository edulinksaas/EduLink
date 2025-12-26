-- 특정 수업들의 시간을 24시간 형식으로 수정
-- 줄넘기 기초반, 축구 초등 고학년반, 배드민턴 기초반

-- 1단계: 현재 상태 확인
SELECT 
  id,
  name,
  schedule as 요일,
  start_time as 현재_시작시간,
  end_time as 현재_종료시간
FROM classes
WHERE id IN (
  'a775f510-5386-4878-bbb9-4116d9330098', -- 줄넘기 기초반
  '3b713556-0e97-421d-beee-25b391226d82', -- 축구 초등 고학년반
  '271af08f-d389-4046-9f05-c3db85549562'  -- 배드민턴 기초반
)
ORDER BY name;

-- 2단계: 시간 업데이트 실행
UPDATE classes
SET 
  start_time = CASE 
    WHEN id = 'a775f510-5386-4878-bbb9-4116d9330098' THEN '17:00'  -- 줄넘기 기초반: 05:00 → 17:00
    WHEN id = '3b713556-0e97-421d-beee-25b391226d82' THEN '16:10'  -- 축구 초등 고학년반: 04:10 → 16:10
    WHEN id = '271af08f-d389-4046-9f05-c3db85549562' THEN '13:00'  -- 배드민턴 기초반: 01:00 → 13:00
    ELSE start_time
  END,
  end_time = CASE 
    WHEN id = 'a775f510-5386-4878-bbb9-4116d9330098' THEN '17:50'  -- 줄넘기 기초반: 05:50 → 17:50
    WHEN id = '3b713556-0e97-421d-beee-25b391226d82' THEN '17:00'  -- 축구 초등 고학년반: 05:00 → 17:00
    WHEN id = '271af08f-d389-4046-9f05-c3db85549562' THEN '13:50'  -- 배드민턴 기초반: 01:50 → 13:50
    ELSE end_time
  END,
  updated_at = NOW()
WHERE id IN (
  'a775f510-5386-4878-bbb9-4116d9330098',
  '3b713556-0e97-421d-beee-25b391226d82',
  '271af08f-d389-4046-9f05-c3db85549562'
);

-- 3단계: 업데이트 결과 확인
SELECT 
  id,
  name,
  schedule as 요일,
  start_time as 수정후_시작시간,
  end_time as 수정후_종료시간,
  updated_at as 업데이트시간
FROM classes
WHERE id IN (
  'a775f510-5386-4878-bbb9-4116d9330098',
  '3b713556-0e97-421d-beee-25b391226d82',
  '271af08f-d389-4046-9f05-c3db85549562'
)
ORDER BY start_time;

