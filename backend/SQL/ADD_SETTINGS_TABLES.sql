-- 시간표 설정 테이블
CREATE TABLE IF NOT EXISTS timetable_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE NOT NULL,
  operating_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  time_interval VARCHAR(50) DEFAULT '1시간',
  day_time_settings JSONB DEFAULT '{}'::jsonb,
  timetable_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(academy_id)
);

-- 수강료 설정 테이블
CREATE TABLE IF NOT EXISTS tuition_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE NOT NULL,
  amount VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_timetable_settings_academy_id ON timetable_settings(academy_id);
CREATE INDEX IF NOT EXISTS idx_tuition_fees_academy_id ON tuition_fees(academy_id);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_timetable_settings_updated_at ON timetable_settings;
CREATE TRIGGER update_timetable_settings_updated_at BEFORE UPDATE ON timetable_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tuition_fees_updated_at ON tuition_fees;
CREATE TRIGGER update_tuition_fees_updated_at BEFORE UPDATE ON tuition_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

