from pydantic import BaseModel
from typing import Optional, List


class ProcessInfo(BaseModel):
    pid: int
    name: str
    cpu_percent: float
    memory_working_set: int
    create_time: Optional[str] = None
    cmdline: Optional[str] = None
    num_threads: int
    num_handles: int
    status: str
    username: Optional[str] = None


class SystemInfo(BaseModel):
    cpu_percent: float
    memory_total: int
    memory_used: int
    memory_percent: float
    process_count: int


class ProcessSnapshot(BaseModel):
    type: str = "process_update"
    timestamp: str
    system: SystemInfo
    processes: List[ProcessInfo]
