# 에듀링크 SaaS 애플리케이션

학원 관리 시스템을 위한 풀스택 SaaS 애플리케이션입니다.

## 프로젝트 구조

```
saas/
├── saas/              # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── config/            # 설정 파일
├── controllers/       # 백엔드 컨트롤러
├── middleware/        # 미들웨어
├── models/           # 데이터 모델
├── routes/           # API 라우트
├── utils/            # 유틸리티
├── server.js         # 백엔드 서버 진입점
└── package.json      # 백엔드 패키지
```

## 기술 스택

### 프론트엔드
- React 18
- Vite
- Tailwind CSS
- Supabase (인증 및 데이터베이스)

### 백엔드
- Node.js
- Express
- Supabase (PostgreSQL)
- JWT 인증
- Nodemailer (이메일 발송)

## 시작하기

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server
PORT=3000
NODE_ENV=development

# Email (선택사항)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 백엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

### 프론트엔드 실행

```bash
# saas 디렉토리로 이동
cd saas

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 주요 기능

- ✅ 학원 관리
- ✅ 학생 관리
- ✅ 선생님 관리
- ✅ 수업 관리
- ✅ 수강 등록
- ✅ 출석 관리
- ✅ 일정 관리
- ✅ 수강료 관리
- ✅ 이메일 인증
- ✅ 비밀번호 재설정

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/verify-email` - 이메일 인증
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 학원 관리
- `GET /api/academies` - 학원 목록
- `GET /api/academies/:id` - 학원 상세
- `POST /api/academies` - 학원 생성
- `PUT /api/academies/:id` - 학원 수정
- `DELETE /api/academies/:id` - 학원 삭제

### 학생 관리
- `GET /api/students` - 학생 목록
- `GET /api/students/:id` - 학생 상세
- `POST /api/students` - 학생 생성
- `PUT /api/students/:id` - 학생 수정
- `DELETE /api/students/:id` - 학생 삭제

### 수업 관리
- `GET /api/classes` - 수업 목록
- `GET /api/classes/:id` - 수업 상세
- `POST /api/classes` - 수업 생성
- `PUT /api/classes/:id` - 수업 수정
- `DELETE /api/classes/:id` - 수업 삭제

더 자세한 API 문서는 각 라우트 파일을 참고하세요.

## 배포

### Vercel 배포

프론트엔드는 Vercel을 통해 배포할 수 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Render 배포

백엔드는 Render를 통해 배포할 수 있습니다. `render.yaml` 파일을 참고하세요.

## 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.





