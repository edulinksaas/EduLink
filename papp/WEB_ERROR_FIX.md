# Expo 웹 개발 서버 에러 해결 가이드

## 에러 메시지
```
Refused to execute script from 'http://localhost:8081/index.bundle...' 
because its MIME type ('application/json') is not executable
Failed to load resource: the server responded with a status of 500
```

## 해결 방법

### 방법 1: 캐시 삭제 후 재시작 (가장 효과적)

```bash
cd app

# Expo 캐시 삭제
npx expo start -c

# 또는
npx expo start --clear
```

### 방법 2: 완전히 정리 후 재시작

```bash
cd app

# 1. 개발 서버 종료 (Ctrl+C)

# 2. 캐시 삭제
npx expo start -c

# 3. 여전히 안 되면 node_modules 재설치
rm -rf node_modules
npm install

# 4. 다시 시작
npx expo start -c
```

### 방법 3: 포트 변경

다른 프로세스가 8081 포트를 사용 중일 수 있습니다:

```bash
cd app

# 다른 포트로 시작
npx expo start --port 8082

# 웹 브라우저에서 http://localhost:8082 접속
```

### 방법 4: 웹 전용으로 시작

```bash
cd app

# 웹 전용으로 시작
npx expo start --web
```

## Windows에서 실행하는 경우

### PowerShell에서:

```powershell
cd app

# 캐시 삭제
npx expo start -c

# 또는 포트 변경
npx expo start --port 8082
```

### CMD에서:

```cmd
cd app

# 캐시 삭제
npx expo start -c
```

## 추가 해결 방법

### 1. 브라우저 캐시 삭제

1. 브라우저에서 `Ctrl + Shift + Delete` (또는 `Cmd + Shift + Delete`)
2. 캐시된 이미지 및 파일 삭제
3. 페이지 새로고침 (`Ctrl + F5`)

### 2. 다른 브라우저로 시도

- Chrome, Firefox, Edge 등 다른 브라우저로 시도

### 3. 포트 확인

8081 포트가 사용 중인지 확인:

**Windows PowerShell:**
```powershell
netstat -ano | findstr :8081
```

**Windows CMD:**
```cmd
netstat -ano | findstr :8081
```

포트가 사용 중이면 해당 프로세스를 종료하거나 다른 포트 사용

### 4. Metro 번들러 재시작

```bash
cd app

# Metro 번들러만 재시작
npx react-native start --reset-cache
```

## 빠른 해결 체크리스트

- [ ] 개발 서버 완전히 종료 (Ctrl+C)
- [ ] 캐시 삭제 후 재시작 (`npx expo start -c`)
- [ ] 브라우저 캐시 삭제
- [ ] 다른 포트로 시도 (`--port 8082`)
- [ ] 다른 브라우저로 시도
- [ ] node_modules 재설치 (필요시)

## 가장 효과적인 해결 순서

1. **개발 서버 종료** (Ctrl+C)
2. **캐시 삭제 후 재시작**:
   ```bash
   npx expo start -c
   ```
3. **브라우저에서 강력 새로고침** (Ctrl + Shift + R)
4. 여전히 안 되면 **포트 변경**:
   ```bash
   npx expo start --port 8082
   ```

## 참고사항

- 이 에러는 보통 Metro 번들러의 캐시 문제로 발생합니다
- `-c` 또는 `--clear` 옵션으로 캐시를 삭제하면 대부분 해결됩니다
- 웹 개발 시에는 `--web` 옵션을 사용하는 것이 좋습니다
