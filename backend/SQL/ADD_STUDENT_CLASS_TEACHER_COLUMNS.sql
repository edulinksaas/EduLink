-- students 테이블에 수업/선생님 연결 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id),
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES teachers(id);


