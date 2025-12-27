# 학부모 전용 앱

React Native (Expo)로 개발된 학부모 전용 모바일 앱입니다.

## 프로젝트 구조

```
학부모 전용 앱/
├── app/              # React Native 앱 (Expo)
│   ├── lib/          # 유틸리티 및 설정 파일
│   │   └── supabase.js  # Supabase 클라이언트 설정
│   ├── App.js        # 메인 앱 컴포넌트
│   └── package.json
│
└── server/           # Node.js 서버
    ├── index.js      # 서버 메인 파일
    └── package.json
```

## 시작하기

### 1. 환경 변수 설정

#### 앱 (React Native)
`app` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 서버 (Node.js)
`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 앱 실행

```bash
cd app
npm install
npm start
```

그 다음:
- iOS 시뮬레이터: `i` 키 누르기
- Android 에뮬레이터: `a` 키 누르기
- 웹 브라우저: `w` 키 누르기

### 3. 서버 실행

```bash
cd server
npm install
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## Supabase 설정

자세한 설정 가이드는 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참고하세요.

### 빠른 시작

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon/Public Key (앱에서 사용)
   - Service Role Key (서버에서 사용)
3. `supabase-schema.sql` 파일을 Supabase SQL Editor에서 실행하여 테이블 생성
4. 환경 변수 설정:
   - `app/.env` 파일에 `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 추가
   - `server/.env` 파일에 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` 추가

## 기술 스택

### 앱
- React Native (Expo)
- Supabase Client

### 서버
- Node.js
- Express
- Supabase JS

## 개발 가이드

### Supabase 클라이언트 사용

앱에서 Supabase를 사용하려면:

```javascript
import { supabase } from './lib/supabase';
import { fetchEvents, createEvent, deleteEvent } from './lib/supabaseEvents';

// 예제: 일정 조회
const events = await fetchEvents(startDate, endDate);

// 예제: 일정 생성
const newEvent = await createEvent({
  title: '회의',
  event_date: '2025-01-15',
  start_time: '10:00',
  end_time: '11:00',
  location: '회의실',
  memo: '중요한 회의'
});

// 예제: 일정 삭제
await deleteEvent(eventId);
```

### 서버에서 Supabase 사용

서버에서 Supabase를 사용하려면:

```javascript
const { supabase } = require('./lib/supabase');

// 예제: 데이터 조회
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

## 웹 프로그램 연동

이 앱은 바탕화면의 `saas` 웹 프로그램과 연동됩니다. 자세한 내용은 다음 문서를 참고하세요:

- **[QUICK_START.md](./QUICK_START.md)** - 빠른 시작 가이드
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - 상세 연동 가이드

### 연동 요약

1. 웹 프로그램과 모바일 앱이 **같은 Supabase 프로젝트**를 사용
2. 모바일 앱에서 웹 프로그램의 학생, 수업, 일정 데이터 조회 가능
3. 학부모 연락처로 자녀 정보 자동 조회

## 라이선스

ISC

