@echo off
setlocal

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"

"%NODE_EXE%" "%~dp0..\node_modules\prettier\bin\prettier.cjs" %*
exit /b %ERRORLEVEL%
