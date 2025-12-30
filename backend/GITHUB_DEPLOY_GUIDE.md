# GitHub 배포 가이드

## 현재 상태

- 원격 저장소: `https://github.com/edulinksaas/edulinksaas-backend-.git`
- 브랜치: `main`

## 배포 준비 단계

### 1. Git 상태 확인

```powershell
git status
```

### 2. 변경사항 스테이징

프로젝트 파일만 추가하려면:

```powershell
# 현재 디렉토리의 변경사항만 추가
git add .

# 또는 특정 디렉토리만 추가
git add saas/
git add config/
git add controllers/
git add middleware/
git add models/
git add routes/
git add utils/
git add server.js
git add package.json
git add .gitignore
git add README.md
git add render.yaml
git add vercel.json
```

### 3. 커밋

```powershell
git commit -m "배포 준비: 프로젝트 파일 업데이트"
```

### 4. GitHub에 푸시

```powershell
git push origin main
```

## 주의사항

⚠️ **현재 Git 저장소가 홈 디렉토리에서 초기화되어 있습니다.**

이 경우 다음 중 하나를 선택하세요:

### 옵션 1: 현재 저장소 사용 (권장하지 않음)
- 홈 디렉토리 전체가 Git 저장소로 관리됨
- 개인 파일들이 추적될 수 있음

### 옵션 2: 새 Git 저장소 초기화 (권장)

프로젝트 디렉토리에서만 Git을 관리하려면:

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\sehwa\OneDrive\바탕 화면\Edulink\saas"

# 기존 Git 제거 (선택사항)
Remove-Item -Recurse -Force .git

# 새 Git 저장소 초기화
git init

# 원격 저장소 추가
git remote add origin https://github.com/edulinksaas/edulinksaas-backend-.git

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 배포 준비 완료"

# 브랜치 이름 설정
git branch -M main

# 푸시
git push -u origin main
```

## GitHub 저장소 설정

### 1. 저장소 접근
https://github.com/edulinksaas/edulinksaas-backend- 에 접속

### 2. Settings 확인
- 저장소가 Private인지 Public인지 확인
- 필요한 경우 Collaborators 추가

### 3. Secrets 설정 (배포 시 필요)
Settings > Secrets and variables > Actions에서:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- 기타 환경 변수들

## 배포 플랫폼 연결

### Vercel (프론트엔드)
1. https://vercel.com 접속
2. GitHub 계정 연결
3. 저장소 선택: `edulinksaas-backend-`
4. Root Directory: `saas`
5. Build Command: `npm run build`
6. Output Directory: `dist`

### Render (백엔드)
1. https://render.com 접속
2. GitHub 계정 연결
3. New Web Service 선택
4. 저장소 선택: `edulinksaas-backend-`
5. Root Directory: `.` (루트)
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Environment Variables 설정

## 문제 해결

### "remote origin already exists" 에러
```powershell
git remote remove origin
git remote add origin https://github.com/edulinksaas/edulinksaas-backend-.git
```

### 인증 문제
GitHub Personal Access Token 필요:
1. GitHub > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. `repo` 권한 선택
4. 토큰 복사 후 사용

### 대용량 파일 문제
`.gitignore`에 다음 추가:
```
*.zip
*.pdf
*.hwp
*.hwpx
```

## 다음 단계

1. ✅ Git 상태 정리
2. ✅ GitHub에 푸시
3. ✅ Vercel/Render 연결
4. ✅ 환경 변수 설정
5. ✅ 배포 확인





