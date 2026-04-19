@echo off
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\BomulseomLottery.lnk"

if exist "%SHORTCUT%" (
    del "%SHORTCUT%"
    echo [완료] 자동 실행이 해제되었습니다.
) else (
    echo [안내] 등록된 자동 실행이 없습니다.
)
echo.
pause
