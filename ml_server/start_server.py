#!/usr/bin/env python3
"""
Wheat Disease Detection ML Server
Run this script to start the local ML API server
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install packages")
        sys.exit(1)

def start_server():
    """Start the FastAPI server"""
    print("🌾 Starting Wheat Disease Detection API Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🔍 Health check: http://localhost:8000/health")
    print("📖 API docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop the server\n")
    
    try:
        import uvicorn
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("❌ uvicorn not found. Please install requirements first.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")

def main():
    """Main function"""
    print("=" * 60)
    print("🌾 Wheat Disease Detection ML Server")
    print("=" * 60)
    
    # Check Python version
    check_python_version()
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check if requirements.txt exists
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found")
        sys.exit(1)
    
    # Install requirements if needed
    if len(sys.argv) > 1 and sys.argv[1] == "--install":
        install_requirements()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
