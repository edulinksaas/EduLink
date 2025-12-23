-- grade와 school_grade 필드 통일
-- Supabase SQL Editor에서 실행하세요

-- school_grade가 있지만 grade가 없는 경우, school_grade 값을 grade로 복사
UPDATE students 
SET grade = school_grade 
WHERE (grade IS NULL OR grade = '') 
  AND school_grade IS NOT NULL 
  AND school_grade != '';

-- grade가 있지만 school_grade가 없는 경우, grade 값을 school_grade로 복사
UPDATE students 
SET school_grade = grade 
WHERE (school_grade IS NULL OR school_grade = '') 
  AND grade IS NOT NULL 
  AND grade != '';

-- 두 필드 모두 있는 경우, grade 값을 우선하여 school_grade를 grade로 통일
UPDATE students 
SET school_grade = grade 
WHERE grade IS NOT NULL 
  AND grade != '' 
  AND school_grade IS NOT NULL 
  AND school_grade != ''
  AND grade != school_grade;
