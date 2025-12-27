# 로그인 기능 복원 가이드

현재 로그인 기능은 비활성화되어 있습니다. 나중에 서비스를 구현할 때 다음 단계로 복원할 수 있습니다.

## 현재 상태

- 모든 API 엔드포인트는 인증 없이 접근 가능합니다
- `/auth` 라우트는 라우터에서 제거되었습니다
- 각 라우트에서 `authenticate` 미들웨어가 제거되었습니다
- 프론트엔드에서 토큰 관련 인터셉터가 제거되었습니다

## 보관된 파일들

로그인 관련 코드는 다음 파일들에 보관되어 있습니다:

### 백엔드
- `server/routes/auth.routes.js` - 인증 라우트 (회원가입, 로그인, 로그아웃)
- `server/controllers/auth.controller.js` - 인증 컨트롤러
- `server/middleware/auth.middleware.js` - 인증 미들웨어 (JWT 토큰 검증)

### 프론트엔드
- `src/services/authService.js` - 인증 서비스 (API 호출)

## 복원 단계

### 1. 백엔드 복원

#### 1.1 라우트 등록
`server/routes/index.js` 파일을 열고 다음 코드를 추가:

```javascript
import authRoutes from './auth.routes.js';

// 라우터에 추가
router.use('/auth', authRoutes);
```

#### 1.2 각 라우트에 인증 미들웨어 추가
각 라우트 파일(`academy.routes.js`, `subject.routes.js` 등)에 다음을 추가:

```javascript
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// 모든 라우트에 인증 필요
router.use(authenticate);
```

#### 1.3 인증 미들웨어 구현
`server/middleware/auth.middleware.js`에서 실제 JWT 토큰 검증 로직을 구현:

```javascript
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 1.4 인증 컨트롤러 구현
`server/controllers/auth.controller.js`에서 실제 로그인/회원가입 로직을 구현:

- 데이터베이스에서 사용자 조회
- 비밀번호 해싱 및 검증 (bcrypt 사용 권장)
- JWT 토큰 생성 및 반환

### 2. 프론트엔드 복원

#### 2.1 API 인터셉터에 토큰 추가
`src/services/api.js` 파일에 Request 인터셉터 추가:

```javascript
// Request interceptor - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

#### 2.2 Response 인터셉터에 401 처리 추가
`src/services/api.js` 파일에 Response 인터셉터 추가:

```javascript
// Response interceptor - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 2.3 로그인 페이지 생성
로그인 페이지 컴포넌트를 생성하고 `authService`를 사용하여 로그인 기능 구현

### 3. 필요한 패키지 설치

백엔드에 JWT 관련 패키지 추가:

```bash
cd server
npm install jsonwebtoken bcrypt
```

## 환경 변수 설정

`.env` 파일에 다음 변수 추가:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

## 참고사항

- JWT 토큰은 안전하게 저장하고 관리해야 합니다
- 비밀번호는 절대 평문으로 저장하지 말고 bcrypt로 해싱하세요
- 토큰 만료 시간을 적절히 설정하세요
- HTTPS를 사용하여 토큰 전송을 보호하세요

