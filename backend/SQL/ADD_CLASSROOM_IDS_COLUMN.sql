-- timetable_settings 테이블에 classroom_ids 컬럼 추가
ALTER TABLE timetable_settings 
ADD COLUMN IF NOT EXISTS classroom_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- 컬럼 설명 추가 (선택사항)
COMMENT ON COLUMN timetable_settings.classroom_ids IS '시간표에 표시할 강의실 ID 배열';

