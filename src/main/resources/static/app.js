// =============================================
// Taka Bachai — Frontend Logic
// =============================================
// API base is empty so requests are relative; the same Spring Boot server
// hosts both the static frontend and the /api endpoints, which makes the
// app deployable to Render, Docker or `localhost` with zero config changes.
const API = '';

// -------- Global state --------
let currentUserId = 1;
let categories = [];
let wallets = [];
let transactions = [];
let debts = [];
let allUsers = [];
let netWorthChartInstance = null;
let summaryMode = 'totals';
let latestSummaryData = null;
let txFilters = { type: '', categoryId: '', startDate: '', endDate: '', keyword: '' };

const pageMeta = {
    'dashboard':    { t: 'Dashboard',    a: '' },
    'accounts':     { t: 'Accounts',     a: '<button class="btn btn-outline" onclick="loadAccounts()"><i class="ph ph-arrows-clockwise"></i> Refresh</button><button class="btn btn-orange" onclick="showAddWallet()"><i class="ph ph-plus"></i> Add account</button>' },
    'transactions': { t: 'Transactions', a: '<button class="btn btn-orange" onclick="showAddTransaction()"><i class="ph ph-plus"></i> Add transaction</button>' },
    'budgets':      { t: 'Budgets',      a: '<button class="btn btn-orange" onclick="showAddBudget()"><i class="ph ph-plus"></i> Set budget</button>' },
    'bills':        { t: 'Recurring',    a: '<button class="btn btn-orange" onclick="showAddBill()"><i class="ph ph-plus"></i> Add bill</button>' },
    'goals':        { t: 'Goals',        a: '<button class="btn btn-orange" onclick="showAddGoal()"><i class="ph ph-plus"></i> Add goal</button>' },
    'debts':        { t: 'Loans',        a: '<button class="btn btn-orange" onclick="showAddDebt()"><i class="ph ph-plus"></i> Log record</button>' },
    'reports':      { t: 'Reports',      a: '<button class="btn btn-orange" onclick="loadGenericModule(\'reports\')"><i class="ph ph-arrows-clockwise"></i> Regenerate</button><button class="btn btn-outline" onclick="window.print()"><i class="ph ph-printer"></i> Print / Save PDF</button>' },
    'admin':        { t: 'Admin Panel',  a: '<button class="btn btn-orange" onclick="showAddUser()"><i class="ph ph-plus"></i> Add User</button>' }
};

// =============================================
// Init
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    loadHomeUsers();
    setupNavigation();
    setupGlobalUx();
});

function setupGlobalUx() {
    // Close modal on overlay click or Escape.
    const overlay = document.getElementById('modalOverlay');
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}

// =============================================
// HTTP helpers (toast on failure, JSON parsing)
// =============================================
async function api(method, path, body) {
    const opts = { method, headers: { 'Accept': 'application/json' } };
    if (body !== undefined) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${API}${path}`, opts);
    const text = await res.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); } catch (_) { data = text; }
    }
    if (!res.ok) {
        const message = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
        const err = new Error(message);
        err.status = res.status;
        err.payload = data;
        throw err;
    }
    return data;
}

// =============================================
// Toasts
// =============================================
function toast(message, type = 'info') {
    const root = document.getElementById('toastRoot');
    if (!root) {
        // Fallback if toast container is missing
        if (type === 'error') alert(message);
        return;
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<i class="ph ${type === 'success' ? 'ph-check-circle' : type === 'error' ? 'ph-warning-circle' : 'ph-info'}"></i><span>${escapeHtml(message)}</span>`;
    root.appendChild(el);
    setTimeout(() => {
        el.classList.add('toast-out');
        setTimeout(() => el.remove(), 300);
    }, 3500);
}

// =============================================
// Homepage
// =============================================
async function loadHomeUsers() {
    try {
        const users = await api('GET', '/api/users');
        const homeSelect = document.getElementById('homeUserSelect');
        if (homeSelect) {
            homeSelect.innerHTML = users
                .map(u => `<option value="${u.id}">${escapeHtml(u.fullName)}</option>`)
                .join('');
        }
    } catch (e) {
        console.error('Error loading users:', e);
        toast(`Could not load users: ${e.message}`, 'error');
    }
}

function enterDashboard() {
    const homeSelect = document.getElementById('homeUserSelect');
    currentUserId = parseInt(homeSelect.value, 10);
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('dashboardApp').style.display = 'flex';
    loadDashboardUsers();
}

async function loadDashboardUsers() {
    try {
        allUsers = await api('GET', '/api/users');

        const currentUser = allUsers.find(u => u.id === currentUserId);
        const navAdmin = document.getElementById('navAdmin');
        if (navAdmin) {
            navAdmin.style.display = currentUser && currentUser.role === 'ADMIN' ? 'flex' : 'none';
        }

        const select = document.getElementById('userSelect');
        select.innerHTML = allUsers
            .map(u => `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>${escapeHtml(u.fullName)}</option>`)
            .join('');

        // Replace listener safely (no duplicate handlers).
        select.onchange = e => {
            currentUserId = parseInt(e.target.value, 10);
            loadDashboardUsers();
        };

        await fetchCategories();
        loadAccounts();
    } catch (e) {
        console.error(e);
        toast(`Failed to load dashboard: ${e.message}`, 'error');
    }
}

function goHome() {
    document.getElementById('dashboardApp').style.display = 'none';
    document.getElementById('homepage').style.display = 'block';
}

// =============================================
// Navigation
// =============================================
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', e => {
            const page = link.dataset.page;
            if (!page) return;
            e.preventDefault();
            showPage(page, link);
        });
    });
}

function showPage(page, linkElement) {
    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    linkElement.classList.add('active');

    document.getElementById('page-accounts').classList.add('hidden');
    document.getElementById('page-generic').classList.add('hidden');

    document.getElementById('pageTitle').innerText = pageMeta[page].t;
    document.getElementById('headerActions').innerHTML = pageMeta[page].a;

    closeModal();

    if (page === 'accounts' || page === 'dashboard') {
        document.getElementById('page-accounts').classList.remove('hidden');
        loadAccounts();
    } else {
        document.getElementById('page-generic').classList.remove('hidden');
        loadGenericModule(page);
    }
}

// =============================================
// Reference data
// =============================================
async function fetchCategories() {
    categories = await api('GET', '/api/categories');
}

async function fetchUserData() {
    const [w, d, t] = await Promise.all([
        api('GET', `/api/wallets/user/${currentUserId}`),
        api('GET', `/api/debts/user/${currentUserId}`),
        api('GET', `/api/transactions/user/${currentUserId}`)
    ]);
    wallets = w;
    debts = d;
    transactions = t;
}

