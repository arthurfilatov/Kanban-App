import json
import os
import uuid
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from pydantic import BaseModel # type: ignore
from typing import List, Optional, Literal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=('*'),
    allow_headers=('*')              
)

Priority = Literal["low", "medium", "high"]

class Task(BaseModel):
    id: str 
    title: str
    description: Optional[str] = ''
    priority: Priority

class Column(BaseModel):
    id: str
    title: str
    tasks: list[Task] = []

DB_FILE = "tasks_db.json"

def load_db():
    if not os.path.exists(DB_FILE):
        return [
            {"id": "col-1", "title": "Надо сделать", "tasks": [{"id": str(uuid.uuid4()), "title": "Новая задача", "description": "Текст задачи", "priority": "high"}]},
            {"id": "col-2", "title": "В работе", "tasks": [{"id": str(uuid.uuid4()), "title": "Проверить данные", "description": "Данные проверены", "priority": "medium"}]},
            {"id": "col-3", "title": "Готово", "tasks": [{"id": str(uuid.uuid4()), "title": "Запустить проект", "description": "Проект запущен", "priority": "low"}]},
        ]

    try:
        with open(DB_FILE, 'r', encoding="utf-8") as file:
            return json.load(file)
    except Exception:
        return []
    
def save_db(data):
    with open(DB_FILE, 'w', encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

@app.get("/api/columns")
def get_columns():
    return load_db()

@app.post("/api/columns")
def update_columns(columns: List[Column]):
    data_to_save = [col.model_dump() for col in columns]
    save_db(data_to_save)
    return{"status": "success"}

