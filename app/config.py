import os

# Collection
WS_PUSH_INTERVAL_SECONDS = 2
DB_SAVE_INTERVAL_FACTOR = 5  # Save to DB every N pushes (10s at 2s interval)
TOP_N_PROCESSES_TO_SAVE = 20

# Database
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'monitor.db')
DATA_RETENTION_HOURS = 24

# Server
HOST = "0.0.0.0"
PORT = 8000
