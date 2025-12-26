# Git Lock 파일 문제 해결

## 문제
`index.lock` 파일이 Git 작업을 막고 있습니다.

## 해결 방법

### 1. VS Code 완전 종료
- 모든 VS Code 창 닫기
- 작업 관리자에서 Code 프로세스 확인 및 종료

### 2. 다른 Git 프로세스 확인
- Git Bash, 명령 프롬프트 등에서 실행 중인 Git 명령이 있는지 확인
- 모두 종료

### 3. Lock 파일 찾기 및 삭제

다음 경로들을 확인하세요:

#### 경로 1: 사용자 홈 디렉토리
```
C:\Users\sehwa\.git\index.lock
```

#### 경로 2: 프로젝트 루트
```
C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\.git\index.lock
```

#### 경로 3: saas 폴더
```
C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas\.git\index.lock
```

### 4. 파일 탐색기에서 삭제
1. 파일 탐색기 열기
2. 위 경로 중 하나로 이동
3. `.git` 폴더 열기 (숨김 파일 표시 필요)
4. `index.lock` 파일 삭제

### 5. VS Code 재시작 후 다시 시도

## 대안: 새로 시작하기

만약 계속 문제가 발생하면:

1. **새 Git 저장소 초기화**
   ```cmd
   cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas"
   git init
   git add .
   git commit -m "배포 준비 완료"
   git remote add origin https://github.com/edulinksaas/edulinksaas.git
   git push -u origin main
   ```

2. **또는 GitHub Desktop 사용**
   - GitHub Desktop 앱 설치
   - 저장소 추가
   - 커밋 및 푸시


