-- un_academies 테이블에 학원 코드 자동 생성 트리거 추가
-- Supabase SQL Editor에서 실행하세요

-- 학원 코드 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_academy_code()
RETURNS TRIGGER AS $$
DECLARE
  code_prefix VARCHAR(10);
  random_suffix VARCHAR(10);
BEGIN
  -- code가 이미 있으면 그대로 사용
  IF NEW.code IS NOT NULL AND NEW.code != '' THEN
    RETURN NEW;
  END IF;
  
  -- 학원명의 첫 글자들을 사용하여 접두사 생성 (최대 3자)
  code_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(NEW.name, '[^가-힣a-zA-Z0-9]', '', 'g'), 1, 3));
  
  -- 접두사가 없으면 'ACD' 사용
  IF code_prefix = '' OR code_prefix IS NULL THEN
    code_prefix := 'ACD';
  END IF;
  
  -- 랜덤 숫자 6자리 생성
  random_suffix := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- 코드 생성: 접두사 + 랜덤 숫자 (예: ABC123456)
  NEW.code := code_prefix || random_suffix;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (INSERT 전에 코드 자동 생성)
DROP TRIGGER IF EXISTS auto_generate_academy_code ON un_academies;
CREATE TRIGGER auto_generate_academy_code
  BEFORE INSERT ON un_academies
  FOR EACH ROW
  EXECUTE FUNCTION generate_academy_code();
