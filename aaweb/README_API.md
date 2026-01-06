# 프론트엔드-백엔드 연동 가이드

## 환경 설정

### 1. 환경 변수 파일 생성

`aaweb` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. 백엔드 포트 설정

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PORT=3001
```

또는 `backend/server.js`에서 기본 포트가 3001로 설정되어 있습니다.

## 실행 방법

### 백엔드 서버 실행
```bash
cd backend
npm install  # 처음 실행 시
npm run dev  # 또는 npm start
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

### 프론트엔드 서버 실행
```bash
cd aaweb
npm install  # 처음 실행 시
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/logout` - 로그아웃

### 학생 API
- `GET /api/students` - 전체 학생 목록
- `GET /api/students/:id` - 학생 상세 정보
- `POST /api/students` - 학생 등록
- `PUT /api/students/:id` - 학생 정보 수정
- `DELETE /api/students/:id` - 학생 삭제

### 선생님 API
- `GET /api/teachers` - 전체 선생님 목록
- `GET /api/teachers/:id` - 선생님 상세 정보
- `POST /api/teachers` - 선생님 등록
- `PUT /api/teachers/:id` - 선생님 정보 수정
- `DELETE /api/teachers/:id` - 선생님 삭제

### 수업 API
- `GET /api/classes` - 전체 수업 목록
- `GET /api/classes/:id` - 수업 상세 정보
- `POST /api/classes` - 수업 등록
- `PUT /api/classes/:id` - 수업 정보 수정
- `DELETE /api/classes/:id` - 수업 삭제

## 사용 방법

### API 클라이언트 사용

```typescript
import { authApi, studentApi, teacherApi, classApi } from './utils/supabase/api';

// 로그인
const response = await authApi.login('학원코드', '비밀번호');

// 학생 목록 가져오기
const students = await studentApi.getAll();

// 학생 등록
const newStudent = await studentApi.create({
  name: '홍길동',
  // ... 기타 필드
});
```

## 문제 해결

### CORS 오류
백엔드의 `middleware/security.js`에서 프론트엔드 URL이 허용되어 있는지 확인하세요.

### 포트 충돌
- 프론트엔드: 3000
- 백엔드: 3001

다른 포트를 사용하려면 `.env` 파일에서 설정을 변경하세요.

### 인증 토큰
로그인 후 토큰은 자동으로 `localStorage`에 저장되며, API 호출 시 자동으로 포함됩니다.

