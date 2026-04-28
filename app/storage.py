import json
import os
from datetime import datetime,timezone
from typing import List, Dict, Optional
import uuid

DATA_FILE = "data/clipboard.json"
FILES_DIR = "data/files"


class Storage:
    def __init__(self):
        self._ensure_data_dir()
        self._items = self._load()

    def _ensure_data_dir(self):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        os.makedirs(FILES_DIR, exist_ok=True)

    def _load(self) -> List[Dict]:
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save(self):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(self._items, f, ensure_ascii=False, indent=2)

    def get_all(self) -> List[Dict]:
        return sorted(self._items, key=lambda x: x["created_at"], reverse=True)

    def add_text(self, content: str) -> Dict:
        item = {
            "id": str(uuid.uuid4()),
            "type": "text",
            "content": content,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._items.insert(0, item)
        self._save()
        return item

    def add_file(self, filename: str, size: int, file_id: str) -> Dict:
        item = {
            "id": str(uuid.uuid4()),
            "type": "file",
            "filename": filename,
            "size": size,
            "file_id": file_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._items.insert(0, item)
        self._save()
        return item

    def get(self, item_id: str) -> Optional[Dict]:
        for item in self._items:
            if item["id"] == item_id:
                return item
        return None

    def delete(self, item_id: str) -> bool:
        original_len = len(self._items)
        item = self.get(item_id)
        self._items = [item for item in self._items if item["id"] != item_id]
        if len(self._items) != original_len:
            # 如果是文件，删除物理文件
            if item and item.get("type") == "file":
                file_path = os.path.join(FILES_DIR, item["file_id"])
                if os.path.exists(file_path):
                    os.remove(file_path)
            self._save()
            return True
        return False

    def clear(self) -> int:
        count = len(self._items)
        # 删除所有文件
        for item in self._items:
            if item.get("type") == "file":
                file_path = os.path.join(FILES_DIR, item["file_id"])
                if os.path.exists(file_path):
                    os.remove(file_path)
        self._items = []
        self._save()
        return count


storage = Storage()
