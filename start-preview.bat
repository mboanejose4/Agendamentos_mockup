@echo off
cd /d %~dp0\preview
python -m http.server 8080
