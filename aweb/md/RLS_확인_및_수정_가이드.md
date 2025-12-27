# RLS 정책 확인 및 수정 가이드

## 1단계: Supabase 대시보드 접속

1. 브라우저에서 [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택

## 2단계: SQL Editor 열기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

## 3단계: RLS 상태 확인

SQL Editor에 다음 쿼리를 붙여넣고 실행:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS 활성화 여부",
    CASE 
        WHEN rowsecurity THEN '❌ 활성화됨 (문제!)'
        ELSE '✅ 비활성화됨'
    END as "상태"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'academies', 
    'users', 
    'subjects', 
    'classrooms', 
    'teachers', 
    'students', 
    'classes', 
    'enrollments', 
    'schedules', 
    'requests'
)
ORDER BY tablename;
```

**결과 확인:**
- 모든 테이블의 "RLS 활성화 여부"가 `false`여야 합니다
- `true`인 테이블이 있다면 RLS가 활성화되어 있는 것입니다

## 4단계: RLS 비활성화

RLS가 활성화된 테이블이 있다면, 다음 SQL을 실행하세요:

```sql
ALTER TABLE academies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
```

## 5단계: 다시 확인

3단계의 확인 쿼리를 다시 실행하여 모든 테이블의 RLS가 비활성화되었는지 확인하세요.

## 6단계: 백엔드 서버 재시작

RLS를 비활성화한 후 백엔드 서버를 재시작하세요.

## 완료!

이제 회원가입을 다시 시도해보세요. foreign key constraint 오류가 발생하지 않아야 합니다.

