# 올바른 Redirect URI 형식

## ❌ 잘못된 형식 (현재 입력된 값)
```
https://munydihxxzoiqguumdyt.supabase.co
```

## ✅ 올바른 형식
```
https://munydihxxzoiqguumdyt.supabase.co/auth/v1/callback
```

## 차이점

잘못된 형식은 **끝부분이 빠져있습니다**:
- ❌ `/auth/v1/callback` 부분이 없음

올바른 형식은 **전체 경로를 포함**합니다:
- ✅ `/auth/v1/callback` 부분이 포함됨

## 수정 방법

1. 입력 필드의 값을 모두 선택
2. 삭제
3. 다음을 정확히 입력:
   ```
   https://munydihxxzoiqguumdyt.supabase.co/auth/v1/callback
   ```
4. 저장 버튼 클릭

## 확인 사항

올바르게 입력되면:
- ✅ 빨간 밑줄이 사라짐
- ✅ 저장 버튼이 활성화됨
- ✅ 에러 메시지가 사라짐
