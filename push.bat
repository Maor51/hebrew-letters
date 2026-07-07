@echo off
cd /d "%~dp0"

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
git push

echo.
echo Done!
pause
