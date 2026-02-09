const CHART_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const MAX_DATA_POINTS = 60;

// Shared dark theme defaults
Chart.defaults.color = '#9ca3af';
Chart.defaults.borderColor = '#374151';

let cpuChart, memoryChart, cpuDoughnut, threadBar;

function initCharts() {
    cpuChart = new Chart(document.getElementById('cpu-chart'), {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
                    grid: { color: '#1f2937' }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    title: { display: true, text: 'CPU %' },
                    grid: { color: '#1f2937' }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } }
            }
        }
    });

    memoryChart = new Chart(document.getElementById('memory-chart'), {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
                    grid: { color: '#1f2937' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'MB' },
                    grid: { color: '#1f2937' }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } }
            }
        }
    });

    cpuDoughnut = new Chart(document.getElementById('cpu-doughnut'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: CHART_COLORS,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 6, font: { size: 11 } } }
            }
        }
    });

    threadBar = new Chart(document.getElementById('thread-bar'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Threads',
                    data: [],
                    backgroundColor: '#3b82f6',
                    borderRadius: 3
                },
                {
                    label: 'Handles',
                    data: [],
                    backgroundColor: '#f59e0b',
                    borderRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: '#1f2937' }
                },
                y: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } }
            }
        }
    });
}

// Track which processes are in the top 5 for time-series
let cpuTracker = {};  // key: "name(pid)", datasets index
let memTracker = {};

function updateCpuTimeSeries(timestamp, processes) {
    const time = new Date(timestamp);
    const top5 = [...processes]
        .sort((a, b) => b.cpu_percent - a.cpu_percent)
        .slice(0, 5);

    // Reset all datasets visibility
    const activeKeys = new Set();

    top5.forEach((proc, i) => {
        const key = `${proc.name}(${proc.pid})`;
        activeKeys.add(key);

        let dsIndex = cpuTracker[key];
        if (dsIndex === undefined) {
            dsIndex = cpuChart.data.datasets.length;
            cpuTracker[key] = dsIndex;
            cpuChart.data.datasets.push({
                label: key,
                data: [],
                borderColor: CHART_COLORS[dsIndex % CHART_COLORS.length],
                backgroundColor: CHART_COLORS[dsIndex % CHART_COLORS.length] + '20',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                pointRadius: 0
            });
        }
        cpuChart.data.datasets[dsIndex].data.push({ x: time, y: proc.cpu_percent });
        if (cpuChart.data.datasets[dsIndex].data.length > MAX_DATA_POINTS) {
            cpuChart.data.datasets[dsIndex].data.shift();
        }
    });

    // Clean up old datasets
    if (cpuChart.data.datasets.length > 10) {
        cpuChart.data.datasets = cpuChart.data.datasets.filter(ds => {
            return ds.data.length > 0 && (time - ds.data[ds.data.length - 1].x) < 30000;
        });
        cpuTracker = {};
        cpuChart.data.datasets.forEach((ds, i) => { cpuTracker[ds.label] = i; });
    }

    cpuChart.update('none');
}

function updateMemoryTimeSeries(timestamp, processes) {
    const time = new Date(timestamp);
    const top5 = [...processes]
        .sort((a, b) => b.memory_working_set - a.memory_working_set)
        .slice(0, 5);

    top5.forEach((proc) => {
        const key = `${proc.name}(${proc.pid})`;
        let dsIndex = memTracker[key];
        if (dsIndex === undefined) {
            dsIndex = memoryChart.data.datasets.length;
            memTracker[key] = dsIndex;
            memoryChart.data.datasets.push({
                label: key,
                data: [],
                borderColor: CHART_COLORS[dsIndex % CHART_COLORS.length],
                backgroundColor: CHART_COLORS[dsIndex % CHART_COLORS.length] + '20',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                pointRadius: 0
            });
        }
        const mb = proc.memory_working_set / (1024 * 1024);
        memoryChart.data.datasets[dsIndex].data.push({ x: time, y: mb });
        if (memoryChart.data.datasets[dsIndex].data.length > MAX_DATA_POINTS) {
            memoryChart.data.datasets[dsIndex].data.shift();
        }
    });

    if (memoryChart.data.datasets.length > 10) {
        const now = new Date();
        memoryChart.data.datasets = memoryChart.data.datasets.filter(ds => {
            return ds.data.length > 0 && (now - ds.data[ds.data.length - 1].x) < 30000;
        });
        memTracker = {};
        memoryChart.data.datasets.forEach((ds, i) => { memTracker[ds.label] = i; });
    }

    memoryChart.update('none');
}

function updateCpuDoughnut(processes) {
    const top8 = [...processes]
        .sort((a, b) => b.cpu_percent - a.cpu_percent)
        .slice(0, 8)
        .filter(p => p.cpu_percent > 0);

    const otherCpu = processes
        .sort((a, b) => b.cpu_percent - a.cpu_percent)
        .slice(8)
        .reduce((sum, p) => sum + p.cpu_percent, 0);

    const labels = top8.map(p => p.name);
    const data = top8.map(p => p.cpu_percent);

    if (otherCpu > 0) {
        labels.push('Others');
        data.push(Math.round(otherCpu * 10) / 10);
    }

    cpuDoughnut.data.labels = labels;
    cpuDoughnut.data.datasets[0].data = data;
    cpuDoughnut.update('none');
}

function updateThreadBar(processes) {
    const top10 = [...processes]
        .sort((a, b) => (b.num_threads + b.num_handles) - (a.num_threads + a.num_handles))
        .slice(0, 10);

    threadBar.data.labels = top10.map(p => p.name);
    threadBar.data.datasets[0].data = top10.map(p => p.num_threads);
    threadBar.data.datasets[1].data = top10.map(p => p.num_handles);
    threadBar.update('none');
}

function updateAllCharts(data) {
    const { timestamp, processes } = data;
    updateCpuTimeSeries(timestamp, processes);
    updateMemoryTimeSeries(timestamp, processes);
    updateCpuDoughnut(processes);
    updateThreadBar(processes);
}
