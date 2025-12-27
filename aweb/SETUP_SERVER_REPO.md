# server 폴더를 별도 저장소로 만들기

## 🚨 현재 문제
- `server` 폴더가 상위 폴더의 Git 저장소에 포함되어 있음
- `server` 폴더만 별도 저장소로 만들어야 함

## ✅ 해결 방법

### 터미널에서 실행할 명령어들

현재 `server` 폴더에 있으므로 다음 명령어들을 순서대로 실행하세요:

#### 1단계: 현재 위치 확인
```powershell
# 현재 위치 확인 (이미 server 폴더에 있음)
pwd
# 또는
Get-Location
```

#### 2단계: server 폴더의 파일들만 확인
```powershell
# server 폴더의 파일들만 보기
ls
# 또는
Get-ChildItem
```

#### 3단계: Git 초기화 (상위 Git 영향 제거)
```powershell
# server 폴더에서 새 Git 저장소 초기화
git init
```

#### 4단계: server 폴더의 파일들만 추가
```powershell
# server 폴더의 모든 파일 추가
git add .

# .env 파일은 제외하고 싶다면
# git add . --ignore-errors
```

#### 5단계: 커밋
```powershell
git commit -m "백엔드 서버 초기화"
```

#### 6단계: 원격 저장소 추가
```powershell
# GitHub에서 생성한 새 저장소 URL 사용
git remote add origin https://github.com/edulinksaas/새저장소명.git
```

#### 7단계: 브랜치 이름 변경 및 푸시
```powershell
# 브랜치를 main으로 변경
git branch -M main

# 푸시
git push -u origin main
```

## 📋 전체 명령어 (한번에)

터미널에서 순서대로 실행:

```powershell
# 1. 현재 위치 확인 (server 폴더에 있어야 함)
pwd

# 2. Git 초기화
git init

# 3. 파일 추가
git add .

# 4. 커밋
git commit -m "백엔드 서버 초기화"

# 5. 원격 저장소 추가 (GitHub에서 생성한 새 저장소 URL)
git remote add origin https://github.com/edulinksaas/새저장소명.git

# 6. 브랜치 이름 변경
git branch -M main

# 7. 푸시
git push -u origin main
```

## ⚠️ 주의사항

- **새 저장소 URL**: `https://github.com/edulinksaas/새저장소명.git`
  - GitHub에서 생성한 새 저장소의 URL로 변경하세요
  - 예: `https://github.com/edulinksaas/edulink-backend.git`

- **.env 파일**: 
  - `.env` 파일은 보안상 GitHub에 푸시하지 않는 것이 좋습니다
  - `.gitignore`에 이미 포함되어 있을 수 있음

## ✅ 확인

푸시 후 GitHub에서 확인:
- 저장소 루트에 `package.json` 파일이 보임
- `server.js` 파일이 보임
- 한글 경로 없이 깔끔한 구조
