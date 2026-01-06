-- timetable_settings 중복 row 확인
SELECT academy_id, COUNT(*) as count 
FROM timetable_settings 
GROUP BY academy_id 
HAVING COUNT(*) > 1;

-- academy_id unique constraint 추가 (없으면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'timetable_settings_academy_id_unique'
  ) THEN
    ALTER TABLE timetable_settings 
    ADD CONSTRAINT timetable_settings_academy_id_unique 
    UNIQUE (academy_id);
  END IF;
END $$;

