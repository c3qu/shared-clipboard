from fastapi import FastAPI, HTTPException, Depends, Cookie, Response, Request, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from app.storage import storage, FILES_DIR
import os
import uuid
from typing import Optional

app = FastAPI()

# 从环境变量获取密码，默认是 123456
ACCESS_PASSWORD = os.getenv("ACCESS_PASSWORD", "123456")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 50 * 1024 * 1024))  # 默认50MB
sessions = set()


class ClipboardItem(BaseModel):
    content: str


class LoginData(BaseModel):
    password: str


async def verify_auth(session_id: Optional[str] = Cookie(None)):
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


@app.post("/api/login")
async def login(data: LoginData, response: Response):
    if data.password == ACCESS_PASSWORD:
        session_id = str(uuid.uuid4())
        sessions.add(session_id)
        response.set_cookie(key="session_id", value=session_id,
                            max_age=86400 * 7, httponly=True)
        return {"success": True}
    raise HTTPException(status_code=401, detail="密码错误")


@app.get("/api/items", dependencies=[Depends(verify_auth)])
def get_items():
    return {"items": storage.get_all()}


@app.post("/api/items", dependencies=[Depends(verify_auth)])
def add_item(item: ClipboardItem):
    if not item.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    return storage.add_text(item.content.strip())


@app.post("/api/upload", dependencies=[Depends(verify_auth)])
async def upload_file(file: UploadFile = File(...)):
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"文件太大，最大支持 {MAX_FILE_SIZE // 1024 // 1024}MB")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(FILES_DIR, file_id)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    file_size = len(content)
    return storage.add_file(file.filename or "unknown", file_size, file_id)


@app.get("/api/download/{item_id}", dependencies=[Depends(verify_auth)])
async def download_file(item_id: str):
    item = storage.get(item_id)
    if not item or item.get("type") != "file":
        raise HTTPException(status_code=404, detail="文件不存在")

    file_path = os.path.join(FILES_DIR, item["file_id"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件已删除")

    return FileResponse(file_path, filename=item["filename"])


@app.delete("/api/items/{item_id}", dependencies=[Depends(verify_auth)])
def delete_item(item_id: str):
    if not storage.delete(item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}


@app.delete("/api/items", dependencies=[Depends(verify_auth)])
def clear_items():
    count = storage.clear()
    return {"success": True, "count": count}


@app.websocket("/clipsocket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.close()

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def read_root(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id and session_id in sessions:
        return FileResponse("app/static/index.html")
    return FileResponse("app/static/login.html")
