# 카카오 API 키 종류 및 사용 가이드

## 카카오 API 키 종류

### 1. REST API 키 (서버/모바일 앱용)
- **용도**: 서버 사이드 또는 모바일 앱에서 사용
- **사용 위치**: Supabase OAuth 설정의 **Client ID**
- **보안**: 서버에서 안전하게 관리해야 함

### 2. JavaScript 키 (웹 브라우저용)
- **용도**: 웹 브라우저에서 직접 사용 (클라이언트 사이드)
- **사용 위치**: 웹 앱에서 직접 카카오 로그인 구현 시
- **보안**: 브라우저에 노출되므로 공개되어도 상대적으로 안전

### 3. Admin 키 (서버 전용)
- **용도**: 서버에서만 사용하는 관리자 키
- **사용 위치**: 서버 사이드 관리 작업
- **보안**: 절대 클라이언트에 노출되면 안 됨

## 현재 프로젝트에서 사용할 키

### ✅ REST API 키를 사용해야 합니다!

**이유:**
1. **Supabase OAuth 사용**: 현재 프로젝트는 Supabase를 통해 OAuth 인증을 처리합니다
2. **서버 사이드 처리**: Supabase가 서버에서 OAuth를 처리하므로 REST API 키가 필요합니다
3. **모바일 앱**: React Native Expo 앱이므로 모바일 앱용 키가 적합합니다

### ❌ JavaScript 키는 사용하지 않습니다

**이유:**
- JavaScript 키는 웹 브라우저에서 직접 사용하는 용도입니다
- 현재는 Supabase를 통한 OAuth를 사용하므로 필요 없습니다

## 설정 방법

### 1. REST API 키 확인

1. Kakao Developers Console 접속
2. **내 애플리케이션** > 앱 선택
3. **앱 설정** > **앱 키** 메뉴로 이동
4. **REST API 키** 확인 및 복사

### 2. Supabase에 설정

1. Supabase 대시보드 > **Authentication** > **Providers** > **Kakao**
2. **Client ID (for OAuth)**에 **REST API 키** 입력
3. **Client Secret (for OAuth)**에 **Client Secret** 입력
4. 저장

## 플랫폼 키 추가 (선택사항)

### 플랫폼 키가 필요한 경우

**플랫폼 키는 네이티브 앱(Android/iOS)에서 직접 카카오 SDK를 사용할 때 필요합니다.**

현재 프로젝트는:
- ✅ Supabase를 통한 웹 기반 OAuth 사용
- ❌ 네이티브 카카오 SDK 직접 사용 안 함

**따라서 플랫폼 키 추가는 선택사항입니다.**

### 플랫폼 키를 추가하려는 경우

#### Android 플랫폼 키 추가:

1. Kakao Developers Console > **내 애플리케이션** > 앱 선택
2. **앱 설정** > **플랫폼** 메뉴로 이동
3. **플랫폼 추가** > **Android** 선택
4. **패키지 이름** 입력: `com.parentapp` (app.json의 android.package 값)
5. **키 해시** 입력 (필요시)
6. 저장

#### iOS 플랫폼 키 추가:

1. **플랫폼 추가** > **iOS** 선택
2. **번들 ID** 입력: `com.parentapp` (app.json의 ios.bundleIdentifier 값)
3. 저장

## 현재 설정 요약

### Supabase OAuth 설정에 필요한 것:

1. ✅ **REST API 키** → Client ID로 사용
2. ✅ **Client Secret** → 고급 탭에서 생성
3. ✅ **Redirect URI** → `https://your-project-id.supabase.co/auth/v1/callback`

### 플랫폼 키는:

- ❌ **필수 아님** (Supabase OAuth 사용 시)
- ✅ **선택사항** (나중에 네이티브 SDK 사용 시)

## 체크리스트

### Supabase 설정:
- [ ] REST API 키 확인
- [ ] Client Secret 생성
- [ ] Supabase에 REST API 키 입력 (Client ID)
- [ ] Supabase에 Client Secret 입력
- [ ] Redirect URI 설정

### 플랫폼 키 (선택사항):
- [ ] Android 플랫폼 키 추가 (필요시)
- [ ] iOS 플랫폼 키 추가 (필요시)

## 중요 참고사항

1. **REST API 키 = Client ID**: Supabase 설정에서 사용
2. **JavaScript 키 = 사용 안 함**: 현재 프로젝트에서는 필요 없음
3. **플랫폼 키 = 선택사항**: 네이티브 SDK 사용 시에만 필요
4. **현재는 REST API 키만 사용**: Supabase OAuth 설정에 충분함

## 결론

**현재 프로젝트에서는 REST API 키만 사용하면 됩니다!**

- ✅ REST API 키 → Supabase Client ID로 사용
- ❌ JavaScript 키 → 사용 안 함
- ❓ 플랫폼 키 → 선택사항 (나중에 필요할 수 있음)
