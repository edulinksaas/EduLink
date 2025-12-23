# Supabase Redirect URLs 설정 수정 가이드

## 🔴 문제 발견!

현재 Redirect URLs 설정이 잘못되어 있습니다:

**잘못된 설정:**
```
https://munydihxxzojgquumdyt.supabase.co/auth/v1/callbackparentapp://auth/callback
```

이것은 두 개의 URL이 하나로 합쳐진 잘못된 형식입니다!

## ✅ 올바른 설정 방법

### 1단계: 잘못된 URL 삭제

1. **Supabase 대시보드** > **Authentication** > **URL Configuration** 메뉴로 이동

2. **현재 설정된 URL 확인**
   - `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callbackparentapp://auth/callback` 이 보일 것입니다

3. **이 URL 삭제**
   - URL 옆의 삭제 버튼(휴지통 아이콘) 클릭
   - 또는 체크박스를 선택하고 삭제

### 2단계: 올바른 URL 두 개를 각각 추가

**중요**: 두 개의 URL을 각각 별도로 추가해야 합니다!

#### 첫 번째 URL 추가 (Kakao OAuth 콜백용):

1. **URL 입력 필드에 다음 입력:**
   ```
   https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback
   ```
   - 정확히 이 URL만 입력 (끝에 다른 것이 붙지 않도록 주의!)

2. **"Add URL" 버튼 클릭**

#### 두 번째 URL 추가 (앱 Deep Link용):

1. **URL 입력 필드에 다음 입력:**
   ```
   parentapp://auth/callback
   ```
   - 정확히 이 URL만 입력

2. **"Add URL" 버튼 클릭**

### 3단계: 최종 확인

**최종적으로 두 개의 URL이 각각 별도로 표시되어야 합니다:**

1. `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback`
2. `parentapp://auth/callback`

**잘못된 예:**
- ❌ `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callbackparentapp://auth/callback` (하나로 합쳐진 것)

**올바른 예:**
- ✅ `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` (첫 번째)
- ✅ `parentapp://auth/callback` (두 번째)

### 4단계: 저장 및 확인

1. **페이지 새로고침 (F5)**
2. **다시 확인**
   - 두 개의 URL이 각각 별도로 표시되는지 확인
   - "Total URLs: 2"로 표시되어야 합니다

## 📝 체크리스트

- [ ] 잘못된 URL 삭제 완료
- [ ] `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` 추가 완료
- [ ] `parentapp://auth/callback` 추가 완료
- [ ] 두 개의 URL이 각각 별도로 표시됨
- [ ] "Total URLs: 2"로 표시됨
- [ ] 페이지 새로고침 후 확인

## ⚠️ 주의사항

1. **URL을 하나씩 추가하세요**
   - 두 URL을 동시에 입력하지 마세요
   - 각각 별도로 입력하고 "Add URL" 버튼을 클릭하세요

2. **URL 형식 확인**
   - 첫 번째 URL: `https://`로 시작하는 웹 URL
   - 두 번째 URL: `parentapp://`로 시작하는 앱 Deep Link

3. **공백 확인**
   - URL 앞뒤에 공백이 없어야 합니다
   - URL 중간에 공백이 없어야 합니다

## 요약

**문제**: 두 개의 URL이 하나로 합쳐져 있음

**해결**:
1. ✅ 잘못된 URL 삭제
2. ✅ `https://munydihxxzojgquumdyt.supabase.co/auth/v1/callback` 추가
3. ✅ `parentapp://auth/callback` 추가
4. ✅ 두 개의 URL이 각각 별도로 표시되는지 확인

**핵심**: 두 개의 URL을 각각 별도로 추가해야 합니다! 하나로 합치면 안 됩니다!
