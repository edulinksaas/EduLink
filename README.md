# Edulink

교육 기관 관리를 위한 통합 플랫폼입니다.

## 프로젝트 구조

```
Edulink/
├── edulink-backend/    # 백엔드 서버 (Express)
├── saas/               # SaaS 프론트엔드 (React + Vite)
│   ├── server.js       # 백엔드 서버
│   └── saas/           # 프론트엔드 소스
└── parentsapp/         # 학부모 앱 (Expo)
```

## 시작하기

각 디렉토리의 README.md를 참고하세요.

## CI/CD

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 제공합니다.

### GitHub Actions 워크플로우

- **CI** (`.github/workflows/ci.yml`): 코드 품질 검사 및 테스트
- **Backend Deploy** (`.github/workflows/backend-deploy.yml`): 백엔드 배포
- **Frontend Deploy** (`.github/workflows/frontend-deploy.yml`): 프론트엔드 배포

### GitHub Secrets 설정

배포를 위해 다음 GitHub Secrets를 설정해야 합니다:

#### 백엔드 배포 (Railway)
- `RAILWAY_TOKEN`: Railway API 토큰

#### 백엔드 배포 (Render)
- `RENDER_SERVICE_ID`: Render 서비스 ID
- `RENDER_API_KEY`: Render API 키

#### 프론트엔드 배포 (Vercel)
- `VERCEL_TOKEN`: Vercel API 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID
- `VITE_API_URL`: API 서버 URL (빌드 시 사용)

### Secrets 설정 방법

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭
4. 위의 각 Secret을 추가

## 배포

### 자동 배포

`main` 또는 `master` 브랜치에 푸시하면 자동으로 배포가 시작됩니다.

### 수동 배포

GitHub Actions 탭에서 워크플로우를 선택하고 "Run workflow"를 클릭하여 수동으로 배포할 수 있습니다.

### 배포 플랫폼

- **백엔드**: Railway 또는 Render
- **프론트엔드**: Vercel

배포 관련 상세 설정은 각 서브 디렉토리의 설정 파일을 참고하세요:
- `edulink-backend/render.yaml`
- `saas/render.yaml`
- `saas/vercel.json`

## 환경 변수

각 서비스별로 필요한 환경 변수는 다음 파일들을 참고하세요:
- `edulink-backend/MD/DEPLOYMENT_GUIDE.md`
- `saas/md/DEPLOYMENT_GUIDE.md`

## 라이선스

ISC
