// ============================================================
// State
// ============================================================
let allDrugs = [];
let searchQuery = '';

// ============================================================
// API helpers
// ============================================================
async function apiGet(action) {
    const url = `${API_URL}?action=${action}`;
    const res = await fetch(url);
    return await res.json();
}

// ============================================================
// Loading: Products + Balances
// ============================================================
async function loadData() {
    setStatus('Loading...', '');
    try {
        // Fetch balances (which already contains id, drug, formulation, presentation, store, office, total)
        const data = await apiGet('balances');
        if (!data.ok) throw new Error(data.error || 'Failed to load');

        allDrugs = data.balances || [];
        renderList();

        setStatus(`Connected · ${allDrugs.length} drugs`, 'ok');
    } catch (err) {
        setStatus('Error: ' + err.message, 'err');
    }
}

// ============================================================
// Render drug list
// ============================================================
function renderList() {
    const tbody = document.getElementById('drug-rows');
    tbody.innerHTML = '';

    const filtered = allDrugs.filter(d => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (d.drug + ' ' + (d.formulation || '') + ' ' + (d.presentation || '')).toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">No drugs found</td></tr>';
        return;
    }

    for (const d of filtered) {
        const tr = document.createElement('tr');
        if (d.total < 20) tr.classList.add('low-stock');
        tr.innerHTML = `
            <td>${d.id}</td>
            <td>${d.drug || ''}</td>
            <td>${d.formulation || ''}</td>
            <td>${d.presentation || ''}</td>
            <td class="num">${d.store || 0}</td>
            <td class="num">${d.office || 0}</td>
            <td class="num">${d.total || 0}</td>
        `;
        tbody.appendChild(tr);
    }
}

// ============================================================
// Render recent movements
// ============================================================
async function loadRecent() {
    const tbody = document.getElementById('movement-rows');
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Loading...</td></tr>';

    try {
        const data = await apiGet('recent');
        if (!data.ok) throw new Error(data.error || 'Failed');

        tbody.innerHTML = '';
        if (!data.movements || data.movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">No movements yet</td></tr>';
            return;
        }

        for (const m of data.movements) {
            const date = m.date ? new Date(m.date).toLocaleString('en-KE', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${m.id}</td>
                <td class="num">${m.qty}</td>
                <td>${m.type}</td>
                <td>${m.location}</td>
                <td>${m.note || ''}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty">Error: ${err.message}</td></tr>`;
    }
}

// ============================================================
// Status bar
// ============================================================
function setStatus(text, cls) {
    const el = document.getElementById('status');
    el.textContent = text;
    el.className = 'subtitle ' + (cls || '');
}

// ============================================================
// Tab switching
// ============================================================
function setupTabs() {
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + target).classList.add('active');

            if (target === 'recent') loadRecent();
        });
    });
}

// ============================================================
// Search
// ============================================================
function setupSearch() {
    document.getElementById('search').addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderList();
    });
}

// ============================================================
// Init
// ============================================================
async function init() {
    setupTabs();
    setupSearch();
    await loadData();

    if (REFRESH_INTERVAL > 0) {
        setInterval(loadData, REFRESH_INTERVAL);
    }
}

document.addEventListener('DOMContentLoaded', init);
