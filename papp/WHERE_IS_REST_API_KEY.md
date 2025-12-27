# REST API 키 찾는 방법

## ❌ 빨간 부분은 REST API 키가 아닙니다!

빨간색 박스 안의 `ID 1353789`는:
- **앱 ID (Application ID)**: 앱을 식별하는 번호
- REST API 키가 아닙니다!

## ✅ REST API 키 찾는 방법

### 단계별 안내:

1. **Kakao Developers Console 접속**
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션 선택**
   - 상단 메뉴에서 **내 애플리케이션** 클릭
   - "에듀링크" 앱 클릭

3. **앱 설정 메뉴로 이동**
   - 좌측 메뉴에서 **앱 설정** 클릭
   - **앱 키** 메뉴 클릭

4. **REST API 키 확인**
   - **앱 키** 페이지에서 여러 키들이 표시됩니다:
     - **REST API 키** ← 이것이 필요합니다!
     - JavaScript 키
     - Admin 키
   - **REST API 키** 옆의 값을 복사하세요

## REST API 키의 특징

- **형식**: 긴 알파벳과 숫자 조합 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
- **위치**: 앱 설정 > 앱 키 > REST API 키
- **용도**: Supabase의 Client ID로 사용

## 앱 ID vs REST API 키

| 항목 | 앱 ID | REST API 키 |
|------|-------|-------------|
| **위치** | 앱 상세 페이지 상단 | 앱 설정 > 앱 키 |
| **형식** | 숫자 (예: 1353789) | 긴 문자열 (알파벳+숫자) |
| **용도** | 앱 식별 | API 인증 |
| **Supabase 설정** | 사용 안 함 | Client ID로 사용 |

## 확인 방법

### REST API 키가 맞는지 확인:
1. **앱 설정** > **앱 키** 메뉴로 이동
2. **REST API 키** 라벨이 있는지 확인
3. 값이 긴 알파벳+숫자 문자열인지 확인

### Supabase에 입력할 값:
- **Client ID (for OAuth)**: REST API 키 입력
- **앱 ID (1353789)**: 사용하지 않음

## 요약

- ❌ 빨간 부분 (ID 1353789) = 앱 ID (REST API 키 아님)
- ✅ REST API 키 = 앱 설정 > 앱 키 > REST API 키

**핵심**: REST API 키는 **앱 설정 > 앱 키** 메뉴에서 찾을 수 있습니다!
