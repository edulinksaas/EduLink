# Supabase 이메일 인증 문제 해결 가이드

## 문제
Supabase Admin API (`createUser`, `generateLink`)는 이메일을 자동으로 발송하지 않습니다.

## 해결 방법

### 방법 1: 프론트엔드에서 먼저 signUp 호출 (권장)

프론트엔드 `AuthContext.jsx`의 `register` 함수에서 Supabase Auth의 `signUp`을 먼저 호출하면 이메일이 자동으로 발송됩니다.

**현재 코드 확인:**
- `saas/src/contexts/AuthContext.jsx`의 `register` 함수에서 이미 `supabase.auth.signUp()`을 호출하고 있습니다.
- 하지만 백엔드에서 먼저 `createUser`를 호출하면 중복 사용자 오류가 발생할 수 있습니다.

**수정 방법:**
1. 프론트엔드에서 `supabase.auth.signUp()`을 먼저 호출
2. 성공하면 백엔드 API 호출하여 학원 정보 등록
3. 백엔드에서는 Supabase Auth 사용자 생성 부분 제거

### 방법 2: Supabase 대시보드 설정 확인

1. Supabase 대시보드 접속
2. **Authentication** > **Email Templates** 메뉴로 이동
3. **Confirm signup** 템플릿이 활성화되어 있는지 확인
4. **Settings** > **Auth** > **Email** 설정 확인
   - SMTP 설정이 되어 있는지 확인
   - 개발 환경에서는 기본 SMTP 사용 가능

### 방법 3: 기존 SMTP 서비스 사용 (임시)

백엔드의 기존 이메일 발송 서비스를 사용하여 이메일을 발송할 수 있습니다.

## 권장 해결책

**프론트엔드에서 먼저 signUp 호출하도록 수정:**

1. 프론트엔드 `AuthContext.jsx`에서 `supabase.auth.signUp()` 먼저 호출
2. 성공하면 백엔드 API 호출
3. 백엔드에서는 Supabase Auth 사용자 생성 부분 제거하고 기존 users 테이블에만 저장

이렇게 하면 Supabase가 자동으로 이메일을 발송합니다.