// =============================================
// Accounts / Dashboard
// =============================================
async function loadAccounts() {
    try {
        await fetchUserData();
    } catch (e) {
        toast(`Could not load account data: ${e.message}`, 'error');
        return;
    }

    const groups = {
        'CASH':      { title: 'Cash & Bank',     items: [], amounts: 0, up: true  },
        'CREDIT':    { title: 'Credit Cards',    items: [], amounts: 0, up: false },
        'INVEST':    { title: 'Money Owed to Me', items: [], amounts: 0, up: true  },
        'LIABILITY': { title: 'Personal Debts',  items: [], amounts: 0, up: false }
    };

    let totalCashAssets = 0, totalInvestments = 0, totalCcDebt = 0, totalPersonalDebt = 0;

    wallets.forEach(w => {
        const balance = Number(w.balance) || 0;
        if (w.walletType === 'CREDIT_CARD') {
            groups['CREDIT'].amounts += balance;
            groups['CREDIT'].items.push(w);
            totalCcDebt += balance;
        } else {
            groups['CASH'].amounts += balance;
            groups['CASH'].items.push(w);
            totalCashAssets += balance;
        }
    });

    debts.filter(d => d.status !== 'PAID').forEach(d => {
        const remaining = Number(d.remainingAmount) || 0;
        if (d.type === 'DEBT') {
            groups['LIABILITY'].amounts += remaining;
            groups['LIABILITY'].items.push({ isDebt: true, ...d });
            totalPersonalDebt += remaining;
        } else {
            groups['INVEST'].amounts += remaining;
            groups['INVEST'].items.push({ isLoan: true, ...d });
            totalInvestments += remaining;
        }
    });

    const netAssets = totalCashAssets + totalInvestments;
    const netLiabilities = totalCcDebt + totalPersonalDebt;
    const netWorth = netAssets - netLiabilities;

    renderNetWorthSection(netWorth);
    renderAccountsCol(groups);
    renderSummaryCol(netAssets, netLiabilities, totalCashAssets, totalInvestments, totalCcDebt, totalPersonalDebt);
}

/**
 * Build a real net-worth time series from the user's transactions.
 * Strategy: walk transactions in chronological order, accumulate INCOME / EXPENSE,
 * then sample the running balance at evenly spaced points across the last 30 days.
 * The current balance (today's bucket) is anchored to the actual `currentNetWorth`.
 */
function buildNetWorthSeries(currentNetWorth) {
    const labels = [];
    const values = [];
    const buckets = 8;
    const now = new Date();
    const periodDays = 30;
    const msPerDay = 24 * 60 * 60 * 1000;

    const startDate = new Date(now.getTime() - periodDays * msPerDay);

    const sorted = [...transactions]
        .map(t => ({ ...t, _date: new Date(t.transactionDate) }))
        .sort((a, b) => a._date - b._date);

    let netDeltaInPeriod = 0;
    sorted.forEach(t => {
        if (t._date >= startDate) {
            netDeltaInPeriod += (t.type === 'INCOME' ? 1 : -1) * Number(t.amount || 0);
        }
    });
    const startNetWorth = currentNetWorth - netDeltaInPeriod;

    for (let i = 0; i < buckets; i++) {
        const cutoff = new Date(startDate.getTime() + ((i + 1) * (periodDays / buckets) * msPerDay));
        let runningDelta = 0;
        sorted.forEach(t => {
            if (t._date >= startDate && t._date <= cutoff) {
                runningDelta += (t.type === 'INCOME' ? 1 : -1) * Number(t.amount || 0);
            }
        });
        labels.push(cutoff.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        values.push(startNetWorth + runningDelta);
    }
    // Anchor the last bucket to the actual current net worth.
    if (values.length > 0) values[values.length - 1] = currentNetWorth;

    return { labels, values, startNetWorth };
}

function renderNetWorthSection(n) {
    const series = buildNetWorthSeries(n);
    const startNetWorth = series.startNetWorth;
    const change = n - startNetWorth;
    const changePct = Math.abs(startNetWorth) > 0.01 ? (change / Math.abs(startNetWorth)) * 100 : 0;
    const isUp = change >= 0;

    document.getElementById('netWorthValue').innerText = '৳' + formatNum(n);
    document.getElementById('netWorthChange').innerHTML =
        `<span class="${isUp ? 'text-green' : 'text-red'}">${isUp ? '↑' : '↓'} ৳${formatNum(Math.abs(change))} (${changePct.toFixed(1)}%) last 30 days</span>`;

    const ctx = document.getElementById('netWorthChart').getContext('2d');
    if (netWorthChartInstance) netWorthChartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    netWorthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: series.labels,
            datasets: [{
                data: series.values,
                borderColor: '#0ea5e9',
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => '৳' + formatNum(ctx.parsed.y)
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } } },
                y: {
                    grid: { color: '#f3f4f6' },
                    border: { display: false },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 10, family: 'Inter' },
                        callback: v => '৳' + (v / 1000).toFixed(1) + 'K'
                    }
                }
            }
        }
    });
}

/**
 * Compute change percentage for a single account/wallet over the last 30 days
 * by reversing transaction history. Used by the row "x% 1m change" chips so
 * the value is real, not hard-coded.
 */
function computeWalletChange(walletId) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let delta = 0;
    transactions.forEach(t => {
        if (t.walletId !== walletId) return;
        const d = new Date(t.transactionDate);
        if (d >= cutoff) {
            delta += (t.type === 'INCOME' ? 1 : -1) * Number(t.amount || 0);
        }
    });
    return delta;
}

function renderAccountsCol(groups) {
    let html = '';
    ['CASH', 'CREDIT', 'INVEST', 'LIABILITY'].forEach(key => {
        const g = groups[key];
        if (g.items.length === 0) return;

        // Group-level monthly change: sum of member deltas
        const groupDelta = g.items.reduce((sum, item) => {
            if (item.isDebt || item.isLoan) return sum;
            return sum + computeWalletChange(item.id);
        }, 0);
        const groupPct = g.amounts > 0 ? (groupDelta / g.amounts) * 100 : 0;
        const arrow = groupDelta >= 0 ? '↑' : '↓';
        const clr = groupDelta >= 0 ? 'text-green' : 'text-red';

        html += `<div class="acc-group">
            <div class="acc-group-header">
                <div class="acc-group-title">
                    <i class="ph ph-caret-down"></i> ${escapeHtml(g.title)}
                    <span class="acc-group-change ${clr}">${arrow} ${Math.abs(groupPct).toFixed(1)}% 30d</span>
                </div>
                <div class="acc-group-total">৳${formatNum(g.amounts)}</div>
            </div>`;

        g.items.forEach((item, i) => {
            const cid = `spark_${key}_${i}`;
            let name, sub, amt, time, logoColor, imgHtml, actions;

            if (item.isDebt || item.isLoan) {
                name = item.personName;
                sub = item.isDebt ? 'I owe' : 'Owed to me';
                amt = item.remainingAmount;
                time = item.dueDate ? 'Due: ' + formatDate(item.dueDate) : '';
                imgHtml = '<i class="ph ph-user"></i>';
                logoColor = '#6b7280';
                actions = `<button class="icon-btn" title="Edit" onclick="showEditDebt(${item.id})"><i class="ph ph-pencil-simple"></i></button>
                           <button class="icon-btn icon-btn-danger" title="Delete" onclick="deleteDebt(${item.id})"><i class="ph ph-trash"></i></button>`;
            } else {
                name = item.walletName;
                sub = (item.walletType || '').replace('_', ' ');
                amt = item.balance;
                const delta = computeWalletChange(item.id);
                time = (delta >= 0 ? '+' : '') + '৳' + formatNum(delta) + ' (30d)';
                const colorMap = { BANK: '#3b82f6', BKASH: '#e11d48', NAGAD: '#f97316', CREDIT_CARD: '#8b5cf6', CASH: '#10b981', ROCKET: '#6366f1' };
                logoColor = colorMap[item.walletType] || '#6b7280';
                const labelMap = { BANK: 'BK', BKASH: 'bK', NAGAD: 'NG', CREDIT_CARD: 'CC', CASH: '৳', ROCKET: 'RK' };
                imgHtml = `<span style="font-size:11px; font-weight:700">${escapeHtml(labelMap[item.walletType] || '')}</span>`;
                actions = `<button class="icon-btn" title="Edit" onclick="showEditWallet(${item.id})"><i class="ph ph-pencil-simple"></i></button>
                           <button class="icon-btn icon-btn-danger" title="Delete" onclick="deleteWallet(${item.id})"><i class="ph ph-trash"></i></button>`;
            }

            html += `<div class="acc-item">
                <div class="acc-item-left">
                    <div class="acc-item-logo" style="background:${logoColor}15; color:${logoColor}">${imgHtml}</div>
                    <div class="acc-item-info">
                        <div class="acc-item-name">${escapeHtml(name)}</div>
                        <div class="acc-item-type">${escapeHtml(sub)}</div>
                    </div>
                </div>
                <div class="acc-item-sparkline"><canvas id="${cid}"></canvas></div>
                <div class="acc-item-right">
                    <div class="acc-item-bal">৳${formatNum(amt)}</div>
                    <div class="acc-item-time">${escapeHtml(time)}</div>
                </div>
                <div class="acc-item-actions">${actions}</div>
            </div>`;
        });
        html += `</div>`;
    });
    document.getElementById('accountsListContainer').innerHTML = html ||
        '<div style="padding:40px; text-align:center; color:var(--text-muted)">No accounts yet. Click <strong>+ Add account</strong> to begin.</div>';

    ['CASH', 'CREDIT', 'INVEST', 'LIABILITY'].forEach(key => {
        groups[key].items.forEach((item, i) => {
            if (item.isDebt || item.isLoan) {
                drawSparklineFromValues(`spark_${key}_${i}`, [item.amount, item.remainingAmount]);
            } else {
                drawSparklineFromValues(`spark_${key}_${i}`, walletDailySeries(item.id, 12, item.balance));
            }
        });
    });
}

