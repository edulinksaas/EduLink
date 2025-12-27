# 이메일 인증 설정 가이드

## 개요
이메일 인증 기능을 사용하려면 SMTP 서버 설정이 필요합니다.

## 환경 변수 설정

`.env` 파일에 다음 변수들을 추가하세요:

```env
# 이메일 발송 설정 (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=학원 관리 시스템

# 프론트엔드 URL (이메일 링크에 사용)
FRONTEND_URL=http://localhost:5173
```

## Gmail 사용 시 설정 방법

### 1. Google 계정 설정
1. Google 계정에 로그인
2. [Google 계정 설정](https://myaccount.google.com/) → 보안
3. "2단계 인증" 활성화 (필수)

### 2. 앱 비밀번호 생성
1. [앱 비밀번호 페이지](https://myaccount.google.com/apppasswords)로 이동
2. "앱 선택" → "메일"
3. "기기 선택" → "기타(맞춤 이름)" → "학원 관리 시스템" 입력
4. 생성된 16자리 비밀번호 복사
5. `.env` 파일의 `SMTP_PASSWORD`에 붙여넣기

### 3. .env 파일 예시
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # 앱 비밀번호 (공백 제거)
SMTP_FROM_NAME=학원 관리 시스템
FRONTEND_URL=http://localhost:5173
```

## 다른 이메일 서비스 사용

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### 네이버 메일
```env
SMTP_HOST=smtp.naver.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@naver.com
SMTP_PASSWORD=your-password
```

### SendGrid (권장 - 프로덕션)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## 개발 환경

개발 환경에서는 이메일 설정이 없어도 작동합니다:
- 이메일은 콘솔에 출력됩니다
- 실제 이메일은 발송되지 않습니다
- 인증 링크는 콘솔에서 확인할 수 있습니다

## 프로덕션 환경

프로덕션 환경에서는 반드시 SMTP 설정을 완료해야 합니다:
- 실제 이메일이 발송됩니다
- 이메일 발송 실패 시 회원가입은 성공하지만 사용자에게 알림이 필요합니다

## 테스트

1. 회원가입을 진행합니다
2. 이메일을 확인합니다 (또는 개발 환경에서는 콘솔 확인)
3. 인증 링크를 클릭합니다
4. 로그인 페이지로 리다이렉트되면 성공입니다

## 문제 해결

### 이메일이 발송되지 않는 경우
1. `.env` 파일의 SMTP 설정 확인
2. Gmail 사용 시 앱 비밀번호 사용 확인
3. 방화벽/보안 설정 확인
4. 서버 로그 확인

### 인증 링크가 작동하지 않는 경우
1. `FRONTEND_URL` 환경 변수 확인
2. 토큰 만료 시간 확인 (기본 24시간)
3. 브라우저 콘솔에서 에러 확인

