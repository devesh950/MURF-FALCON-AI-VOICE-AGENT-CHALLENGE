@echo off
cd /d %~dp0
python -m pip install --upgrade pip
pip install google-generativeai python-dotenv