/**
 * Build a *real* sparkline series for a wallet:
 * walks transactions backwards from `now` to derive each day's running balance.
 */
function walletDailySeries(walletId, points, currentBalance) {
    const out = [];
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    let bal = currentBalance;
    const series = [bal];
    for (let i = 1; i < points; i++) {
        const dayStart = new Date(now.getTime() - i * dayMs);
        const dayEnd = new Date(now.getTime() - (i - 1) * dayMs);
        transactions.forEach(t => {
            if (t.walletId !== walletId) return;
            const d = new Date(t.transactionDate);
            if (d >= dayStart && d < dayEnd) {
                bal -= (t.type === 'INCOME' ? 1 : -1) * Number(t.amount || 0);
            }
        });
        series.push(bal);
    }
    return series.reverse();
}

function drawSparklineFromValues(id, values) {
    const canvas = document.getElementById(id);
    if (!canvas || !values || values.length < 2) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120;
    canvas.height = 30;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = (max - min) || 1;
    const trend = values[values.length - 1] - values[0];

    ctx.beginPath();
    ctx.strokeStyle = trend >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;
    values.forEach((pt, i) => {
        const x = (i / (values.length - 1)) * canvas.width;
        const y = canvas.height - 4 - ((pt - min) / range) * (canvas.height - 8);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function renderSummaryCol(aTot, lTot, cash, inv, cc, loan) {
    latestSummaryData = [aTot, lTot, cash, inv, cc, loan];

    const fmt = (val, total) => {
        if (summaryMode === 'percent') {
            return total > 0 ? (val / total * 100).toFixed(1) + '%' : '0%';
        }
        return '৳' + formatNum(val);
    };

    document.getElementById('sumAssetsVal').innerText = '৳' + formatNum(aTot);

    const assetData = [
        { l: 'Cash & Bank',  v: cash, c: '#0ea5e9' },
        { l: 'Money Owed', v: inv,  c: '#10b981' }
    ].filter(x => x.v > 0);

    const aTotal = assetData.reduce((s, x) => s + x.v, 0) || 1;
    document.getElementById('assetBarMulti').innerHTML = assetData
        .map(d => `<div style="width:${(d.v / aTotal) * 100}%; background:${d.c}"></div>`).join('');
    document.getElementById('assetBreakdown').innerHTML = assetData
        .map(d => `<div class="summary-legend-row">
            <div class="legend-label"><div class="legend-dot" style="background:${d.c}"></div> ${escapeHtml(d.l)}</div>
            <div style="font-weight: 500">${fmt(d.v, aTot)}</div>
        </div>`).join('');

    const liabData = [
        { l: 'Personal Debts', v: loan, c: '#eab308' },
        { l: 'Credit Cards',   v: cc,   c: '#ef4444' }
    ].filter(x => x.v > 0);

    const lTotalActual = liabData.reduce((s, x) => s + x.v, 0);
    document.getElementById('sumLiabsVal').innerText = '৳' + formatNum(lTotalActual);

    const denom = lTotalActual || 1;
    document.getElementById('liabBarMulti').innerHTML = liabData
        .map(d => `<div style="width:${(d.v / denom) * 100}%; background:${d.c}"></div>`).join('');
    document.getElementById('liabBreakdown').innerHTML = liabData
        .map(d => `<div class="summary-legend-row">
            <div class="legend-label"><div class="legend-dot" style="background:${d.c}"></div> ${escapeHtml(d.l)}</div>
            <div style="font-weight: 500">${fmt(d.v, lTotalActual)}</div>
        </div>`).join('');
}

function toggleSummaryMode(mode) {
    summaryMode = mode;
    document.getElementById('btnSumTotals').classList.toggle('active', mode === 'totals');
    document.getElementById('btnSumPercent').classList.toggle('active', mode === 'percent');
    if (latestSummaryData) renderSummaryCol(...latestSummaryData);
}

// =============================================
// Generic modules (table-based pages)
// =============================================
const REPORTS_CONTAINER_ID = 'reportsContainer';

async function loadGenericModule(page) {
    const section = document.querySelector('#page-generic .module-content');
    section.classList.remove('with-reports');

    const filterBar = document.getElementById('genericFilterBar');
    filterBar.innerHTML = '';

    const tableWrap = document.getElementById('genericTableWrap');
    tableWrap.style.display = '';
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td style="padding:32px; text-align:center; color:var(--text-muted)">Loading…</td></tr>';

    if (wallets.length === 0) {
        try { await fetchUserData(); } catch (_) { /* ignore */ }
    }

    try {
        if (page === 'transactions') {
            renderTransactionFilters(filterBar);
            await renderTransactionsTable();
        } else if (page === 'budgets') {
            await renderBudgets();
        } else if (page === 'bills') {
            await renderBills();
        } else if (page === 'goals') {
            await renderGoals();
        } else if (page === 'debts') {
            await renderDebts();
        } else if (page === 'reports') {
            tableWrap.style.display = 'none';
            await renderReports();
        } else if (page === 'admin') {
            await renderAdmin();
        }
    } catch (e) {
        console.error('Module load error:', e);
        tbody.innerHTML = `<tr><td style="padding:32px; text-align:center; color:var(--red)">${escapeHtml(e.message)}</td></tr>`;
        toast(`Failed to load ${page}: ${e.message}`, 'error');
    }
}

// ----- Transactions -----
function renderTransactionFilters(container) {
    const exp = categories.filter(c => c.type === 'EXPENSE');
    const inc = categories.filter(c => c.type === 'INCOME');
    container.innerHTML = `
        <input type="text" id="txKeyword" class="input filter-input" placeholder="Search description…" value="${escapeHtml(txFilters.keyword)}">
        <select id="txType" class="input filter-input">
            <option value="">All types</option>
            <option value="INCOME"  ${txFilters.type === 'INCOME'  ? 'selected' : ''}>Income</option>
            <option value="EXPENSE" ${txFilters.type === 'EXPENSE' ? 'selected' : ''}>Expense</option>
        </select>
        <select id="txCat" class="input filter-input">
            <option value="">All categories</option>
            <optgroup label="Income">${inc.map(c => `<option value="${c.id}" ${String(c.id) === String(txFilters.categoryId) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</optgroup>
            <optgroup label="Expense">${exp.map(c => `<option value="${c.id}" ${String(c.id) === String(txFilters.categoryId) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</optgroup>
        </select>
        <input type="date" id="txStart" class="input filter-input" value="${escapeHtml(txFilters.startDate)}" title="Start date">
        <input type="date" id="txEnd"   class="input filter-input" value="${escapeHtml(txFilters.endDate)}"   title="End date">
        <button class="btn btn-outline" onclick="clearTxFilters()">Clear</button>
    `;

    const debounced = debounce(() => {
        txFilters.keyword    = document.getElementById('txKeyword').value;
        txFilters.type       = document.getElementById('txType').value;
        txFilters.categoryId = document.getElementById('txCat').value;
        txFilters.startDate  = document.getElementById('txStart').value;
        txFilters.endDate    = document.getElementById('txEnd').value;
        renderTransactionsTable();
    }, 250);

    ['txKeyword', 'txType', 'txCat', 'txStart', 'txEnd'].forEach(id => {
        document.getElementById(id).addEventListener('input', debounced);
        document.getElementById(id).addEventListener('change', debounced);
    });
}

function clearTxFilters() {
    txFilters = { type: '', categoryId: '', startDate: '', endDate: '', keyword: '' };
    loadGenericModule('transactions');
}

async function renderTransactionsTable() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>Date</th><th>Description</th><th>Account</th>
        <th style="text-align:right">Amount</th><th>Category</th><th></th>
    </tr>`;

    const params = new URLSearchParams();
    if (txFilters.keyword)    params.append('keyword', txFilters.keyword);
    if (txFilters.type)       params.append('type', txFilters.type);
    if (txFilters.categoryId) params.append('categoryId', txFilters.categoryId);
    if (txFilters.startDate)  params.append('startDate', txFilters.startDate);
    if (txFilters.endDate)    params.append('endDate', txFilters.endDate);

    const txs = await api('GET', `/api/transactions/user/${currentUserId}/search?${params.toString()}`);

    if (!txs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--text-muted)">No transactions match your filters.</td></tr>';
        return;
    }
    tbody.innerHTML = txs.map(t => {
        const sign = t.type === 'INCOME' ? '+' : '−';
        const color = t.type === 'INCOME' ? 'var(--green)' : 'var(--red)';
        const wallet = wallets.find(w => w.id === t.walletId);
        return `<tr>
            <td>${escapeHtml(formatDate(t.transactionDate))}</td>
            <td>${escapeHtml(t.description || '—')}</td>
            <td>${escapeHtml(wallet ? wallet.walletName : '—')}</td>
            <td style="text-align:right; color:${color}; font-weight:600">${sign}৳${formatNum(t.amount)}</td>
            <td>${escapeHtml(getCategoryName(t.categoryId))}</td>
            <td class="row-actions">
                <button class="icon-btn" onclick="showEditTransaction(${t.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                <button class="icon-btn icon-btn-danger" onclick="deleteTransaction(${t.id})" title="Delete"><i class="ph ph-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ----- Budgets -----
async function renderBudgets() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>Category</th><th style="text-align:right">Spent</th><th style="text-align:right">Limit</th>
        <th>Progress</th><th>Status</th><th></th>
    </tr>`;

    const month = new Date().toISOString().slice(0, 7);
    const bgs = await api('GET', `/api/budgets/user/${currentUserId}/status/${month}`);

    if (!bgs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--text-muted)">No budgets set for this month.</td></tr>';
        return;
    }
    tbody.innerHTML = bgs.map(b => {
        const pc = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
        return `<tr>
            <td>${escapeHtml(getCategoryName(b.categoryId))}</td>
            <td style="text-align:right">৳${formatNum(b.spentAmount)}</td>
            <td style="text-align:right">৳${formatNum(b.limitAmount)}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px">
                        <div style="width:${Math.min(pc, 100)}%;height:6px;background:${b.isOverBudget ? 'var(--red)' : 'var(--green)'};border-radius:3px"></div>
                    </div>
                    <span style="font-size:0.75rem">${pc.toFixed(0)}%</span>
                </div>
            </td>
            <td style="color:${b.isOverBudget ? 'var(--red)' : 'var(--green)'};font-weight:500">
                ${b.isOverBudget ? 'Over Budget' : 'On Track'}
            </td>
            <td class="row-actions">
                <button class="icon-btn" onclick="showEditBudget(${b.budgetId})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                <button class="icon-btn icon-btn-danger" onclick="deleteBudget(${b.budgetId})" title="Delete"><i class="ph ph-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ----- Recurring Bills -----
async function renderBills() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>Bill Name</th><th style="text-align:right">Amount</th><th>Frequency</th>
        <th>Next Due</th><th>Status</th><th></th>
    </tr>`;
    const bills = await api('GET', `/api/recurring-bills/user/${currentUserId}`);
    if (!bills.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--text-muted)">No recurring bills.</td></tr>';
        return;
    }
    tbody.innerHTML = bills.map(b => `<tr>
        <td style="font-weight:500">${escapeHtml(b.billName)}</td>
        <td style="text-align:right; font-weight:600">৳${formatNum(b.amount)}</td>
        <td>${escapeHtml(b.frequency)}</td>
        <td>${escapeHtml(formatDate(b.nextDueDate))}</td>
        <td style="color:${b.isActive ? 'var(--green)' : 'var(--text-muted)'}">${b.isActive ? 'Active' : 'Inactive'}</td>
        <td class="row-actions">
            <button class="icon-btn" onclick="showEditBill(${b.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
            <button class="icon-btn icon-btn-danger" onclick="deleteBill(${b.id})" title="Delete"><i class="ph ph-trash"></i></button>
        </td>
    </tr>`).join('');
}

// ----- Goals -----
async function renderGoals() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>Goal</th><th style="text-align:right">Target</th><th style="text-align:right">Saved</th>
        <th>Progress</th><th>Status</th><th></th>
    </tr>`;
    const gls = await api('GET', `/api/goals/user/${currentUserId}`);
    if (!gls.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--text-muted)">No savings goals yet.</td></tr>';
        return;
    }
    tbody.innerHTML = gls.map(g => {
        const pc = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        const isCompleted = g.status === 'COMPLETED';
        return `<tr>
            <td style="font-weight:500">${escapeHtml(g.goalName)}</td>
            <td style="text-align:right">৳${formatNum(g.targetAmount)}</td>
            <td style="text-align:right; font-weight:600">৳${formatNum(g.currentAmount)}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px">
                        <div style="width:${Math.min(pc, 100)}%;height:6px;background:${isCompleted ? 'var(--green)' : 'var(--blue)'};border-radius:3px"></div>
                    </div>
                    <span style="font-size:0.75rem">${pc.toFixed(0)}%</span>
                </div>
            </td>
            <td>${escapeHtml(g.status)}</td>
            <td class="row-actions">
                ${isCompleted ? '' : `<button class="icon-btn icon-btn-primary" onclick="addToGoal(${g.id})" title="Add funds"><i class="ph ph-plus-circle"></i></button>`}
                <button class="icon-btn" onclick="showEditGoal(${g.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                <button class="icon-btn icon-btn-danger" onclick="deleteGoal(${g.id})" title="Delete"><i class="ph ph-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ----- Debts -----
async function renderDebts() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>Person</th><th>Type</th>
        <th style="text-align:right">Total</th><th style="text-align:right">Remaining</th>
        <th>Due</th><th>Status</th><th></th>
    </tr>`;
    const dts = await api('GET', `/api/debts/user/${currentUserId}`);
    if (!dts.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--text-muted)">No debt or loan records.</td></tr>';
        return;
    }
    tbody.innerHTML = dts.map(d => `<tr>
        <td style="font-weight:500">${escapeHtml(d.personName)}</td>
        <td style="color:${d.type === 'DEBT' ? 'var(--red)' : 'var(--green)'};font-weight:600">${d.type === 'DEBT' ? 'I Owe' : 'Owed to Me'}</td>
        <td style="text-align:right">৳${formatNum(d.amount)}</td>
        <td style="text-align:right; font-weight:600">৳${formatNum(d.remainingAmount)}</td>
        <td>${escapeHtml(formatDate(d.dueDate))}</td>
        <td>${escapeHtml(d.status)}</td>
        <td class="row-actions">
            ${d.status !== 'PAID' ? `<button class="icon-btn icon-btn-primary" onclick="makePayment(${d.id})" title="Record payment"><i class="ph ph-currency-circle-dollar"></i></button>` : ''}
            <button class="icon-btn" onclick="showEditDebt(${d.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
            <button class="icon-btn icon-btn-danger" onclick="deleteDebt(${d.id})" title="Delete"><i class="ph ph-trash"></i></button>
        </td>
    </tr>`).join('');
}

// ----- Reports -----
async function renderReports() {
    const section = document.querySelector('#page-generic .module-content');
    let container = document.getElementById(REPORTS_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = REPORTS_CONTAINER_ID;
        section.appendChild(container);
    }
    container.innerHTML = '<div style="padding:32px; text-align:center; color:var(--text-muted)">Generating report…</div>';

    const month = new Date().toISOString().slice(0, 7);
    const r = await api('GET', `/api/reports/user/${currentUserId}/monthly/${month}`);
    const insights = await api('GET', `/api/reports/user/${currentUserId}/insights`);
    const netClass = r.netSavings >= 0 ? 'text-green' : 'text-red';

    const expenseRows = Object.entries(r.expenseByCategory || {})
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([cid, amt]) => `<tr>
            <td>${escapeHtml(getCategoryName(Number(cid)))}</td>
            <td style="text-align:right">৳${formatNum(amt)}</td>
        </tr>`).join('');

    const incomeRows = Object.entries(r.incomeByCategory || {})
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([cid, amt]) => `<tr>
            <td>${escapeHtml(getCategoryName(Number(cid)))}</td>
            <td style="text-align:right">৳${formatNum(amt)}</td>
        </tr>`).join('');

    let insightsHtml;
    if (insights && insights.length > 0) {
        insightsHtml = `<ul style="margin:0; padding-left:20px; color:#856404; line-height:1.7;">
            ${insights.map(i => `<li>You spent <strong>৳${formatNum(i.userSpending)}</strong> on <strong>${escapeHtml(i.categoryName)}</strong>, higher than the platform average of <strong>৳${formatNum(i.averageSpending)}</strong>.</li>`).join('')}
        </ul>`;
    } else {
        insightsHtml = `<p style="margin:0; color:#856404; font-size:0.9rem;">Great job — your spending is at or below the platform average across all categories.</p>`;
    }

    container.innerHTML = `
        <div class="report-stats">
            <div class="report-stat-card"><div class="report-stat-label">Total Income</div><div class="report-stat-value text-green">৳${formatNum(r.totalIncome)}</div></div>
            <div class="report-stat-card"><div class="report-stat-label">Total Expense</div><div class="report-stat-value text-red">৳${formatNum(r.totalExpense)}</div></div>
            <div class="report-stat-card"><div class="report-stat-label">Net Savings</div><div class="report-stat-value ${netClass}">৳${formatNum(r.netSavings)}</div></div>
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin: 8px 0 24px;">Report for <strong>${escapeHtml(month)}</strong> — ${r.transactionCount} transactions processed</div>

        <div class="report-grid">
            <div class="report-card">
                <h4>Expenses by Category</h4>
                <table class="data-table"><tbody>${expenseRows || '<tr><td colspan="2" style="text-align:center; color:var(--text-muted)">No expenses this month</td></tr>'}</tbody></table>
            </div>
            <div class="report-card">
                <h4>Income by Category</h4>
                <table class="data-table"><tbody>${incomeRows || '<tr><td colspan="2" style="text-align:center; color:var(--text-muted)">No income this month</td></tr>'}</tbody></table>
            </div>
        </div>

        <div class="insights-card">
            <h3><i class="ph ph-warning-circle"></i> Spending Insights vs. Platform Average</h3>
            ${insightsHtml}
        </div>
    `;
}

// ----- Admin -----
async function renderAdmin() {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    thead.innerHTML = `<tr>
        <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
        <th style="text-align:right">Total Balance</th><th style="text-align:right">Total Debt</th>
        <th></th>
    </tr>`;
    const all = await api('GET', '/api/users/admin/summary');
    if (!all.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--text-muted)">No users found.</td></tr>';
        return;
    }
    tbody.innerHTML = all.map(u => {
        const isSelf = u.id === currentUserId;
        return `<tr>
            <td style="color:var(--text-muted)">#${u.id}</td>
            <td style="font-weight:500">${escapeHtml(u.fullName)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}">${escapeHtml(u.role)}</span></td>
            <td style="text-align:right; font-weight:600; color:var(--green)">৳${formatNum(u.totalBalance)}</td>
            <td style="text-align:right; font-weight:600; color:var(--red)">৳${formatNum(u.totalDebt)}</td>
            <td class="row-actions">
                <button class="icon-btn" onclick="showEditUser(${u.id})" title="Edit user"><i class="ph ph-pencil-simple"></i></button>
                <button class="icon-btn icon-btn-danger" onclick="deleteUser(${u.id})" title="Delete user" ${isSelf ? 'disabled' : ''}><i class="ph ph-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// =============================================
// Modals & forms
// =============================================
function showModal(title, html) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

/** Disables the submit button while running `fn` to prevent double submits. */
async function withSubmit(btn, fn) {
    if (!btn) return fn();
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Working…';
    try { return await fn(); }
    finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
}

// ----- Wallets -----
function showAddWallet() {
    showModal('Add Account', `
        <div class="group"><label>Name</label><input class="input" id="wfName" placeholder="e.g. Dutch-Bangla Bank" required></div>
        <div class="group"><label>Type</label>
            <select class="input" id="wfType">
                <option value="BANK">Bank</option><option value="CASH">Cash</option>
                <option value="BKASH">bKash</option><option value="NAGAD">Nagad</option>
                <option value="ROCKET">Rocket</option><option value="CREDIT_CARD">Credit Card</option>
            </select>
        </div>
        <div class="group"><label>Balance (৳)</label><input class="input" type="number" step="0.01" min="0" id="wfBal" value="0"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="wfSubmit" onclick="submitWallet(this)">Save</button>
        </div>
    `);
}
async function submitWallet(btn) {
    const payload = {
        userId: currentUserId,
        walletName: document.getElementById('wfName').value.trim(),
        walletType: document.getElementById('wfType').value,
        balance: parseFloat(document.getElementById('wfBal').value) || 0,
        currency: 'BDT'
    };
    if (!payload.walletName) return toast('Account name is required', 'error');
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/wallets', payload);
            toast('Account created', 'success');
            closeModal();
            loadAccounts();
        } catch (e) { toast(e.message, 'error'); }
    });
}

function showEditWallet(id) {
    const w = wallets.find(x => x.id === id);
    if (!w) return;
    showModal('Edit Account', `
        <div class="group"><label>Name</label><input class="input" id="wfName" value="${escapeHtml(w.walletName)}"></div>
        <div class="group"><label>Type</label>
            <select class="input" id="wfType">
                ${['BANK','CASH','BKASH','NAGAD','ROCKET','CREDIT_CARD'].map(t => `<option ${w.walletType === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
        </div>
        <div class="group"><label>Balance (৳)</label><input class="input" type="number" step="0.01" id="wfBal" value="${w.balance}"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="wfSubmit" onclick="submitEditWallet(this, ${id})">Save</button>
        </div>
    `);
}
async function submitEditWallet(btn, id) {
    const w = wallets.find(x => x.id === id);
    const payload = {
        userId: w.userId,
        walletName: document.getElementById('wfName').value.trim(),
        walletType: document.getElementById('wfType').value,
        balance: parseFloat(document.getElementById('wfBal').value) || 0,
        currency: w.currency || 'BDT'
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/wallets/${id}`, payload);
            toast('Account updated', 'success');
            closeModal();
            loadAccounts();
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteWallet(id) {
    if (!confirm('Delete this account? All linked transactions will also be removed.')) return;
    try {
        await api('DELETE', `/api/wallets/${id}`);
        toast('Account deleted', 'success');
        loadAccounts();
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Transactions -----
function transactionFormHtml(prefill = {}) {
    const exp = categories.filter(c => c.type === 'EXPENSE')
        .map(c => `<option value="${c.id}" ${c.id === prefill.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    const inc = categories.filter(c => c.type === 'INCOME')
        .map(c => `<option value="${c.id}" ${c.id === prefill.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    const wOpts = wallets.map(w => `<option value="${w.id}" ${w.id === prefill.walletId ? 'selected' : ''}>${escapeHtml(w.walletName)}</option>`).join('');
    const dt = prefill.transactionDate ? prefill.transactionDate.slice(0, 16) : new Date().toISOString().slice(0, 16);
    return `
        <div class="group"><label>Type</label>
            <select class="input" id="tfType">
                <option value="EXPENSE" ${prefill.type === 'EXPENSE' ? 'selected' : ''}>Expense</option>
                <option value="INCOME"  ${prefill.type === 'INCOME'  ? 'selected' : ''}>Income</option>
            </select>
        </div>
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="tfAmt" value="${prefill.amount ?? ''}" required></div>
        <div class="group"><label>Account</label><select class="input" id="tfWal">${wOpts}</select></div>
        <div class="group"><label>Category</label>
            <select class="input" id="tfCat">
                <optgroup label="Expense">${exp}</optgroup>
                <optgroup label="Income">${inc}</optgroup>
            </select>
        </div>
        <div class="group"><label>Description</label><input class="input" id="tfDesc" placeholder="What was this for?" value="${escapeHtml(prefill.description || '')}"></div>
        <div class="group"><label>Date</label><input class="input" type="datetime-local" id="tfDate" value="${dt}"></div>
    `;
}

function showAddTransaction() {
    showModal('Log Transaction', `${transactionFormHtml()}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="tfSubmit" onclick="submitTransaction(this)">Save</button>
        </div>`);
}
async function submitTransaction(btn) {
    const amt = parseFloat(document.getElementById('tfAmt').value);
    if (!amt || amt <= 0) return toast('Amount must be greater than 0', 'error');
    const payload = {
        userId: currentUserId,
        walletId: parseInt(document.getElementById('tfWal').value, 10),
        categoryId: parseInt(document.getElementById('tfCat').value, 10) || null,
        type: document.getElementById('tfType').value,
        amount: amt,
        description: document.getElementById('tfDesc').value.trim(),
        transactionDate: document.getElementById('tfDate').value + ':00'
    };
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/transactions', payload);
            toast('Transaction logged', 'success');
            closeModal();
            await fetchUserData();
            loadGenericModule('transactions');
        } catch (e) { toast(e.message, 'error'); }
    });
}

async function showEditTransaction(id) {
    let t;
    try { t = await api('GET', `/api/transactions/${id}`); }
    catch (e) { return toast(e.message, 'error'); }
    showModal('Edit Transaction', `${transactionFormHtml(t)}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="tfSubmit" onclick="submitEditTransaction(this, ${id})">Save</button>
        </div>`);
}
async function submitEditTransaction(btn, id) {
    const amt = parseFloat(document.getElementById('tfAmt').value);
    if (!amt || amt <= 0) return toast('Amount must be greater than 0', 'error');
    const payload = {
        userId: currentUserId,
        walletId: parseInt(document.getElementById('tfWal').value, 10),
        categoryId: parseInt(document.getElementById('tfCat').value, 10) || null,
        type: document.getElementById('tfType').value,
        amount: amt,
        description: document.getElementById('tfDesc').value.trim(),
        transactionDate: document.getElementById('tfDate').value + ':00'
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/transactions/${id}`, payload);
            toast('Transaction updated', 'success');
            closeModal();
            await fetchUserData();
            loadGenericModule('transactions');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteTransaction(id) {
    if (!confirm('Delete this transaction? Wallet balance will be reverted.')) return;
    try {
        await api('DELETE', `/api/transactions/${id}`);
        toast('Transaction deleted', 'success');
        await fetchUserData();
        loadGenericModule('transactions');
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Budgets -----
function showAddBudget() {
    const exp = categories.filter(c => c.type === 'EXPENSE')
        .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    showModal('Set Budget', `
        <div class="group"><label>Category</label><select class="input" id="bfCat">${exp}</select></div>
        <div class="group"><label>Month (YYYY-MM)</label><input class="input" id="bfMonth" value="${new Date().toISOString().slice(0,7)}"></div>
        <div class="group"><label>Limit (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="bfLimit"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="bfSubmit" onclick="submitBudget(this)">Save</button>
        </div>
    `);
}
async function submitBudget(btn) {
    const amt = parseFloat(document.getElementById('bfLimit').value);
    if (!amt || amt <= 0) return toast('Limit must be greater than 0', 'error');
    const payload = {
        userId: currentUserId,
        categoryId: parseInt(document.getElementById('bfCat').value, 10),
        budgetMonth: document.getElementById('bfMonth').value.trim(),
        limitAmount: amt
    };
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/budgets', payload);
            toast('Budget saved', 'success');
            closeModal();
            loadGenericModule('budgets');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function showEditBudget(id) {
    showModal('Edit Budget', `
        <div class="group"><label>Limit (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="bfLimit"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="bfSubmit" onclick="submitEditBudget(this, ${id})">Save</button>
        </div>`);
}
async function submitEditBudget(btn, id) {
    const amt = parseFloat(document.getElementById('bfLimit').value);
    if (!amt || amt <= 0) return toast('Limit must be greater than 0', 'error');
    await withSubmit(btn, async () => {
        try {
            // Fetch existing budget so we keep userId/category/month consistent
            const res = await api('GET', `/api/budgets/user/${currentUserId}`);
            const existing = res.find(b => b.id === id);
            if (!existing) throw new Error('Budget not found');
            existing.limitAmount = amt;
            await api('PUT', `/api/budgets/${id}`, existing);
            toast('Budget updated', 'success');
            closeModal();
            loadGenericModule('budgets');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteBudget(id) {
    if (!confirm('Delete this budget?')) return;
    try {
        await api('DELETE', `/api/budgets/${id}`);
        toast('Budget deleted', 'success');
        loadGenericModule('budgets');
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Recurring Bills -----
function billFormHtml(prefill = {}) {
    const exp = categories.filter(c => c.type === 'EXPENSE')
        .map(c => `<option value="${c.id}" ${c.id === prefill.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    const wOpts = wallets.map(w => `<option value="${w.id}" ${w.id === prefill.walletId ? 'selected' : ''}>${escapeHtml(w.walletName)}</option>`).join('');
    return `
        <div class="group"><label>Name</label><input class="input" id="rbName" value="${escapeHtml(prefill.billName || '')}" required></div>
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="rbAmt" value="${prefill.amount ?? ''}" required></div>
        <div class="group"><label>Frequency</label>
            <select class="input" id="rbFreq">
                ${['DAILY','WEEKLY','MONTHLY','YEARLY'].map(f => `<option ${prefill.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
        </div>
        <div class="group"><label>Category</label><select class="input" id="rbCat">${exp}</select></div>
        <div class="group"><label>Account</label><select class="input" id="rbWal">${wOpts}</select></div>
        <div class="group"><label>Next Due</label><input class="input" type="date" id="rbDate" value="${escapeHtml(prefill.nextDueDate || '')}" required></div>
    `;
}
function showAddBill() {
    showModal('Add Recurring Bill', `${billFormHtml()}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="rbSubmit" onclick="submitBill(this)">Save</button>
        </div>`);
}
async function submitBill(btn) {
    const amt = parseFloat(document.getElementById('rbAmt').value);
    if (!amt || amt <= 0) return toast('Amount must be greater than 0', 'error');
    const dueDate = document.getElementById('rbDate').value;
    if (!dueDate) return toast('Next due date is required', 'error');
    const payload = {
        userId: currentUserId,
        billName: document.getElementById('rbName').value.trim(),
        amount: amt,
        frequency: document.getElementById('rbFreq').value,
        categoryId: parseInt(document.getElementById('rbCat').value, 10) || null,
        walletId: parseInt(document.getElementById('rbWal').value, 10) || null,
        nextDueDate: dueDate,
        isActive: true
    };
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/recurring-bills', payload);
            toast('Bill added', 'success');
            closeModal();
            loadGenericModule('bills');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function showEditBill(id) {
    let bill;
    try {
        const list = await api('GET', `/api/recurring-bills/user/${currentUserId}`);
        bill = list.find(b => b.id === id);
    } catch (e) { return toast(e.message, 'error'); }
    if (!bill) return toast('Bill not found', 'error');
    showModal('Edit Recurring Bill', `${billFormHtml(bill)}
        <div class="group"><label>Active</label>
            <select class="input" id="rbActive">
                <option value="true"  ${bill.isActive ? 'selected' : ''}>Yes</option>
                <option value="false" ${!bill.isActive ? 'selected' : ''}>No</option>
            </select>
        </div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="rbSubmit" onclick="submitEditBill(this, ${id})">Save</button>
        </div>`);
}
async function submitEditBill(btn, id) {
    const payload = {
        userId: currentUserId,
        billName: document.getElementById('rbName').value.trim(),
        amount: parseFloat(document.getElementById('rbAmt').value) || 0,
        frequency: document.getElementById('rbFreq').value,
        categoryId: parseInt(document.getElementById('rbCat').value, 10) || null,
        walletId: parseInt(document.getElementById('rbWal').value, 10) || null,
        nextDueDate: document.getElementById('rbDate').value,
        isActive: document.getElementById('rbActive').value === 'true'
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/recurring-bills/${id}`, payload);
            toast('Bill updated', 'success');
            closeModal();
            loadGenericModule('bills');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteBill(id) {
    if (!confirm('Delete this recurring bill?')) return;
    try {
        await api('DELETE', `/api/recurring-bills/${id}`);
        toast('Bill deleted', 'success');
        loadGenericModule('bills');
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Goals -----
function goalFormHtml(prefill = {}) {
    return `
        <div class="group"><label>Goal Name</label><input class="input" id="gfName" placeholder="e.g. Emergency Fund" value="${escapeHtml(prefill.goalName || '')}" required></div>
        <div class="group"><label>Target Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="gfTarget" value="${prefill.targetAmount ?? ''}" required></div>
        <div class="group"><label>Saved So Far (৳)</label><input class="input" type="number" step="0.01" min="0" id="gfCurrent" value="${prefill.currentAmount ?? 0}"></div>
        <div class="group"><label>Deadline</label><input class="input" type="date" id="gfDeadline" value="${escapeHtml(prefill.deadline || '')}"></div>
    `;
}
function showAddGoal() {
    showModal('Add Goal', `${goalFormHtml()}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="gfSubmit" onclick="submitGoal(this)">Save</button>
        </div>`);
}
async function submitGoal(btn) {
    const target = parseFloat(document.getElementById('gfTarget').value);
    if (!target || target <= 0) return toast('Target must be greater than 0', 'error');
    const payload = {
        userId: currentUserId,
        goalName: document.getElementById('gfName').value.trim(),
        targetAmount: target,
        currentAmount: parseFloat(document.getElementById('gfCurrent').value) || 0,
        deadline: document.getElementById('gfDeadline').value || null,
        status: 'IN_PROGRESS'
    };
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/goals', payload);
            toast('Goal created', 'success');
            closeModal();
            loadGenericModule('goals');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function showEditGoal(id) {
    let goal;
    try { goal = await api('GET', `/api/goals/${id}`); }
    catch (e) { return toast(e.message, 'error'); }
    showModal('Edit Goal', `${goalFormHtml(goal)}
        <div class="group"><label>Status</label>
            <select class="input" id="gfStatus">
                ${['IN_PROGRESS','COMPLETED','CANCELLED'].map(s => `<option ${goal.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        </div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="gfSubmit" onclick="submitEditGoal(this, ${id})">Save</button>
        </div>`);
}
async function submitEditGoal(btn, id) {
    const payload = {
        userId: currentUserId,
        goalName: document.getElementById('gfName').value.trim(),
        targetAmount: parseFloat(document.getElementById('gfTarget').value) || 0,
        currentAmount: parseFloat(document.getElementById('gfCurrent').value) || 0,
        deadline: document.getElementById('gfDeadline').value || null,
        status: document.getElementById('gfStatus').value
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/goals/${id}`, payload);
            toast('Goal updated', 'success');
            closeModal();
            loadGenericModule('goals');
        } catch (e) { toast(e.message, 'error'); }
    });
}
function addToGoal(id) {
    showModal('Contribute to Goal', `
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="gfAddAmt" placeholder="e.g. 5000"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="gfAddSubmit" onclick="submitAddToGoal(this, ${id})">Add Funds</button>
        </div>
    `);
}
async function submitAddToGoal(btn, id) {
    const amount = parseFloat(document.getElementById('gfAddAmt').value);
    if (!amount || amount <= 0) return toast('Amount must be greater than 0', 'error');
    await withSubmit(btn, async () => {
        try {
            await api('POST', `/api/goals/${id}/add`, { amount });
            toast('Contribution recorded', 'success');
            closeModal();
            loadGenericModule('goals');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    try {
        await api('DELETE', `/api/goals/${id}`);
        toast('Goal deleted', 'success');
        loadGenericModule('goals');
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Debts / Loans -----
function debtFormHtml(prefill = {}) {
    return `
        <div class="group"><label>Type</label>
            <select class="input" id="dfType">
                <option value="DEBT" ${prefill.type === 'DEBT' ? 'selected' : ''}>I Borrowed (Debt)</option>
                <option value="LOAN" ${prefill.type === 'LOAN' ? 'selected' : ''}>I Lent (Loan)</option>
            </select>
        </div>
        <div class="group"><label>Person Name</label><input class="input" id="dfPerson" value="${escapeHtml(prefill.personName || '')}" required></div>
        <div class="group"><label>Total Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="dfAmt" value="${prefill.amount ?? ''}" required></div>
        <div class="group"><label>Remaining (৳)</label><input class="input" type="number" step="0.01" min="0" id="dfRemaining" value="${prefill.remainingAmount ?? prefill.amount ?? ''}"></div>
        <div class="group"><label>Description</label><input class="input" id="dfDesc" value="${escapeHtml(prefill.description || '')}"></div>
        <div class="group"><label>Due Date</label><input class="input" type="date" id="dfDue" value="${escapeHtml(prefill.dueDate || '')}"></div>
    `;
}
function showAddDebt() {
    showModal('Log Debt/Loan', `${debtFormHtml()}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="dfSubmit" onclick="submitDebt(this)">Save</button>
        </div>`);
}
async function submitDebt(btn) {
    const amt = parseFloat(document.getElementById('dfAmt').value);
    if (!amt || amt <= 0) return toast('Amount must be greater than 0', 'error');
    const remaining = parseFloat(document.getElementById('dfRemaining').value);
    const remainingValue = isNaN(remaining) ? amt : remaining;
    if (remainingValue > amt) return toast('Remaining cannot exceed total amount', 'error');
    const payload = {
        userId: currentUserId,
        type: document.getElementById('dfType').value,
        personName: document.getElementById('dfPerson').value.trim(),
        amount: amt,
        remainingAmount: remainingValue,
        description: document.getElementById('dfDesc').value.trim(),
        dueDate: document.getElementById('dfDue').value || null,
        status: remainingValue === 0 ? 'PAID' : (remainingValue < amt ? 'PARTIALLY_PAID' : 'PENDING')
    };
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/debts', payload);
            toast('Record saved', 'success');
            closeModal();
            await fetchUserData();
            loadGenericModule('debts');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function showEditDebt(id) {
    let d;
    try { d = await api('GET', `/api/debts/${id}`); }
    catch (e) { return toast(e.message, 'error'); }
    showModal('Edit Debt/Loan', `${debtFormHtml(d)}
        <div class="group"><label>Status</label>
            <select class="input" id="dfStatus">
                ${['PENDING','PARTIALLY_PAID','PAID'].map(s => `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        </div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="dfSubmit" onclick="submitEditDebt(this, ${id})">Save</button>
        </div>`);
}
async function submitEditDebt(btn, id) {
    const amt = parseFloat(document.getElementById('dfAmt').value);
    const remaining = parseFloat(document.getElementById('dfRemaining').value) || 0;
    if (remaining > amt) return toast('Remaining cannot exceed total amount', 'error');
    const payload = {
        userId: currentUserId,
        type: document.getElementById('dfType').value,
        personName: document.getElementById('dfPerson').value.trim(),
        amount: amt,
        remainingAmount: remaining,
        description: document.getElementById('dfDesc').value.trim(),
        dueDate: document.getElementById('dfDue').value || null,
        status: document.getElementById('dfStatus').value
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/debts/${id}`, payload);
            toast('Record updated', 'success');
            closeModal();
            await fetchUserData();
            loadGenericModule('debts');
        } catch (e) { toast(e.message, 'error'); }
    });
}
function makePayment(id) {
    showModal('Record Payment', `
        <div class="group"><label>Payment Amount (৳)</label><input class="input" type="number" step="0.01" min="0.01" id="dfPayAmt" placeholder="e.g. 2000"></div>
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="dfPaySubmit" onclick="submitMakePayment(this, ${id})">Submit Payment</button>
        </div>
    `);
}
async function submitMakePayment(btn, id) {
    const amount = parseFloat(document.getElementById('dfPayAmt').value);
    if (!amount || amount <= 0) return toast('Amount must be greater than 0', 'error');
    await withSubmit(btn, async () => {
        try {
            await api('POST', `/api/debts/${id}/pay`, { amount });
            toast('Payment recorded', 'success');
            closeModal();
            await fetchUserData();
            loadGenericModule('debts');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteDebt(id) {
    if (!confirm('Delete this debt/loan record?')) return;
    try {
        await api('DELETE', `/api/debts/${id}`);
        toast('Record deleted', 'success');
        await fetchUserData();
        loadGenericModule('debts');
    } catch (e) { toast(e.message, 'error'); }
}

// ----- Admin / Users -----
function userFormHtml(prefill = {}) {
    return `
        <div class="group"><label>Full Name</label><input class="input" id="ufName" value="${escapeHtml(prefill.fullName || '')}" required></div>
        <div class="group"><label>Email</label><input class="input" type="email" id="ufEmail" value="${escapeHtml(prefill.email || '')}" required></div>
        <div class="group"><label>Phone</label><input class="input" id="ufPhone" value="${escapeHtml(prefill.phone || '')}" placeholder="01712345678"></div>
        <div class="group"><label>Role</label>
            <select class="input" id="ufRole">
                <option value="USER"  ${prefill.role === 'USER'  ? 'selected' : ''}>User</option>
                <option value="ADMIN" ${prefill.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
            </select>
        </div>
    `;
}
function showAddUser() {
    showModal('Add User', `${userFormHtml({ role: 'USER' })}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="ufSubmit" onclick="submitUser(this)">Save User</button>
        </div>`);
}
async function submitUser(btn) {
    const payload = {
        fullName: document.getElementById('ufName').value.trim(),
        email: document.getElementById('ufEmail').value.trim(),
        phone: document.getElementById('ufPhone').value.trim(),
        role: document.getElementById('ufRole').value
    };
    if (!payload.fullName || !payload.email) return toast('Name and email are required', 'error');
    await withSubmit(btn, async () => {
        try {
            await api('POST', '/api/users', payload);
            toast('User created', 'success');
            closeModal();
            loadDashboardUsers();
            loadGenericModule('admin');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function showEditUser(id) {
    let u;
    try { u = await api('GET', `/api/users/${id}`); }
    catch (e) { return toast(e.message, 'error'); }
    showModal('Edit User', `${userFormHtml(u)}
        <div class="actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-orange" id="ufSubmit" onclick="submitEditUser(this, ${id})">Save</button>
        </div>`);
}
async function submitEditUser(btn, id) {
    const payload = {
        fullName: document.getElementById('ufName').value.trim(),
        email: document.getElementById('ufEmail').value.trim(),
        phone: document.getElementById('ufPhone').value.trim(),
        role: document.getElementById('ufRole').value
    };
    await withSubmit(btn, async () => {
        try {
            await api('PUT', `/api/users/${id}`, payload);
            toast('User updated', 'success');
            closeModal();
            loadDashboardUsers();
            loadGenericModule('admin');
        } catch (e) { toast(e.message, 'error'); }
    });
}
async function deleteUser(id) {
    if (id === currentUserId) return toast('You cannot delete yourself', 'error');
    if (!confirm('Delete this user? All their data will be lost.')) return;
    try {
        await api('DELETE', `/api/users/${id}`);
        toast('User deleted', 'success');
        loadDashboardUsers();
        loadGenericModule('admin');
    } catch (e) { toast(e.message, 'error'); }
}

// =============================================
// Utilities
// =============================================
function formatNum(n) {
    return parseFloat(n || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function formatDate(dStr) {
    if (!dStr) return '—';
    return new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getCategoryName(id) {
    const c = categories.find(c => c.id === id);
    return c ? c.name : 'Uncategorized';
}
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function debounce(fn, wait) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}
