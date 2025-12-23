# GitHub 배포 가이드

이 문서는 GitHub Actions를 사용한 자동 배포 설정 방법을 설명합니다.

## 사전 준비

### 1. GitHub 저장소 설정

1. GitHub에 저장소 생성 (이미 완료된 경우 생략)
2. 로컬 저장소를 GitHub에 푸시

```bash
git remote add origin https://github.com/your-username/edulink.git
git branch -M main
git push -u origin main
```

### 2. GitHub Secrets 설정

배포를 위해 다음 Secrets를 설정해야 합니다:

#### Settings > Secrets and variables > Actions 이동

**백엔드 배포용 (Railway)**
- `RAILWAY_TOKEN`: Railway API 토큰
  - Railway 대시보드 > Account Settings > Tokens에서 생성

**백엔드 배포용 (Render)**
- `RENDER_SERVICE_ID`: Render 서비스 ID
- `RENDER_API_KEY`: Render API 키
  - Render 대시보드 > Account Settings > API Keys에서 생성

**프론트엔드 배포용 (Vercel)**
- `VERCEL_TOKEN`: Vercel API 토큰
  - Vercel 대시보드 > Settings > Tokens에서 생성
- `VERCEL_ORG_ID`: Vercel 조직 ID
  - Vercel 대시보드 URL에서 확인 가능
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID
  - Vercel 프로젝트 설정에서 확인 가능
- `VITE_API_URL`: API 서버 URL (빌드 시 환경 변수)

## 워크플로우 설명

### CI 워크플로우 (`.github/workflows/ci.yml`)

모든 푸시와 Pull Request에서 자동 실행:
- 의존성 설치
- 린터 실행 (있는 경우)
- 테스트 실행 (있는 경우)
- 빌드 확인

### 백엔드 배포 워크플로우 (`.github/workflows/backend-deploy.yml`)

`main` 또는 `master` 브랜치에 푸시 시 실행:
- 백엔드 코드 변경 감지
- 의존성 설치
- 테스트 실행
- 배포 (Railway 또는 Render)

**트리거 조건:**
- `edulink-backend/**` 경로 변경
- `saas/server.js` 또는 `saas/server/**` 경로 변경

### 프론트엔드 배포 워크플로우 (`.github/workflows/frontend-deploy.yml`)

`main` 또는 `master` 브랜치에 푸시 시 실행:
- 프론트엔드 코드 변경 감지
- 의존성 설치
- 빌드 실행
- Vercel에 배포

**트리거 조건:**
- `saas/saas/**` 경로 변경
- `saas/package.json` 또는 `saas/vite.config.js` 변경

## 배포 프로세스

### 자동 배포

1. 코드 변경 후 커밋 및 푸시
   ```bash
   git add .
   git commit -m "변경 사항 설명"
   git push origin main
   ```

2. GitHub Actions 자동 실행
   - 변경된 경로에 따라 적절한 워크플로우 실행
   - Actions 탭에서 진행 상황 확인

3. 배포 완료 확인
   - 워크플로우 실행 완료 확인
   - 배포된 서비스 동작 확인

### 수동 배포

1. GitHub 저장소 > Actions 탭 이동
2. 배포할 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 브랜치 선택 후 "Run workflow" 실행

## 문제 해결

### 워크플로우가 실행되지 않는 경우

1. `.github/workflows/` 디렉토리가 올바른 위치에 있는지 확인
2. YAML 파일 문법 오류 확인
3. 브랜치 이름 확인 (`main` 또는 `master`)

### Secrets 관련 오류

1. GitHub Secrets가 올바르게 설정되었는지 확인
2. Secret 이름이 워크플로우에서 사용하는 이름과 일치하는지 확인
3. Secret 값이 유효한지 확인 (토큰 만료 등)

### 빌드 실패

1. 로컬에서 빌드가 성공하는지 확인
2. Node.js 버전이 맞는지 확인 (워크플로우에서 `node-version: '18'` 사용)
3. 의존성 설치 오류 확인

### 배포 실패

1. 배포 플랫폼(Railway/Render/Vercel) 연결 확인
2. API 토큰 유효성 확인
3. 배포 플랫폼 대시보드에서 로그 확인

## 워크플로우 커스터마이징

필요에 따라 워크플로우 파일을 수정할 수 있습니다:

- **Node.js 버전 변경**: `node-version` 값 수정
- **배포 조건 변경**: `on.push.paths` 수정
- **추가 단계 추가**: `steps` 섹션에 새 단계 추가

## 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [Vercel 문서](https://vercel.com/docs)

