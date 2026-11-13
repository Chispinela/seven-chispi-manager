@echo off
setlocal
set "SEVEN_DATA_DIR="
if exist "%~dp0output\1.0.5-final\win-unpacked\Seven Chispi Manager.exe" (
  start "" "%~dp0output\1.0.5-final\win-unpacked\Seven Chispi Manager.exe"
) else (
  start "" "%~dp0output\1.0.5\win-unpacked\Seven Chispi Manager.exe"
)
endlocal
