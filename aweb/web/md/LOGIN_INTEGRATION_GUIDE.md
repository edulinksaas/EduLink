# 로그인 통합 가이드

## 개요
서비스 기능 완성 후 로그인을 통합하기 쉽도록 구조를 개선했습니다.

## 주요 변경 사항

### 1. AcademyContext 개선
- `academyId`, `academyName`, `academyCode` 편의 속성 추가
- `getAcademyId()` 함수 추가
- 로그인된 사용자 정보에서 학원 정보를 자동으로 가져오는 로직 유지
- 로그인 없이도 첫 번째 학원을 자동 선택하는 로직 유지

### 2. Classes.jsx 개선
- `AcademyContext`의 `academyId`를 사용하도록 변경
- `selectedAcademy` 상태 제거 (AcademyContext 사용)
- `academies` 상태 제거 (불필요)
- `loadAcademies` 함수 제거 (AcademyContext에서 처리)

## 로그인 통합 시 해야 할 작업

### 1단계: AuthProvider 활성화
```jsx
// src/App.jsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AcademyProvider>
          {/* ... */}
        </AcademyProvider>
      </AuthProvider>
    </Router>
  );
}
```

### 2단계: ProtectedRoute 활성화
```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### 3단계: 로그인/회원가입 라우트 활성화
```jsx
// src/App.jsx
import Login from './pages/Login';
import Register from './pages/Register';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  {/* 보호된 라우트들... */}
</Routes>
```

### 4단계: API 인터셉터 활성화
```jsx
// src/services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 현재 상태

### ✅ 완료된 작업
- AcademyContext 개선 (로그인 통합 준비 완료)
- Classes.jsx에서 AcademyContext 사용하도록 변경
- 학원 정보를 전역으로 관리하는 구조 완성

### ⏳ 남은 작업
- Settings.jsx에서 AcademyContext 사용하도록 변경
- Teachers.jsx에서 AcademyContext 사용하도록 변경
- Students.jsx에서 AcademyContext 사용하도록 변경
- 기타 페이지들에서 AcademyContext 사용하도록 변경

## 사용 방법

### 페이지에서 AcademyContext 사용하기
```jsx
import { useAcademy } from '../contexts/AcademyContext';

const MyPage = () => {
  const { academy, academyId, academyName, loading } = useAcademy();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!academyId) {
    return <div>학원 정보를 불러올 수 없습니다.</div>;
  }

  // academyId를 사용하여 API 호출
  const loadData = async () => {
    const response = await someService.getAll(academyId);
    // ...
  };

  return (
    <div>
      <h1>{academyName}</h1>
      {/* ... */}
    </div>
  );
};
```

## 주의사항

1. **로그인 전**: AcademyContext가 첫 번째 학원을 자동 선택합니다.
2. **로그인 후**: AcademyContext가 로그인된 사용자의 학원 정보를 사용합니다.
3. **학원 ID 확인**: `academyId`가 `null`이면 데이터를 로드하지 않도록 처리해야 합니다.

## 다음 단계

1. 나머지 페이지들도 AcademyContext를 사용하도록 수정
2. 모든 페이지 수정 완료 후 로그인 통합 테스트
3. 로그인 통합 완료 후 RLS 정책 재설정

