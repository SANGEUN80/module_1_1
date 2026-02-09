from fastapi import APIRouter, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import Optional
import asyncio

from app.collector import collect_all_processes, collect_system_info
from app.database import get_system_history, get_process_history

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/api/processes")
async def get_processes():
    processes = await asyncio.to_thread(collect_all_processes)
    return {"processes": processes}


@router.get("/api/system")
async def get_system():
    system = await asyncio.to_thread(collect_system_info)
    return system


@router.get("/api/history")
async def get_history(
    minutes: int = Query(default=30, ge=1, le=1440),
    pid: Optional[int] = Query(default=None)
):
    if pid:
        data = await asyncio.to_thread(get_process_history, pid, minutes)
    else:
        data = await asyncio.to_thread(get_process_history, None, minutes)
    system_data = await asyncio.to_thread(get_system_history, minutes)
    return {"process_history": data, "system_history": system_data}
