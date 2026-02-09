let currentSort = { column: 'cpu_percent', ascending: false };
let searchFilter = '';
let allProcesses = [];

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

function formatTime(isoStr) {
    if (!isoStr) return 'N/A';
    try {
        const d = new Date(isoStr);
        return d.toLocaleString('ko-KR', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    } catch {
        return isoStr;
    }
}

function initTable() {
    // Sort headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (currentSort.column === col) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.column = col;
                currentSort.ascending = col === 'name' || col === 'create_time';
            }
            // Update header indicators
            document.querySelectorAll('th[data-sort]').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(currentSort.ascending ? 'sort-asc' : 'sort-desc');
            renderTable();
        });
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchFilter = e.target.value.toLowerCase();
        renderTable();
    });

    // Set default sort indicator
    const defaultTh = document.querySelector('th[data-sort="cpu_percent"]');
    if (defaultTh) defaultTh.classList.add('sort-desc');
}

function updateTableData(processes) {
    allProcesses = processes;
    renderTable();
}

function renderTable() {
    let filtered = allProcesses;
    if (searchFilter) {
        filtered = allProcesses.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchFilter)) ||
            (p.cmdline && p.cmdline.toLowerCase().includes(searchFilter)) ||
            String(p.pid).includes(searchFilter)
        );
    }

    const sorted = [...filtered].sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

        if (typeof valA === 'string') valA = (valA || '').toLowerCase();
        if (typeof valB === 'string') valB = (valB || '').toLowerCase();
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    const tbody = document.getElementById('process-table-body');
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No processes found</td></tr>';
    } else {
        tbody.innerHTML = sorted.map(p => {
            const cpuColor = p.cpu_percent > 50 ? 'text-red-400' :
                             p.cpu_percent > 20 ? 'text-yellow-400' : 'text-gray-300';
            return `<tr class="hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-2 text-gray-400">${p.pid}</td>
                <td class="px-4 py-2 font-medium text-gray-200">${escapeHtml(p.name)}</td>
                <td class="px-4 py-2 text-right ${cpuColor}">${p.cpu_percent.toFixed(1)}%</td>
                <td class="px-4 py-2 text-right text-gray-300">${formatBytes(p.memory_working_set)}</td>
                <td class="px-4 py-2 text-right text-gray-300">${p.num_threads}</td>
                <td class="px-4 py-2 text-right text-gray-300">${p.num_handles}</td>
                <td class="px-4 py-2 text-gray-400 text-xs">${formatTime(p.create_time)}</td>
                <td class="px-4 py-2 text-gray-500 text-xs truncate max-w-xs" title="${escapeHtml(p.cmdline || '')}">${escapeHtml(p.cmdline || 'N/A')}</td>
            </tr>`;
        }).join('');
    }

    document.getElementById('table-count').textContent = filtered.length;
}
