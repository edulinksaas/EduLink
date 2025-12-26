# Supabase 연결 가이드

## 현재 상태
- ✅ 모든 모델과 컨트롤러 구조가 준비되어 있습니다
- ✅ API 라우트가 설정되어 있습니다
- ❌ 데이터베이스 연결이 아직 구현되지 않았습니다 (TODO 상태)

## Supabase 연결 단계

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - API Key (anon/public key)

### 2. 패키지 설치
```bash
cd server
npm install @supabase/supabase-js
```

### 3. 환경 변수 설정
`server/.env` 파일 생성:
```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### 4. 데이터베이스 스키마 생성
Supabase SQL Editor에서 다음 테이블들을 생성해야 합니다:
- academies
- subjects
- classrooms
- classes
- teachers
- students
- enrollments
- schedules
- requests
- users

### 5. 모델 구현
각 모델 파일의 TODO 부분을 Supabase 쿼리로 구현해야 합니다.

## 다음 단계
위 단계를 완료한 후, 각 모델의 Supabase 구현을 진행하면 됩니다.

