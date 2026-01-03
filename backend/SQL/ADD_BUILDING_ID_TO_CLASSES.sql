-- classes 테이블에 building_id 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- building_id 컬럼 추가 (INTEGER 타입, 관 ID 저장)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS building_id INTEGER DEFAULT 1;

-- 컬럼 설명 추가
COMMENT ON COLUMN classes.building_id IS '수업이 속한 관 ID (timetable_settings의 building_names와 매칭)';

-- 기존 데이터에 기본값 설정 (1관으로 설정)
UPDATE classes 
SET building_id = 1 
WHERE building_id IS NULL;

