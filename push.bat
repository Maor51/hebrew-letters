@echo off
cd /d "%~dp0"

echo Syncing images...
call npm run sync-images
if %errorlevel% neq 0 (
  echo ERROR: sync-images failed.
  pause
  exit /b 1
)

echo Syncing videos...
call npm run sync-videos
if %errorlevel% neq 0 (
  echo ERROR: sync-videos failed.
  pause
  exit /b 1
)

git add -A

git status --short > "%TEMP%\gitstatus.txt" 2>&1
for %%A in ("%TEMP%\gitstatus.txt") do if %%~zA==0 (
  echo Nothing to commit.
  pause
  exit /b 0
)

echo.
echo Changes to commit:
type "%TEMP%\gitstatus.txt"
echo.

set /p MSG="Commit message: "
if "%MSG%"=="" set MSG=update

git commit -m "%MSG%"
if %errorlevel% neq 0 (
  echo ERROR: git commit failed.
  pause
  exit /b 1
)

git push
if %errorlevel% neq 0 (
  echo ERROR: git push failed.
  pause
  exit /b 1
)

echo.
echo Done!
pause
