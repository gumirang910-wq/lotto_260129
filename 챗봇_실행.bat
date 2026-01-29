@echo off
chcp 65001 >nul
echo 뉴스 검색 챗봇 실행 중...
cd /d "%~dp0"

set "PATH=%ProgramFiles%\nodejs;%PATH%"
set NPM_CONFIG_OFFLINE=false

if not exist "node_modules" (
  echo 의존성 설치 중... (최초 1회)
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install 실패. 사용자 폴더 .npmrc 에서 offline=true 를 제거한 뒤 다시 실행해 주세요.
    echo 또는 터미널에서: npm config set offline false
    pause
    exit /b 1
  )
)

echo 서버 시작: http://localhost:3000
start "" "http://localhost:3000"
node server.js

pause
