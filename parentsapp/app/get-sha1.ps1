# SHA-1 인증서 지문 확인 스크립트
# Windows PowerShell에서 실행

Write-Host "SHA-1 인증서 지문 확인 중..." -ForegroundColor Cyan

$keystorePath = "$env:USERPROFILE\.android\debug.keystore"

if (Test-Path $keystorePath) {
    Write-Host "`n개발용 키스토어에서 SHA-1 확인:" -ForegroundColor Green
    Write-Host "키스토어 경로: $keystorePath`n" -ForegroundColor Gray
    
    $result = keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $sha1Line = $result | Select-String "SHA1:"
        if ($sha1Line) {
            Write-Host "SHA-1 값:" -ForegroundColor Yellow
            Write-Host $sha1Line -ForegroundColor White
            Write-Host "`n위의 SHA-1 값을 Google Cloud Console에 등록하세요." -ForegroundColor Cyan
        } else {
            Write-Host "SHA-1 값을 찾을 수 없습니다." -ForegroundColor Red
            Write-Host "전체 출력:" -ForegroundColor Gray
            Write-Host $result
        }
    } else {
        Write-Host "오류가 발생했습니다:" -ForegroundColor Red
        Write-Host $result
    }
} else {
    Write-Host "키스토어 파일을 찾을 수 없습니다: $keystorePath" -ForegroundColor Red
    Write-Host "`nAndroid Studio를 실행하거나 Android 에뮬레이터를 한 번 실행하면 키스토어가 생성됩니다." -ForegroundColor Yellow
}

Write-Host "`n아무 키나 누르면 종료됩니다..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
