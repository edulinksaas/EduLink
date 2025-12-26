# GitHub 저장소 생성 및 푸시 가이드

## 1단계: GitHub에서 새 저장소 생성

1. **GitHub 접속**: https://github.com
2. **로그인** (계정이 없으면 회원가입)
3. **우측 상단 "+" 버튼 클릭** > "New repository" 선택
4. **저장소 정보 입력**:
   - Repository name: `edulink` (또는 원하는 이름)
   - Description: `에듀링크 SaaS 애플리케이션` (선택사항)
   - Public 또는 Private 선택
   - ⚠️ **"Initialize this repository with a README" 체크하지 마세요!**
   - "Create repository" 클릭

5. **저장소 URL 복사**
   - 생성된 페이지에서 HTTPS URL 복사
   - 예: `https://github.com/your-username/edulink.git`

## 2단계: 로컬 저장소를 GitHub에 푸시

### 방법 1: 명령 프롬프트 또는 PowerShell 사용

1. **프로젝트 폴더로 이동**
   ```powershell
   cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크"
   ```

2. **현재 변경사항 확인**
   ```powershell
   git status
   ```

3. **변경사항 커밋** (필요한 경우)
   ```powershell
   git add .
   git commit -m "배포 준비 완료"
   ```

4. **GitHub 원격 저장소 추가**
   ```powershell
   git remote add origin https://github.com/your-username/edulink.git
   ```
   (위에서 복사한 URL 사용)

5. **GitHub에 푸시**
   ```powershell
   git branch -M main
   git push -u origin main
   ```
   또는 master 브랜치 사용 시:
   ```powershell
   git push -u origin master
   ```

### 방법 2: VS Code 사용 (더 쉬움)

1. **VS Code에서 프로젝트 열기**
   - `C:\Users\sehwa\OneDrive\바탕 화면\에듀링크` 폴더 열기

2. **소스 제어 탭 클릭** (왼쪽 사이드바)

3. **변경사항 스테이징**
   - "+" 버튼 클릭하여 모든 변경사항 스테이징

4. **커밋**
   - 메시지 입력: "배포 준비 완료"
   - "✓ Commit" 버튼 클릭

5. **원격 저장소 추가**
   - "..." 메뉴 클릭
   - "Remote" > "Add Remote" 선택
   - Name: `origin`
   - URL: `https://github.com/your-username/edulink.git`
   - Enter

6. **푸시**
   - "..." 메뉴 클릭
   - "Push" 선택
   - 또는 "Publish Branch" 클릭

## 3단계: Railway에서 저장소 연결

1. **Railway로 돌아가기**
   - https://railway.app 접속

2. **"Configure GitHub App" 클릭** (아직 안 했다면)
   - GitHub 권한 승인
   - 저장소 접근 권한 허용

3. **저장소 검색**
   - 검색창에 `edulink` 입력
   - 저장소 선택

4. **배포 시작!**

## 문제 해결

### "remote origin already exists" 에러
```powershell
git remote remove origin
git remote add origin https://github.com/your-username/edulink.git
```

### 인증 문제
- GitHub Personal Access Token 필요할 수 있음
- Settings > Developer settings > Personal access tokens > Generate new token
- `repo` 권한 선택

### 브랜치 이름 문제
```powershell
# 현재 브랜치 확인
git branch

# main으로 변경
git branch -M main

# 또는 master 사용
git push -u origin master
```
