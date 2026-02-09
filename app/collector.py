import psutil
from datetime import datetime
from typing import List, Dict


def collect_all_processes() -> List[Dict]:
    result = []
    for proc in psutil.process_iter(
        attrs=['pid', 'name', 'cpu_percent', 'memory_info',
               'create_time', 'cmdline', 'num_threads',
               'num_handles', 'status', 'username']
    ):
        try:
            info = proc.info
            # Skip System Idle Process (PID 0) - reports inflated CPU
            if info['pid'] == 0:
                continue
            mem_info = info.get('memory_info')
            memory_ws = 0
            if mem_info:
                memory_ws = getattr(mem_info, 'wset', None) or getattr(mem_info, 'rss', 0)

            create_time = None
            if info.get('create_time'):
                try:
                    create_time = datetime.fromtimestamp(info['create_time']).isoformat()
                except (OSError, ValueError):
                    pass

            cmdline = None
            if info.get('cmdline'):
                cmdline = ' '.join(info['cmdline'])

            result.append({
                'pid': info['pid'],
                'name': info.get('name') or 'Unknown',
                'cpu_percent': info.get('cpu_percent') or 0.0,
                'memory_working_set': memory_ws,
                'create_time': create_time,
                'cmdline': cmdline,
                'num_threads': info.get('num_threads') or 0,
                'num_handles': info.get('num_handles') or 0,
                'status': info.get('status') or 'unknown',
                'username': info.get('username'),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return result


def collect_system_info() -> Dict:
    mem = psutil.virtual_memory()
    return {
        'cpu_percent': psutil.cpu_percent(interval=None),
        'memory_total': mem.total,
        'memory_used': mem.used,
        'memory_percent': mem.percent,
        'process_count': len(psutil.pids()),
    }
