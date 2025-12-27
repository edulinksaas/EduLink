# GitHub 저장소 구조 수정하기

## 문제
GitHub 저장소에 `OneDrive/바탕 화면` 폴더가 포함되어 있어서 Railway에서 올바른 경로를 찾지 못합니다.

## 해결 방법

### 방법 1: saas 폴더만 새로 푸시 (추천)

1. **GitHub에서 새 저장소 생성**
   - https://github.com/new 접속
   - Repository name: `edulink-backend` (또는 원하는 이름)
   - Public 선택
   - "Create repository" 클릭

2. **로컬에서 saas 폴더만 푸시**
   ```cmd
   cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas"
   git init
   git add .
   git commit -m "배포 준비 완료"
   git remote add origin https://github.com/edulinksaas/edulink-backend.git
   git branch -M main
   git push -u origin main
   ```

3. **Railway에서 새 저장소 사용**
   - Root Directory: `server` (saas 폴더가 루트이므로)

### 방법 2: 기존 저장소 정리

1. **GitHub 저장소에서 불필요한 폴더 삭제**
   - GitHub 웹에서 `OneDrive/바탕 화면` 폴더 삭제
   - `formirae1120` 폴더도 삭제 (필요시)

2. **로컬에서 saas 폴더만 푸시**
   ```cmd
   cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas"
   git init
   git remote add origin https://github.com/edulinksaas/edulinksaas.git
   git add .
   git commit -m "저장소 구조 수정"
   git branch -M main
   git push -u origin main --force
   ```

### 방법 3: Railway에서 경로 조정 (빠른 해결)

기존 저장소를 그대로 사용하고 Railway에서만 경로 조정:

1. **Railway 서비스 설정**
   - Root Directory: `OneDrive/바탕 화면/에듀링크/saas/server`
   - 또는: `OneDrive/바탕 화면/에듀링크/saas/server` (전체 경로)

## 추천 방법

**방법 1**을 추천합니다:
- 깔끔한 저장소 구조
- Railway 설정이 간단함
- Root Directory: `server`만 입력하면 됨


