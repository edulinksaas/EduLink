# SaaS Application

풀스택 SaaS 애플리케이션입니다.

## 프로젝트 구조

```
saas/
├── src/              # 프론트엔드 (React)
├── server/           # 백엔드 (Node.js + Express)
│   ├── config/       # 설정 파일
│   ├── controllers/  # 컨트롤러
│   ├── middleware/   # 미들웨어
│   ├── models/       # 데이터 모델
│   ├── routes/       # 라우트
│   └── utils/        # 유틸리티
└── package.json
```

## 시작하기

### 프론트엔드

#### 의존성 설치
```bash
npm install
```

#### 개발 서버 실행
```bash
npm run dev
```

#### 프로덕션 빌드
```bash
npm run build
```

### 백엔드

#### 의존성 설치
```bash
cd server
npm install
```

#### 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 설정값 입력
```

#### 개발 서버 실행
```bash
npm run dev
```

#### 프로덕션 서버 실행
```bash
npm start
```

## 기술 스택

### 프론트엔드
- React 18
- Vite
- JavaScript (JSX)

### 백엔드
- Node.js
- Express
- CORS
- Morgan (로깅)

## 로그인 기능

현재 로그인 기능은 비활성화되어 있습니다. 복원 가이드는 `AUTH_RESTORATION_GUIDE.md` 파일을 참고하세요.

## API 엔드포인트

### 인증 (Auth)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 학원 (Academy)
- `GET /api/academies` - 학원 목록 조회
- `GET /api/academies/:id` - 학원 상세 조회
- `POST /api/academies` - 학원 생성
- `PUT /api/academies/:id` - 학원 수정
- `DELETE /api/academies/:id` - 학원 삭제

### 과목 (Subject)
- `GET /api/subjects?academy_id=:id` - 과목 목록 조회
- `GET /api/subjects/:id` - 과목 상세 조회
- `POST /api/subjects` - 과목 생성
- `PUT /api/subjects/:id` - 과목 수정
- `DELETE /api/subjects/:id` - 과목 삭제

### 강의실 (Classroom)
- `GET /api/classrooms?academy_id=:id` - 강의실 목록 조회
- `GET /api/classrooms/:id` - 강의실 상세 조회
- `POST /api/classrooms` - 강의실 생성
- `PUT /api/classrooms/:id` - 강의실 수정
- `DELETE /api/classrooms/:id` - 강의실 삭제

### 수업 (Class)
- `GET /api/classes?academy_id=:id` - 수업 목록 조회
- `GET /api/classes/:id` - 수업 상세 조회
- `POST /api/classes` - 수업 생성
- `PUT /api/classes/:id` - 수업 수정
- `DELETE /api/classes/:id` - 수업 삭제

### 선생님 (Teacher)
- `GET /api/teachers?academy_id=:id` - 선생님 목록 조회
- `GET /api/teachers/:id` - 선생님 상세 조회
- `POST /api/teachers` - 선생님 생성
- `PUT /api/teachers/:id` - 선생님 수정
- `DELETE /api/teachers/:id` - 선생님 삭제

### 학생 (Student)
- `GET /api/students?academy_id=:id` - 학생 목록 조회
- `GET /api/students/:id` - 학생 상세 조회
- `POST /api/students` - 학생 생성
- `PUT /api/students/:id` - 학생 수정
- `DELETE /api/students/:id` - 학생 삭제

### 수강 등록 (Enrollment)
- `GET /api/enrollments?class_id=:id&student_id=:id` - 수강 등록 목록 조회
- `GET /api/enrollments/:id` - 수강 등록 상세 조회
- `POST /api/enrollments` - 수강 등록 생성
- `PUT /api/enrollments/:id` - 수강 등록 수정
- `DELETE /api/enrollments/:id` - 수강 등록 삭제

## 데이터베이스 스키마

### Academy (학원)
- `id` (uuid, PK)
- `name` (text) - 학원 이름
- `logo_url` (text) - 학원 로고
- `address` (text) - 주소

### Subject (과목/종목)
- `id` (uuid, PK)
- `academy_id` (uuid, FK)
- `name` (text) - 과목명
- `color` (text) - 색상 HEX

### Classroom (강의실)
- `id` (uuid, PK)
- `academy_id` (uuid, FK)
- `name` (text) - 강의실 명
- `capacity` (int) - 수용 인원

### Class (수업)
- `id` (uuid, PK)
- `academy_id` (uuid, FK)
- `subject_id` (uuid, FK)
- `teacher_id` (uuid, FK)
- `classroom_id` (uuid, FK)
- `level` (text) - 초급/중급 등
- `name` (text) - 강의 명
- `start_time` (time) - 시작 시간
- `end_time` (time) - 종료 시간
- `max_students` (int) - 정원

### Teacher (선생님)
- `id` (uuid, PK)
- `academy_id` (uuid, FK)
- `name` (text) - 강사 명
- `subject_id` (uuid, FK)
- `work_days` (text) - 근무 요일

### Student (학생)
- `id` (uuid, PK)
- `academy_id` (uuid, FK)
- `name` (text) - 학생 명
- `parent_contact` (text) - 학부모 연락처
- `note` (text) - 특이 사항

### Enrollment (수강 등록)
- `id` (uuid, PK)
- `class_id` (uuid, FK)
- `student_id` (uuid, FK)
- `fee` (int) - 수강료
- `receipt_url` (text) - 영수증
- `status` (text) - 결제/미결제
- `category` (text) - 신규/재등록

