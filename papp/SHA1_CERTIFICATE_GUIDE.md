# SHA-1 인증서 디지털 지문 가이드

## SHA-1이란?

**SHA-1 (Secure Hash Algorithm 1)** 인증서 디지털 지문은 Android 앱의 디지털 서명을 식별하는 고유한 값입니다.

### 왜 필요한가요?

1. **Google OAuth 인증**: Google 로그인을 사용할 때 Android 앱을 인증하기 위해 필요
2. **Firebase 서비스**: Firebase를 사용하는 경우 앱 인증에 필요
3. **Google Maps API**: Google Maps를 사용할 때 필요
4. **Google Play App Signing**: 앱 서명 확인에 사용

### SHA-1의 특징

- 각 앱의 서명 키에서 생성되는 고유한 값
- 개발용(debug)과 배포용(release) 키스토어가 다르면 SHA-1도 다름
- 예시: `A1:B2:C3:D4:E5:F6:...` 형식 (40자리 16진수)

## Expo에서 SHA-1 확인 방법

### 방법 1: 키스토어에서 직접 확인 (가장 간단하고 권장)

**Windows CMD 또는 PowerShell에서 실행:**

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

출력에서 `SHA1:` 또는 `SHA-1:` 뒤의 값을 찾으세요.

**SHA-1만 빠르게 확인하려면 (CMD에서):**

```cmd
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
```

**PowerShell에서 SHA-1만 확인:**

```powershell
keytool -list -v -keystore $env:USERPROFILE\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android | Select-String "SHA1"
```

### 방법 2: EAS CLI 사용 (선택사항)

**로컬 프로젝트에서 npx로 실행 (권한 문제 없음):**

```bash
cd app
npx eas-cli credentials
```

또는 전역 설치가 필요하다면 관리자 권한으로 PowerShell 실행 후:

```powershell
npm install -g eas-cli
```

**참고**: EAS CLI를 사용하려면 Expo 계정이 필요할 수 있습니다. 대부분의 경우 방법 1이 더 간단합니다.

### 방법 2: 키스토어에서 직접 확인

#### 개발용 (Debug) SHA-1

Android 개발용 기본 키스토어에서 확인:

**Windows:**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### 배포용 (Release) SHA-1

배포용 키스토어가 있는 경우:

```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### 방법 3: Expo Go 앱 사용 시

Expo Go 앱을 사용하는 경우, Expo가 자동으로 관리하는 키를 사용하므로 별도로 SHA-1을 확인할 필요가 없습니다. 하지만 **프로덕션 빌드**를 만들 때는 필요합니다.

## Google Cloud Console에 SHA-1 등록하기

### 1. SHA-1 값 확인

위의 방법 중 하나로 SHA-1 값을 확인합니다.

### 2. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보** 이동
4. **OAuth 2.0 클라이언트 ID** 섹션에서 Android 앱 클라이언트 ID 선택 (또는 새로 생성)
5. **SHA-1 인증서 지문** 섹션에 SHA-1 값 추가
6. **저장** 클릭

### 3. Android 클라이언트 ID 생성 (처음인 경우)

1. **사용자 인증 정보** 페이지에서 **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
2. 애플리케이션 유형: **Android** 선택
3. 패키지 이름: `com.parentapp` (app.json의 android.package 값)
4. SHA-1 인증서 지문: 위에서 확인한 SHA-1 값 입력
5. **만들기** 클릭

## 주의사항

### 1. 개발용과 배포용 SHA-1이 다름

- **개발 중**: Debug 키스토어의 SHA-1 사용
- **프로덕션 배포**: Release 키스토어의 SHA-1 사용
- 두 SHA-1을 모두 Google Cloud Console에 등록해야 함

### 2. Expo 관리형 프로젝트

Expo를 사용하는 경우:
- **개발 중**: Expo Go 앱 사용 시 SHA-1 불필요 (Expo가 자동 관리)
- **프로덕션 빌드**: EAS Build 사용 시 SHA-1 자동 생성
- **로컬 빌드**: 위의 방법으로 확인

### 3. SHA-1 변경 시

키스토어를 변경하거나 재생성하면 SHA-1도 변경됩니다. 이 경우 Google Cloud Console에서도 업데이트해야 합니다.

## 현재 프로젝트 설정

현재 `app.json`의 Android 패키지 이름:
```json
{
  "android": {
    "package": "com.parentapp"
  }
}
```

이 패키지 이름과 SHA-1을 Google Cloud Console에 등록하면 Google OAuth가 작동합니다.

## 빠른 확인 명령어

Windows에서 개발용 SHA-1 빠르게 확인:

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
```

Mac/Linux:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

## 참고 자료

- [Google OAuth Android 설정](https://developers.google.com/identity/sign-in/android/start-integrating)
- [Expo Credentials 관리](https://docs.expo.dev/versions/latest/sdk/credentials/)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
