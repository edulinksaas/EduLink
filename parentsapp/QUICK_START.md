# 빠른 시작 가이드

웹 프로그램(saas)과 모바일 앱을 연동하는 빠른 시작 가이드입니다.

## 1단계: 환경 변수 설정

### 모바일 앱 설정

`학부모 전용 앱/app/.env` 파일을 생성하고 다음 내용을 추가:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **중요**: 웹 프로그램(`saas`)과 **같은 Supabase 프로젝트**를 사용해야 합니다!

### Supabase 정보 확인 방법

1. 웹 프로그램의 `saas/server/.env` 파일에서 `SUPABASE_URL` 확인
2. Supabase 대시보드 > Settings > API에서:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`에 사용
   - **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`에 사용

## 2단계: 데이터베이스 테이블 확인

웹 프로그램의 `SUPABASE_SCHEMA.sql`이 이미 실행되어 있어야 합니다.

모바일 앱에서 사용할 `events` 테이블도 생성:

1. Supabase 대시보드 > SQL Editor 열기
2. `학부모 전용 앱/supabase-schema.sql` 파일 내용 복사하여 실행

## 3단계: 앱 재시작

환경 변수를 설정한 후:

```bash
cd "학부모 전용 앱/app"
npm start
```

앱을 다시 로드하세요 (개발 서버에서 `r` 키 누르기).

## 4단계: 테스트

### 테스트 1: Supabase 연결 확인

앱이 시작되면 콘솔에서 다음 메시지를 확인:
- ✅ `Supabase 연결 성공` 또는
- ⚠️ `Supabase 환경 변수가 설정되지 않았습니다.`

### 테스트 2: 자녀 정보 조회

`AppContext`를 업데이트하여 Supabase에서 자녀 정보를 가져오도록 설정:

1. `app/context/AppContextWithSupabase.example.js` 파일 참고
2. `AppContext.js`에 필요한 부분 통합
3. 학부모 연락처 설정 (예: `010-1234-5678`)
4. 자녀 정보가 로드되는지 확인

## 5단계: 화면 연동

### CalendarScreen 연동

`CalendarScreen.js`에서 웹 프로그램의 일정 데이터 사용:

```javascript
import { fetchAcademySchedules } from '../lib/saasIntegration';

// 월간 보기에서 학원 일정 가져오기
const loadAcademySchedules = async () => {
  const academyId = 'your-academy-id';
  const startDate = new Date(2025, 0, 1); // 2025년 1월 1일
  const endDate = new Date(2025, 11, 31); // 2025년 12월 31일
  
  const schedules = await fetchAcademySchedules(academyId, startDate, endDate);
  // schedules를 사용하여 일정 표시
};
```

### ChildScreen 연동

`ChildScreen.js`에서 자녀 정보 표시:

```javascript
import { useApp } from '../context/AppContext';
import { fetchStudentSchedule, fetchStudentAttendance } from '../lib/saasIntegration';

// 자녀의 수업 일정 가져오기
const loadChildSchedule = async (childId) => {
  const schedule = await fetchStudentSchedule(childId);
  // schedule을 사용하여 수업 일정 표시
};

// 자녀의 출석 정보 가져오기
const loadAttendance = async (childId) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1); // 지난 달
  const endDate = new Date();
  
  const attendance = await fetchStudentAttendance(childId, startDate, endDate);
  // attendance를 사용하여 출석 정보 표시
};
```

## 문제 해결

### 환경 변수가 로드되지 않는 경우

1. `.env` 파일이 `app` 폴더에 있는지 확인
2. 파일 이름이 정확히 `.env`인지 확인 (`.env.txt` 아님)
3. 앱을 완전히 재시작 (개발 서버 종료 후 다시 시작)

### 데이터가 보이지 않는 경우

1. **RLS 정책 확인**: Supabase 대시보드 > Authentication > Policies에서 RLS 정책 확인
2. **데이터 확인**: Supabase 대시보드 > Table Editor에서 데이터가 있는지 확인
3. **연락처 확인**: `students` 테이블의 `parent_contact` 필드가 올바른지 확인

### RLS 오류

인증을 사용하지 않는 경우, 임시로 RLS를 비활성화할 수 있습니다:

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
```

> **주의**: 프로덕션 환경에서는 적절한 RLS 정책을 설정해야 합니다!

## 다음 단계

1. ✅ 환경 변수 설정 완료
2. ✅ 데이터베이스 테이블 생성 완료
3. ⏳ AppContext에 Supabase 연동 추가
4. ⏳ CalendarScreen에 학원 일정 연동
5. ⏳ ChildScreen에 자녀 정보 연동
6. ⏳ 출석 정보 표시 추가

자세한 내용은 `INTEGRATION_GUIDE.md`를 참고하세요.
