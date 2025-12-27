# edulink-backend 저장소에 프론트엔드 코드 추가하기

## 목표
`edulink-backend` GitHub 저장소에 `saas` 폴더를 추가하여 프론트엔드 코드를 포함시킵니다.

## 최종 저장소 구조
```
edulink-backend/
├── config/          # 백엔드 (기존)
├── controllers/     # 백엔드 (기존)
├── middleware/      # 백엔드 (기존)
├── models/          # 백엔드 (기존)
├── routes/          # 백엔드 (기존)
├── utils/           # 백엔드 (기존)
├── server.js        # 백엔드 (기존)
├── package.json     # 백엔드 (기존)
└── saas/            # 프론트엔드 + 백엔드 (새로 추가)
    ├── src/         # 프론트엔드 React 코드
    ├── server/      # 백엔드 (중복될 수 있음)
    ├── package.json # 프론트엔드
    ├── vite.config.js
    └── ...
```

---

## 방법 1: VS Code 사용 (가장 쉬움)

### 1단계: edulink-backend 저장소 클론

1. **새 폴더 생성** (예: `C:\Users\sehwa\Desktop\edulink-backend`)
2. **VS Code에서 해당 폴더 열기**
3. **터미널 열기** (Ctrl + `)
4. **저장소 클론**:
   ```powershell
   git clone https://github.com/edulinksaas/edulink-backend.git .
   ```

### 2단계: saas 폴더 복사

1. **파일 탐색기 열기**
2. **로컬 saas 폴더 복사**:
   - `C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas` 폴더 전체 복사
3. **클론한 저장소에 붙여넣기**:
   - `C:\Users\sehwa\Desktop\edulink-backend\saas` 폴더로 붙여넣기

### 3단계: GitHub에 푸시

1. **VS Code 소스 제어 탭 클릭**
2. **변경사항 스테이징**:
   - `saas/` 폴더 옆의 "+" 버튼 클릭
3. **커밋**:
   - 메시지: "프론트엔드 코드 추가"
   - "✓ Commit" 클릭
4. **푸시**:
   - "..." 메뉴 > "Push" 클릭

---

## 방법 2: Git 명령어 사용

### 1단계: edulink-backend 저장소 클론

```powershell
# 임시 폴더로 이동
cd C:\Users\sehwa\Desktop

# 저장소 클론
git clone https://github.com/edulinksaas/edulink-backend.git edulink-backend-temp

# 클론한 폴더로 이동
cd edulink-backend-temp
```

### 2단계: saas 폴더 복사

```powershell
# 로컬 saas 폴더를 현재 위치로 복사
# PowerShell에서 복사 명령어
Copy-Item -Path "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas" -Destination "." -Recurse
```

또는 파일 탐색기에서 수동으로 복사:
- `C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas` → `C:\Users\sehwa\Desktop\edulink-backend-temp\saas`

### 3단계: Git에 추가 및 푸시

```powershell
# saas 폴더 추가
git add saas/

# 커밋
git commit -m "프론트엔드 코드 추가"

# GitHub에 푸시
git push origin main
```

---

## 방법 3: 기존 saas 폴더에서 직접 푸시 (가장 빠름)

현재 `saas` 폴더가 이미 Git 저장소라면:

### 1단계: 현재 원격 저장소 확인

```powershell
cd "C:\Users\sehwa\OneDrive\바탕 화면\에듀링크\saas"
git remote -v
```

### 2단계: 원격 저장소를 edulink-backend로 변경

```powershell
# 기존 원격 저장소 제거 (있다면)
git remote remove origin

# edulink-backend 저장소 추가
git remote add origin https://github.com/edulinksaas/edulink-backend.git
```

### 3단계: saas 폴더를 서브폴더로 푸시

하지만 이 방법은 저장소 루트에 직접 푸시되므로, `saas` 폴더를 서브폴더로 만들려면 다른 방법이 필요합니다.

**대신 방법 1 또는 방법 2를 사용하는 것을 권장합니다.**

---

## 방법 4: Git Subtree 사용 (고급)

기존 저장소에 서브폴더로 추가하는 방법:

```powershell
# edulink-backend 저장소 클론
cd C:\Users\sehwa\Desktop
git clone https://github.com/edulinksaas/edulink-backend.git
cd edulink-backend

# saas 폴더를 서브폴더로 추가
git subtree add --prefix=saas --squash -m "프론트엔드 코드 추가" https://github.com/edulinksaas/edulink-backend.git main
```

하지만 이 방법은 복잡하므로 **방법 1을 권장합니다.**

---

## 추천: 방법 1 (VS Code 사용)

가장 간단하고 안전한 방법입니다.

### 단계 요약:
1. ✅ 새 폴더에 `edulink-backend` 클론
2. ✅ `saas` 폴더를 클론한 저장소에 복사
3. ✅ VS Code에서 커밋 및 푸시

---

## 푸시 완료 후 Vercel 설정

푸시가 완료되면:

1. **Vercel로 돌아가기**
2. **Root Directory 설정**:
   - Root Directory: `saas` 입력
3. **환경 변수 설정**:
   - `VITE_API_BASE_URL`: `https://edulinksaas-backend-1.onrender.com/api`
4. **Deploy 클릭**

---

## 문제 해결

### "remote origin already exists" 에러
```powershell
git remote remove origin
git remote add origin https://github.com/edulinksaas/edulink-backend.git
```

### 인증 문제
- GitHub Personal Access Token 필요할 수 있음
- GitHub > Settings > Developer settings > Personal access tokens > Generate new token
- `repo` 권한 선택

### 충돌 문제
만약 `saas/server` 폴더가 기존 백엔드 코드와 충돌한다면:
- `saas/server` 폴더는 제외하고 푸시
- 또는 `.gitignore`에 추가
