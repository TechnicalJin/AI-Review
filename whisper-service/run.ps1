# Activate virtual environment
.\venv\Scripts\Activate.ps1

Write-Host "🚀 Starting Whisper Service..."

# Start Flask server
python whisper_server.py
