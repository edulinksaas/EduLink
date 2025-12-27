# GitHub에 코드 푸시하기

## 현재 상황
- GitHub 저장소: `edulinksaas/edulinksaas` (비어있음)
- 로컬 코드: `saas` 폴더에 있음

## 해결 방법

### 방법 1: VS Code 사용 (가장 쉬움)

1. **VS Code에서 `saas` 폴더 열기**
   - `C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas` 폴더 열기

2. **소스 제어 탭 클릭** (왼쪽 사이드바)

3. **"Initialize Repository" 클릭** (처음이면)
   - 또는 이미 git 저장소가 있다면 스킵

4. **변경사항 스테이징**
   - "+" 버튼 클릭하여 모든 파일 추가

5. **커밋**
   - 메시지: "배포 준비 완료"
   - "✓ Commit" 클릭

6. **원격 저장소 추가**
   - "..." 메뉴 > "Remote" > "Add Remote"
   - Name: `origin`
   - URL: `https://github.com/edulinksaas/edulinksaas.git`

7. **푸시**
   - "..." 메뉴 > "Push"
   - 또는 "Publish Branch" 클릭

### 방법 2: 터미널 사용

```powershell
# saas 폴더로 이동
cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas"

# Git 저장소 초기화 (아직 안 했다면)
git init

# 원격 저장소 추가
git remote add origin https://github.com/edulinksaas/edulinksaas.git

# 모든 파일 추가
git add .

# 커밋
git commit -m "배포 준비 완료"

# GitHub에 푸시
git branch -M main
git push -u origin main
```

## 문제 해결

### "remote origin already exists" 에러
```powershell
git remote remove origin
git remote add origin https://github.com/edulinksaas/edulinksaas.git
```

### 인증 문제
- GitHub Personal Access Token 필요할 수 있음
- GitHub > Settings > Developer settings > Personal access tokens > Generate new token
- `repo` 권한 선택


