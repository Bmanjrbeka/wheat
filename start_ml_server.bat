@echo off
echo ========================================
echo Wheat Disease Detection ML Server
echo ========================================
echo.

cd /d "%~dp0ml_server"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo.
echo Installing Python packages...
pip install -r requirements.txt

echo.
echo Starting ML Server with real Keras model...
echo Server will be available at: http://localhost:8000
echo Health check: http://localhost:8000/health
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
