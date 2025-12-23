# 웹 프로그램과 모바일 앱 연동 가이드

이 가이드는 바탕화면의 `saas` 웹 프로그램과 `학부모 전용 앱`을 연동하는 방법을 설명합니다.

## 연동 개요

두 애플리케이션은 **동일한 Supabase 프로젝트**를 공유하여 데이터를 공유합니다.

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   웹 프로그램    │────────▶│   Supabase   │◀────────│  모바일 앱      │
│   (saas)        │         │  (공유 DB)    │         │  (학부모 앱)    │
└─────────────────┘         └──────────────┘         └─────────────────┘
```

## 1. Supabase 프로젝트 공유 설정

### 웹 프로그램 (saas) 설정

`saas/server/.env` 파일에 Supabase 설정이 이미 되어 있어야 합니다:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

### 모바일 앱 설정

`학부모 전용 앱/app/.env` 파일에 **동일한 Supabase 프로젝트** 정보를 설정:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **참고**: 웹 프로그램은 Service Role Key를 사용하고, 모바일 앱은 Anon Key를 사용합니다.

## 2. 데이터베이스 스키마 확인

웹 프로그램의 `SUPABASE_SCHEMA.sql`에 이미 다음 테이블들이 정의되어 있습니다:

- `academies` - 학원 정보
- `students` - 학생 정보
- `teachers` - 선생님 정보
- `classes` - 수업 정보
- `enrollments` - 수강 등록 정보
- `schedules` - 일정 정보
- `users` - 사용자 정보

모바일 앱에서 사용할 `events` 테이블도 추가로 생성해야 합니다 (이미 `supabase-schema.sql`에 정의됨).

## 3. RLS (Row Level Security) 정책 설정

두 애플리케이션이 같은 데이터를 공유하므로, RLS 정책을 적절히 설정해야 합니다.

### 학부모 앱에서 학생 정보 조회

학부모는 자신의 자녀(학생) 정보만 조회할 수 있어야 합니다. 이를 위해:

1. `students` 테이블에 `parent_id` 또는 `parent_contact` 필드 확인
2. 학부모 인증 정보와 연결
3. RLS 정책에서 학부모가 자신의 자녀 정보만 조회하도록 설정

### 예시 RLS 정책

```sql
-- 학부모가 자신의 자녀 정보만 조회 가능
CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  USING (
    parent_contact IN (
      SELECT contact FROM users WHERE id = auth.uid()
    )
  );
```

## 4. 모바일 앱에서 웹 프로그램 데이터 사용

### 4.1 학생 정보 조회

```javascript
import { supabase } from './lib/supabase';

// 학부모 연락처로 자녀 정보 조회
const fetchChildren = async (parentContact) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_contact', parentContact);
  
  return data || [];
};
```

### 4.2 수업 일정 조회

```javascript
// 자녀의 수업 일정 조회
const fetchChildSchedule = async (studentId) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      classes (
        *,
        subjects (*),
        teachers (*),
        classrooms (*)
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'active');
  
  return data || [];
};
```

### 4.3 출석 정보 조회

```javascript
// 자녀의 출석 정보 조회
const fetchAttendance = async (studentId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  return data || [];
};
```

## 5. 인증 통합

### 옵션 1: Supabase Auth 사용 (권장)

두 애플리케이션 모두 Supabase Auth를 사용하도록 통합:

**웹 프로그램**:
- Supabase Auth로 로그인
- JWT 토큰 사용

**모바일 앱**:
- Supabase Auth로 로그인
- 동일한 사용자 계정 사용

### 옵션 2: 웹 프로그램 API 사용

모바일 앱이 웹 프로그램의 Express 서버 API를 호출:

```javascript
// 모바일 앱에서 웹 프로그램 API 호출
const API_BASE_URL = 'http://your-server-url:3000/api';

const fetchStudents = async (academyId) => {
  const response = await fetch(`${API_BASE_URL}/students?academy_id=${academyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## 6. 데이터 동기화

### 실시간 동기화 (Supabase Realtime)

Supabase Realtime을 사용하여 실시간 데이터 동기화:

```javascript
// 모바일 앱에서 실시간 구독
import { supabase } from './lib/supabase';

const subscribeToStudentUpdates = (studentId, callback) => {
  const channel = supabase
    .channel(`student:${studentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'students',
        filter: `id=eq.${studentId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

## 7. 설정 체크리스트

- [ ] 웹 프로그램과 모바일 앱이 같은 Supabase 프로젝트를 사용하도록 설정
- [ ] `학부모 전용 앱/app/.env`에 Supabase URL과 Anon Key 설정
- [ ] `supabase-schema.sql` 실행하여 `events` 테이블 생성
- [ ] RLS 정책 설정 (학부모가 자신의 자녀 정보만 조회)
- [ ] 모바일 앱에서 학생 정보 조회 테스트
- [ ] 모바일 앱에서 수업 일정 조회 테스트
- [ ] 인증 시스템 통합 (선택사항)

## 8. 문제 해결

### 데이터가 보이지 않는 경우

1. RLS 정책 확인
2. 사용자 인증 상태 확인
3. Supabase 대시보드에서 직접 쿼리 테스트

### 인증 오류

1. Supabase Auth 설정 확인
2. JWT 토큰 유효성 확인
3. RLS 정책에서 `auth.uid()` 사용 여부 확인

## 다음 단계

1. 모바일 앱의 `AppContext`를 Supabase 데이터로 업데이트
2. CalendarScreen에서 웹 프로그램의 일정 데이터 연동
3. 학생 정보 화면에서 웹 프로그램의 학생 데이터 표시
4. 출석 정보 연동 (선택사항)
