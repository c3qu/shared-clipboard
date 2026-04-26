<!-- language -->

[English](README.md) | [简体中文](README_zh-CN.md)

# Shared Clipboard

A simple online shared clipboard application that supports multi-user text content sharing.

## Features

- 🔐 **Password Protection** - Access requires password authentication
- 📄 **File Sharing** - Support uploading and downloading files with file icons
- 📋 **Click to Copy** - Click any content line to copy to clipboard
- ⌨️ **Shortcut Support** - Press `Ctrl+V` to directly paste text or files
- 🔄 **Real-time Sync** - Automatically refresh to display latest content
- 💾 **Data Persistence** - Both data and files are saved to disk
- 🐳 **Docker Deployment** - Support one-click Docker deployment

## Local Run

### Method 1: Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (Git Bash):
source venv/Scripts/activate
# Windows (CMD):
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set password (optional, default is 123456)
# Windows (Git Bash):
export ACCESS_PASSWORD=yourpassword
# Linux/Mac:
export ACCESS_PASSWORD=yourpassword

# Set max file size (optional, default 50MB, in bytes)
export MAX_FILE_SIZE=52428800

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

Default access password: `123456`
Access: http://localhost:8080

### Method 2: Docker

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Access: http://localhost:8080

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | Get all clipboard content |
| POST | `/api/items` | Add new content (JSON: {"content": "..."}) |
| DELETE | `/api/items/{id}` | Delete specific content |

## Project Structure

```
jianqieban/
├── app/
│   ├── main.py          # FastAPI main program
│   ├── storage.py       # Data storage logic
│   └── static/
│       ├── index.html   # Frontend page
│       ├── style.css    # Stylesheet
│       └── app.js       # Frontend interaction logic
├── data/                # Data persistence directory (auto-created)
├── Dockerfile           # Docker image configuration
├── docker-compose.yml   # Docker Compose configuration
└── requirements.txt     # Python dependencies
```

## Usage

1. **Add Content**: Click "Paste new content" button, or directly press `Ctrl+V`
2. **Copy Content**: Click any content line to automatically copy to clipboard
3. **Delete Content**: Hover over content, click the × button on the right
