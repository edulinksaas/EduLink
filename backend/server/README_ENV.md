# 환경 변수 파일(.env) 생성 가이드

## .env 파일이란?
- 프로젝트 설정값(API 키, 데이터베이스 URL 등)을 저장하는 파일입니다
- 보안상 중요한 정보를 코드에 직접 작성하지 않고 별도 파일로 관리합니다
- `.gitignore`에 추가되어 Git에 업로드되지 않습니다

## 생성 방법

### 방법 1: 파일 탐색기에서 직접 생성
1. `server` 폴더로 이동
2. 새 텍스트 파일 생성
3. 파일 이름을 `.env`로 변경 (확장자 없음)
4. 다음 내용 입력:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

### 방법 2: VS Code에서 생성
1. VS Code에서 `server` 폴더 열기
2. 새 파일 생성 (Ctrl+N 또는 우클릭 > New File)
3. 파일 이름을 `.env`로 저장
4. 위 내용 입력

### 방법 3: 터미널에서 생성 (Windows PowerShell)
```powershell
cd server
New-Item -Path .env -ItemType File
notepad .env
```
그리고 다음 내용 입력:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

## 주의사항
- 파일 이름은 정확히 `.env`여야 합니다 (앞에 점 포함)
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY`는 실제 Supabase 프로젝트의 값으로 변경해야 합니다
- 이 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 추가되어 있을 것입니다)

## Supabase 값 찾는 방법
1. [Supabase](https://supabase.com) 로그인
2. 프로젝트 선택
3. Settings (왼쪽 메뉴) > API 클릭
4. Project URL과 anon public key 복사

