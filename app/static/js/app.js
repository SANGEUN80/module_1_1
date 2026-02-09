// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initTable();

    // WebSocket connection
    new ProcessWebSocket(
        // onMessage
        (data) => {
            if (data.type === 'process_update') {
                updateSummaryCards(data);
                updateAllCharts(data);
                updateTableData(data.processes);
                updateTimestamp(data.timestamp);
            }
        },
        // onStatusChange
        (connected) => {
            const dot = document.getElementById('ws-dot');
            const text = document.getElementById('ws-text');
            if (connected) {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-green-500';
                text.textContent = 'Connected';
                text.className = 'text-green-400';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
                text.textContent = 'Disconnected';
                text.className = 'text-red-400';
            }
        }
    );
});

function updateSummaryCards(data) {
    const { system, processes } = data;

    // CPU
    document.getElementById('card-cpu').textContent = system.cpu_percent.toFixed(1) + '%';

    // Memory
    document.getElementById('card-memory').textContent = system.memory_percent.toFixed(1) + '%';
    const usedGB = (system.memory_used / (1024 ** 3)).toFixed(1);
    const totalGB = (system.memory_total / (1024 ** 3)).toFixed(1);
    document.getElementById('card-memory-detail').textContent = `${usedGB} GB / ${totalGB} GB`;

    // Process count
    document.getElementById('card-processes').textContent = system.process_count;

    // Top CPU process
    if (processes.length > 0) {
        const top = [...processes].sort((a, b) => b.cpu_percent - a.cpu_percent)[0];
        document.getElementById('card-top-process').textContent = top.name;
        document.getElementById('card-top-cpu').textContent = `PID: ${top.pid} | CPU: ${top.cpu_percent.toFixed(1)}%`;
    }
}

function updateTimestamp(ts) {
    const d = new Date(ts);
    document.getElementById('update-time').textContent =
        'Updated: ' + d.toLocaleTimeString('ko-KR');
}
