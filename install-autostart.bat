@echo off
REM ============================================================
REM  보물섬 복권방 - Windows 시작 시 자동 실행 등록
REM  사용자가 로그인하면 자동으로 브라우저에 페이지가 열립니다.
REM ============================================================

set "TARGET=%~dp0start.bat"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%STARTUP%\BomulseomLottery.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$sc = $ws.CreateShortcut('%SHORTCUT%');" ^
  "$sc.TargetPath = '%TARGET%';" ^
  "$sc.WorkingDirectory = '%~dp0';" ^
  "$sc.WindowStyle = 7;" ^
  "$sc.IconLocation = 'shell32.dll,277';" ^
  "$sc.Description = 'Bomulseom Lottery Auto Launch';" ^
  "$sc.Save()"

echo.
echo [완료] 시작 프로그램에 등록되었습니다.
echo  - 위치: %SHORTCUT%
echo  - 다음 부팅부터 자동으로 보물섬 복권방이 열립니다.
echo  - 해제하려면 uninstall-autostart.bat 을 실행하세요.
echo.
pause
