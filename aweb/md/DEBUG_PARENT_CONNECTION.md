# 학부모 연동 문제 진단 가이드

## 문제 상황
웹에서는 학생이 등록되지만 앱에서는 연동이 안되는 경우

## 진단 단계

### 1단계: 데이터베이스 테이블 확인

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- parent_students 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'parent_students'
);
```

**결과가 `false`인 경우:**
- `CREATE_PARENT_STUDENTS_TABLE.sql` 파일을 Supabase SQL Editor에서 실행하세요.

### 2단계: 학생 등록 시 로그 확인

학생을 등록할 때 서버 콘솔에서 다음 로그를 확인하세요:

```
📞 학부모 자동 연결 시작: 학생 [이름], 연락처 [전화번호]
🏫 학원 정보 조회: [학원명]
✅ 새 학부모 생성 완료: [전화번호] (ID: [UUID])
또는
✅ 기존 학부모 사용: [전화번호] (ID: [UUID])
🔗 학부모-학생 관계 생성 시도...
✅ 학부모-학생 관계 생성 완료: [전화번호] ↔ [학생명] (관계 ID: [UUID])
```

**에러가 발생하는 경우:**
- 에러 메시지를 확인하고 아래 해결 방법을 참고하세요.

### 3단계: 관계 데이터 확인

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- 최근 생성된 관계 확인
SELECT 
  ps.id,
  p.phone as parent_phone,
  p.name as parent_name,
  s.name as student_name,
  ps.relationship,
  ps.created_at
FROM parent_students ps
LEFT JOIN parents p ON ps.parent_id = p.id
LEFT JOIN students s ON ps.student_id = s.id
ORDER BY ps.created_at DESC
LIMIT 20;
```

**결과가 없는 경우:**
- 학생 등록 시 `parent_contact`가 입력되었는지 확인
- 서버 로그에서 에러 확인

### 4단계: 학부모 앱에서 확인

학부모 ID를 확인한 후 다음 URL로 접속:

```
http://localhost:5173/parent/[학부모ID]/children
```

또는 API 직접 호출:

```bash
curl http://localhost:3000/api/parents/[학부모ID]/children
```

## 일반적인 문제와 해결 방법

### 문제 1: parent_students 테이블이 없음

**해결:**
1. `CREATE_PARENT_STUDENTS_TABLE.sql` 파일 열기
2. Supabase SQL Editor에서 실행

### 문제 2: 학생 등록 시 parent_contact가 비어있음

**해결:**
- 학생 등록 시 "학부모 연락처" 필드를 반드시 입력하세요.

### 문제 3: 학부모 생성은 되지만 관계 생성 실패

**원인:**
- `parent_students` 테이블이 없거나
- RLS 정책 문제

**해결:**
1. 테이블 생성 확인
2. RLS 정책 확인 및 수정

### 문제 4: 학부모 앱 페이지가 보이지 않음

**해결:**
- `/parent/[학부모ID]/children` 경로로 직접 접속
- 학부모 ID는 Supabase에서 확인하거나 서버 로그에서 확인

## 테스트 방법

1. **학생 등록 테스트:**
   ```
   - 학생 이름: 테스트 학생
   - 학부모 연락처: 010-1234-5678
   - 기타 필수 정보 입력
   ```

2. **서버 로그 확인:**
   - 콘솔에서 학부모 생성/연결 로그 확인

3. **데이터베이스 확인:**
   - Supabase에서 `parent_students` 테이블 확인

4. **학부모 앱 확인:**
   - 생성된 학부모 ID로 `/parent/[ID]/children` 접속

## 추가 디버깅

서버 로그에 더 자세한 정보가 출력되도록 수정되었습니다. 
학생 등록 시 콘솔을 확인하여 어느 단계에서 문제가 발생하는지 확인하세요.

