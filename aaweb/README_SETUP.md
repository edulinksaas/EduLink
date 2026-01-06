# 에듀링크 웹 프론트엔드 설정 가이드

## 환경 설정

### 1. 환경 변수 파일 생성

`aaweb` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API URL (필수)
VITE_API_BASE_URL=http://localhost:3001/api

# Supabase 설정 (선택사항 - 프론트엔드에서 직접 Supabase를 사용하는 경우)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 의존성 설치

```bash
cd aaweb
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

프론트엔드 서버는 `http://localhost:5173`에서 실행됩니다.

## 백엔드 연동

### 백엔드 서버 실행

별도 터미널에서:

```bash
cd backend
npm install  # 처음 실행 시
npm run dev
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

## Supabase 연동

현재 프론트엔드는 백엔드 API를 통해 Supabase에 접근합니다. 

프론트엔드에서 직접 Supabase를 사용하려면:

1. `.env` 파일에 Supabase 설정 추가:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. `src/utils/supabase/client.ts`에서 Supabase 클라이언트 사용:
```typescript
import { supabase } from './utils/supabase/client';

// 사용 예시
const { data, error } = await supabase.from('students').select('*');
```

## 문제 해결

### TypeScript 에러
- `vite-env.d.ts` 파일이 생성되어 있는지 확인
- `tsconfig.json`에 `"include": ["src", "src/vite-env.d.ts"]` 포함 확인

### API 연결 오류
- 백엔드 서버가 실행 중인지 확인 (`http://localhost:3001/health`)
- `.env` 파일의 `VITE_API_BASE_URL`이 올바른지 확인
- 브라우저 콘솔에서 CORS 오류 확인

### Supabase 연결 오류
- 백엔드의 `.env` 파일에 Supabase 설정이 있는지 확인
- 백엔드 서버 로그에서 Supabase 연결 상태 확인

