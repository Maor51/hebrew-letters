@echo off
cd /d "%~dp0"

git add -A

git diff --cached --quiet
if %errorlevel% == 0 (
  echo Nothing to commit.
  pause
  exit /b 0
)

echo.
echo Changes to commit:
git status --short
echo.

set /p MSG="Commit message (leave blank for timestamp): "
if "%MSG%"=="" (
  for /f "tokens=1-5 delims=/: " %%a in ("%date% %time%") do set MSG=update %%a-%%b-%%c %%d:%%e
)

git commit -m "%MSG%"
git push

echo.
echo Done! Check Vercel for deployment.
pause
