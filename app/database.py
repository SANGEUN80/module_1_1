import sqlite3
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from app.config import DB_PATH, DATA_RETENTION_HOURS, TOP_N_PROCESSES_TO_SAVE


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS process_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            pid INTEGER NOT NULL,
            name TEXT NOT NULL,
            cpu_percent REAL NOT NULL,
            memory_working_set INTEGER NOT NULL,
            num_threads INTEGER NOT NULL,
            num_handles INTEGER NOT NULL,
            cmdline TEXT,
            username TEXT,
            UNIQUE(timestamp, pid)
        );
        CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp
            ON process_snapshots(timestamp);
        CREATE INDEX IF NOT EXISTS idx_snapshots_pid_timestamp
            ON process_snapshots(pid, timestamp);

        CREATE TABLE IF NOT EXISTS system_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL UNIQUE,
            cpu_percent REAL NOT NULL,
            memory_total INTEGER NOT NULL,
            memory_used INTEGER NOT NULL,
            memory_percent REAL NOT NULL,
            process_count INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_system_timestamp
            ON system_snapshots(timestamp);
    """)
    conn.close()


def save_snapshot(timestamp: str, system: Dict, processes: List[Dict]):
    conn = get_connection()
    try:
        conn.execute(
            """INSERT OR REPLACE INTO system_snapshots
               (timestamp, cpu_percent, memory_total, memory_used, memory_percent, process_count)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (timestamp, system['cpu_percent'], system['memory_total'],
             system['memory_used'], system['memory_percent'], system['process_count'])
        )

        top_processes = sorted(processes, key=lambda p: p['cpu_percent'], reverse=True)[:TOP_N_PROCESSES_TO_SAVE]
        for p in top_processes:
            conn.execute(
                """INSERT OR REPLACE INTO process_snapshots
                   (timestamp, pid, name, cpu_percent, memory_working_set,
                    num_threads, num_handles, cmdline, username)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (timestamp, p['pid'], p['name'], p['cpu_percent'],
                 p['memory_working_set'], p['num_threads'], p['num_handles'],
                 p.get('cmdline'), p.get('username'))
            )
        conn.commit()
    finally:
        conn.close()


def get_system_history(minutes: int = 30) -> List[Dict]:
    conn = get_connection()
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()
        rows = conn.execute(
            "SELECT * FROM system_snapshots WHERE timestamp >= ? ORDER BY timestamp",
            (cutoff,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_process_history(pid: Optional[int] = None, minutes: int = 30) -> List[Dict]:
    conn = get_connection()
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()
        if pid:
            rows = conn.execute(
                "SELECT * FROM process_snapshots WHERE pid = ? AND timestamp >= ? ORDER BY timestamp",
                (pid, cutoff)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM process_snapshots WHERE timestamp >= ? ORDER BY timestamp",
                (cutoff,)
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def cleanup_old_data():
    conn = get_connection()
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=DATA_RETENTION_HOURS)).isoformat()
        conn.execute("DELETE FROM process_snapshots WHERE timestamp < ?", (cutoff,))
        conn.execute("DELETE FROM system_snapshots WHERE timestamp < ?", (cutoff,))
        conn.commit()
    finally:
        conn.close()
