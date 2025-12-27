# 개발 서버 연결 오류 해결 가이드

## 에러 메시지
```
Could not connect to development server
failed to connect to /172.30.1.81 (port 8081) from /172.30.1.44 (port 45864) after 5000ms
```

## 문제 분석
- 앱이 `172.30.1.81:8081`에 연결하려고 시도했지만 실패
- 클라이언트 IP: `172.30.1.44`
- 서버 IP: `172.30.1.81`
- 포트: `8081`

## 해결 방법

### 방법 1: USB 연결 시 (가장 쉬움)

**물리적 기기(USB 연결)인 경우:**

```bash
# 1. 개발 서버 시작
cd app
npm start

# 2. 다른 터미널에서 포트 포워딩 설정
adb reverse tcp:8081 tcp:8081
```

**Windows에서:**
```bash
# adb가 설치되어 있어야 합니다 (Android Studio 설치 시 포함됨)
adb reverse tcp:8081 tcp:8081
```

### 방법 2: Wi-Fi 연결 시

**같은 Wi-Fi 네트워크에 연결되어 있는 경우:**

1. **개발 서버 시작:**
   ```bash
   cd app
   npm start
   ```

2. **컴퓨터의 IP 주소 확인:**
   
   **Windows:**
   ```cmd
   ipconfig
   ```
   IPv4 주소 확인 (예: 192.168.0.100)
   
   **Mac/Linux:**
   ```bash
   ifconfig
   ```
   또는
   ```bash
   ip addr
   ```

3. **앱에서 개발 서버 주소 설정:**
   - 앱에서 흔들기 (Shake gesture) 또는 `Ctrl + M` (Android)
   - **Dev Settings** 선택
   - **Debug server host & port for device** 선택
   - 컴퓨터 IP 주소와 포트 입력: `192.168.0.100:8081` (실제 IP로 변경)

### 방법 3: 개발 서버 재시작

```bash
cd app

# 개발 서버 완전히 종료 (Ctrl+C)

# 캐시 삭제 후 재시작
npx expo start -c

# 또는
npm start
```

### 방법 4: Expo Go 앱 사용

**Expo Go 앱을 사용하는 경우:**

1. 개발 서버 시작:
   ```bash
   cd app
   npm start
   ```

2. QR 코드가 표시되면:
   - **Android**: Expo Go 앱에서 QR 코드 스캔
   - **iOS**: 카메라 앱으로 QR 코드 스캔

3. 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다

### 방법 5: 포트 확인 및 변경

**8081 포트가 사용 중인 경우:**

```bash
# 다른 포트로 시작
cd app
npx expo start --port 8082

# 그 다음 adb reverse 설정
adb reverse tcp:8082 tcp:8082
```

## 단계별 해결 체크리스트

### 1. 개발 서버 실행 확인
- [ ] 터미널에서 `npm start` 또는 `npx expo start` 실행
- [ ] Metro 번들러가 정상적으로 시작되었는지 확인
- [ ] 에러 메시지가 없는지 확인

### 2. 연결 방법 확인
- [ ] **USB 연결**: `adb reverse tcp:8081 tcp:8081` 실행
- [ ] **Wi-Fi 연결**: 같은 네트워크에 연결되어 있는지 확인

### 3. 방화벽 확인
- [ ] Windows 방화벽에서 Node.js 허용 확인
- [ ] 8081 포트가 차단되지 않았는지 확인

### 4. 네트워크 확인
- [ ] 컴퓨터와 기기가 같은 Wi-Fi 네트워크에 연결되어 있는지 확인
- [ ] Airplane Mode가 꺼져 있는지 확인

## 빠른 해결 순서

### USB 연결인 경우:

```bash
# 1. 개발 서버 시작
cd app
npm start

# 2. 다른 터미널 창 열기
# 3. 포트 포워딩 설정
adb reverse tcp:8081 tcp:8081

# 4. 앱에서 Reload (R, R) 또는 재시작
```

### Wi-Fi 연결인 경우:

```bash
# 1. 개발 서버 시작
cd app
npm start

# 2. 컴퓨터 IP 주소 확인
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. 앱에서 Dev Settings > Debug server host 설정
# 예: 192.168.0.100:8081

# 4. 앱 재시작
```

## adb가 설치되지 않은 경우

**Android Studio 설치:**
1. [Android Studio](https://developer.android.com/studio) 다운로드 및 설치
2. 설치 시 SDK Platform Tools 포함됨
3. 환경 변수에 adb 경로 추가 (보통 자동 설정됨)

**또는 Platform Tools만 설치:**
1. [Platform Tools](https://developer.android.com/studio/releases/platform-tools) 다운로드
2. 압축 해제
3. 환경 변수에 경로 추가

## 추가 문제 해결

### "adb: command not found" 오류

**Windows:**
- Android Studio 설치 확인
- 환경 변수에 adb 경로 추가:
  ```
  C:\Users\[사용자명]\AppData\Local\Android\Sdk\platform-tools
  ```

### 포트가 이미 사용 중

```bash
# Windows에서 포트 사용 확인
netstat -ano | findstr :8081

# 프로세스 종료 (PID 확인 후)
taskkill /PID [PID번호] /F
```

### 여전히 연결되지 않는 경우

1. **앱 완전히 종료 후 재시작**
2. **개발 서버 재시작** (`Ctrl+C` 후 `npm start`)
3. **캐시 삭제**: `npx expo start -c`
4. **다른 기기/에뮬레이터로 시도**

## 참고사항

- **USB 연결**이 가장 안정적입니다
- **Wi-Fi 연결**은 같은 네트워크에 있어야 합니다
- **Expo Go 앱**을 사용하면 QR 코드로 쉽게 연결할 수 있습니다
- 개발 서버가 실행 중이어야 앱이 연결할 수 있습니다
