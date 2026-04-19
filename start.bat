@echo off
REM ============================================================
REM  보물섬 복권방 - 브라우저 자동 실행 스크립트
REM  로컬 서버를 띄워 CORS 제약 없이 동행복권 API를 호출합니다.
REM ============================================================

cd /d "%~dp0"

REM 1) Python이 있으면 로컬 서버로 실행 (권장 - CORS 정상 작동)
where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8765/index.html
    python -m http.server 8765
    goto :eof
)

REM 2) Python이 없으면 기본 브라우저로 직접 실행 (file:// — API 호출 제한 가능)
start "" "%~dp0index.html"
