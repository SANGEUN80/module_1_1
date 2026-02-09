import asyncio
import psutil
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import WS_PUSH_INTERVAL_SECONDS, DB_SAVE_INTERVAL_FACTOR
from app.database import init_db, save_snapshot, cleanup_old_data
from app.collector import collect_all_processes, collect_system_info
from app.websocket_manager import ConnectionManager
from app.routers import api, ws

manager = ConnectionManager()


async def collection_loop():
    db_save_counter = 0
    while True:
        try:
            processes = await asyncio.to_thread(collect_all_processes)
            system = await asyncio.to_thread(collect_system_info)
            timestamp = datetime.now(timezone.utc).isoformat()

            snapshot = {
                "type": "process_update",
                "timestamp": timestamp,
                "system": system,
                "processes": processes,
            }

            await manager.broadcast(snapshot)

            db_save_counter += 1
            if db_save_counter >= DB_SAVE_INTERVAL_FACTOR:
                await asyncio.to_thread(save_snapshot, timestamp, system, processes)
                db_save_counter = 0
        except Exception as e:
            print(f"Collection error: {e}")

        await asyncio.sleep(WS_PUSH_INTERVAL_SECONDS)


async def cleanup_loop():
    while True:
        try:
            await asyncio.to_thread(cleanup_old_data)
        except Exception as e:
            print(f"Cleanup error: {e}")
        await asyncio.sleep(600)  # every 10 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    # Prime psutil cpu_percent
    psutil.cpu_percent(interval=None)
    list(psutil.process_iter(['cpu_percent']))
    await asyncio.sleep(0.5)

    collection_task = asyncio.create_task(collection_loop())
    cleanup_task = asyncio.create_task(cleanup_loop())

    yield

    collection_task.cancel()
    cleanup_task.cancel()


app = FastAPI(title="Windows Server Monitor", lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(api.router)
app.include_router(ws.router)
