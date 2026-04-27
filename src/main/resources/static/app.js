// =============================================
// Taka Bachai — Complete Frontend Logic
// =============================================

const API = 'https://taka-bachai.onrender.com';
let currentUserId = 1;
let categories = [];
let wallets = [];
let debts = [];
let allUsers = [];
let netWorthChartInstance = null;
let summaryMode = 'totals';
let latestSummaryData = null;
const pageMeta = {
    'dashboard': { t: 'Dashboard', a: '' },
    'accounts': { t: 'Accounts', a: '<button class="btn btn-outline" onclick="loadAccounts()"><i class="ph ph-arrows-clockwise"></i> Refresh all</button><button class="btn btn-orange" onclick="showAddWallet()">+ Add account</button>' },
    'transactions': { t: 'Transactions', a: '<button class="btn btn-orange" onclick="showAddTransaction()">+ Add transaction</button>' },
    'budgets': { t: 'Budgets', a: '<button class="btn btn-orange" onclick="showAddBudget()">+ Set budget</button>' },
    'bills': { t: 'Recurring', a: '<button class="btn btn-orange" onclick="showAddBill()">+ Add bill</button>' },
    'goals': { t: 'Goals', a: '<button class="btn btn-orange" onclick="showAddGoal()">+ Add goal</button>' },
    'debts': { t: 'Loans', a: '<button class="btn btn-orange" onclick="showAddDebt()">+ Log record</button>' },
    'reports': { t: 'Reports', a: '<button class="btn btn-orange" onclick="loadReport()"><i class="ph ph-chart-bar"></i> Generate</button>' },
    'admin': { t: 'Admin Panel', a: '<button class="btn btn-orange" onclick="showAddUser()">+ Add User</button>' }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadHomeUsers(); // For homepage selector
    setupNavigation();
});

// ===== HOMEPAGE =====
async function loadHomeUsers() {
    try {
        const res = await fetch(`${API}/api/users`);
        const users = await res.json();

        // Homepage selector
        const homeSelect = document.getElementById('homeUserSelect');
        if (homeSelect) {
            homeSelect.innerHTML = users.map(u =>
                `<option value="${u.id}">${u.fullName}</option>`
            ).join('');
        }
    } catch (e) { console.error('Error loading users:', e); }
}

function enterDashboard() {
    const homeSelect = document.getElementById('homeUserSelect');
    currentUserId = parseInt(homeSelect.value);

    document.getElementById('homepage').style.display = 'none';
    document.getElementById('dashboardApp').style.display = 'flex';

    loadDashboardUsers();
}

async function loadDashboardUsers() {
    try {
        const res = await fetch(`${API}/api/users`);
        allUsers = await res.json();
        
        // Show admin panel link if current user is ADMIN
        const currentUser = allUsers.find(u => u.id === currentUserId);
        const navAdmin = document.getElementById('navAdmin');
        if (currentUser && currentUser.role === 'ADMIN') {
            if (navAdmin) navAdmin.style.display = 'flex';
        } else {
            if (navAdmin) navAdmin.style.display = 'none';
        }

        const select = document.getElementById('userSelect');
        select.innerHTML = allUsers.map(u =>
            `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>${u.fullName}</option>`
        ).join('');
        
        // Remove old listener to avoid duplicates if called again
        const newSelect = select.cloneNode(true);
        select.parentNode.replaceChild(newSelect, select);
        
        newSelect.addEventListener('change', e => {
            currentUserId = parseInt(e.target.value);
            loadDashboardUsers(); // Reload to check admin role
        });

        await fetchCategories();
        loadAccounts();
    } catch (e) { console.error(e); }
}

function goHome() {
    document.getElementById('dashboardApp').style.display = 'none';
    document.getElementById('homepage').style.display = 'block';
}

// ===== NAV =====
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
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

// ===== DATA =====
async function fetchCategories() {
    const res = await fetch(`${API}/api/categories`);
    categories = await res.json();
}

async function fetchWalletsAndDebts() {
    const [wRes, dRes] = await Promise.all([
        fetch(`${API}/api/wallets/user/${currentUserId}`),
        fetch(`${API}/api/debts/user/${currentUserId}`)
    ]);
    wallets = await wRes.json();
    debts = await dRes.json();
}

// ===== ACCOUNTS / DASHBOARD =====
async function loadAccounts() {
    await fetchWalletsAndDebts();

    const groups = {
        'CASH': { title: 'Cash', amounts: 0, items: [], up: true },
        'CREDIT': { title: 'Credit Cards', amounts: 0, items: [], up: false },
        'INVEST': { title: 'Investments', amounts: 0, items: [], up: true },
        'LIABILITY': { title: 'Personal Loans', amounts: 0, items: [], up: false }
    };

    let totalCashAssets = 0, totalInvestments = 0, totalCcDebt = 0, totalPersonalDebt = 0;

    wallets.forEach(w => {
        if (w.walletType === 'CREDIT_CARD') {
            groups['CREDIT'].amounts += w.balance;
            groups['CREDIT'].items.push(w);
            totalCcDebt += w.balance;
        } else if (w.walletType === 'BANK') {
            groups['CASH'].amounts += w.balance;
            groups['CASH'].items.push(w);
            totalCashAssets += w.balance;
        } else {
            groups['CASH'].amounts += w.balance;
            groups['CASH'].items.push(w);
            totalCashAssets += w.balance;
        }
    });

    debts.filter(d => d.status !== 'PAID').forEach(d => {
        if (d.type === 'DEBT') {
            groups['LIABILITY'].amounts += d.remainingAmount;
            groups['LIABILITY'].items.push({ isDebt: true, ...d });
            totalPersonalDebt += d.remainingAmount;
        } else {
            groups['INVEST'].amounts += d.remainingAmount;
            groups['INVEST'].items.push({ isLoan: true, ...d });
            totalInvestments += d.remainingAmount;
        }
    });

    const netAssets = totalCashAssets + totalInvestments;
    const netLiabilities = totalCcDebt + totalPersonalDebt;
    const netWorth = netAssets - netLiabilities;

    renderNetWorthSection(netWorth);
    renderAccountsCol(groups);
    renderSummaryCol(netAssets, netLiabilities, totalCashAssets, totalInvestments, totalCcDebt, totalPersonalDebt);
}

function renderNetWorthSection(n) {
    const change = n * 0.035;
    document.getElementById('netWorthValue').innerText = '৳' + formatNum(n);
    document.getElementById('netWorthChange').innerHTML = `<span class="text-green">↑ ৳${formatNum(change)} (3.5%) 1 month change</span>`;

    const ctx = document.getElementById('netWorthChart').getContext('2d');
    if (netWorthChartInstance) netWorthChartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    const data = [n * 0.965, n * 0.97, n * 0.975, n * 0.98, n * 0.985, n * 0.99, n * 0.995, n];

    netWorthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Nov 6', 'Nov 12', 'Nov 18', 'Nov 24', 'Nov 30', 'Dec 2', 'Dec 4', 'Dec 6'],
            datasets: [{ data, borderColor: '#0ea5e9', borderWidth: 2, backgroundColor: gradient, fill: true, pointRadius: 0, pointHoverRadius: 4, tension: 0.1 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } } },
                y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' }, callback: v => '৳' + (v / 1000).toFixed(1) + 'K' } }
            }
        }
    });
}

function renderAccountsCol(groups) {
    let html = '';
    ['CASH', 'CREDIT', 'INVEST', 'LIABILITY'].forEach(key => {
        const g = groups[key];
        if (g.items.length === 0) return;
        const clr = g.up ? 'text-green' : 'text-red';
        const arrow = g.up ? '↑' : '↓';

        html += `<div class="acc-group"><div class="acc-group-header"><div class="acc-group-title"><i class="ph ph-caret-down"></i> ${g.title} <span class="acc-group-change ${clr}">${arrow} 1.5% 1m change</span></div><div class="acc-group-total">৳${formatNum(g.amounts)}</div></div>`;

        g.items.forEach((item, i) => {
            const cid = `spark_${key}_${i}`;
            let name, sub, amt, time, logoColor, imgHtml;

            if (item.isDebt || item.isLoan) {
                name = item.personName; sub = item.isDebt ? 'Personal Debt' : 'Expect Payment';
                amt = item.remainingAmount; time = 'Due: ' + formatDate(item.dueDate);
                imgHtml = '<i class="ph ph-user"></i>'; logoColor = '#6b7280';
            } else {
                name = item.walletName; sub = item.walletType.replace('_', ' ');
                amt = item.balance; time = '16 hours ago';
                const colorMap = { BANK: '#3b82f6', BKASH: '#e11d48', NAGAD: '#f97316', CREDIT_CARD: '#8b5cf6', CASH: '#10b981', ROCKET: '#6366f1' };
                logoColor = colorMap[item.walletType] || '#6b7280';
                const labelMap = { BANK: 'BK', BKASH: 'bK', NAGAD: 'NG', CREDIT_CARD: 'CC', CASH: '৳', ROCKET: 'RK' };
                imgHtml = `<span style="font-size:11px; font-weight:700">${labelMap[item.walletType] || '$$'}</span>`;
            }

            html += `<div class="acc-item"><div class="acc-item-left"><div class="acc-item-logo" style="background:${logoColor}15; color:${logoColor}">${imgHtml}</div><div class="acc-item-info"><div class="acc-item-name">${name}</div><div class="acc-item-type">${sub}</div></div></div><div class="acc-item-sparkline"><canvas id="${cid}"></canvas></div><div class="acc-item-right"><div class="acc-item-bal">৳${formatNum(amt)}</div><div class="acc-item-time">${time}</div></div></div>`;
        });
        html += `</div>`;
    });
    document.getElementById('accountsListContainer').innerHTML = html;

    ['CASH', 'CREDIT', 'INVEST', 'LIABILITY'].forEach(key => {
        groups[key].items.forEach((_, i) => drawSparkline(`spark_${key}_${i}`));
    });
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
        { l: 'Bank Accounts', v: cash, c: '#0ea5e9' },
        { l: 'Investments', v: inv, c: '#10b981' }
    ].filter(x => x.v > 0);

    const aTotal = assetData.reduce((s, x) => s + x.v, 0) || 1;
    document.getElementById('assetBarMulti').innerHTML = assetData.map(d => `<div style="width:${(d.v / aTotal) * 100}%; background:${d.c}"></div>`).join('');
    document.getElementById('assetBreakdown').innerHTML = assetData.map(d => `<div class="summary-legend-row"><div class="legend-label"><div class="legend-dot" style="background:${d.c}"></div> ${d.l}</div><div style="font-weight: 500">${fmt(d.v, aTot)}</div></div>`).join('');

    const liabData = [
        { l: 'Loans', v: loan, c: '#eab308' },
        { l: 'Credit Cards', v: cc, c: '#ef4444' }
    ].filter(x => x.v > 0);

    const lTotal = liabData.reduce((s, x) => s + x.v, 0) || 1;
    document.getElementById('sumLiabsVal').innerText = '৳' + formatNum(lTotal);
    document.getElementById('liabBarMulti').innerHTML = liabData.map(d => `<div style="width:${(d.v / lTotal) * 100}%; background:${d.c}"></div>`).join('');
    document.getElementById('liabBreakdown').innerHTML = liabData.map(d => `<div class="summary-legend-row"><div class="legend-label"><div class="legend-dot" style="background:${d.c}"></div> ${d.l}</div><div style="font-weight: 500">${fmt(d.v, lTot)}</div></div>`).join('');
}

function toggleSummaryMode(mode) {
    summaryMode = mode;
    document.getElementById('btnSumTotals').classList.toggle('active', mode === 'totals');
    document.getElementById('btnSumPercent').classList.toggle('active', mode === 'percent');
    if (latestSummaryData) renderSummaryCol(...latestSummaryData);
}

function drawSparkline(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120; canvas.height = 30;
    const pts = Array.from({ length: 10 }, () => Math.random() * 10).map((v, i) => v + i * 0.5);
    const max = Math.max(...pts), min = Math.min(...pts), range = max - min || 1;
    ctx.beginPath(); ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.5;
    pts.forEach((pt, i) => { const x = (i / 9) * canvas.width; const y = canvas.height - 4 - ((pt - min) / range) * (canvas.height - 8); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
}

// ===== GENERIC MODULES =====
async function loadGenericModule(page) {
    const thead = document.getElementById('genericTableHead');
    const tbody = document.getElementById('genericTableBody');
    const searchEl = document.getElementById('genericSearch');
    thead.innerHTML = ''; tbody.innerHTML = '';

    if (wallets.length === 0) await fetchWalletsAndDebts();

    try {
        if (page === 'transactions') {
            const keyword = searchEl?.value || '';
            thead.innerHTML = `<tr><th>Date</th><th>Description</th><th>Account</th><th>Amount</th><th>Category</th></tr>`;
            const res = await fetch(`${API}/api/transactions/user/${currentUserId}/search?keyword=${encodeURIComponent(keyword)}`);
            const txs = await res.json();
            tbody.innerHTML = txs.map(t => `<tr><td>${formatDate(t.transactionDate)}</td><td>${t.description || '—'}</td><td>${wallets.find(w => w.id === t.walletId)?.walletName || '—'}</td><td style="color:${t.type === 'INCOME' ? 'var(--green)' : 'var(--text-primary)'}; font-weight:600">৳${formatNum(t.amount)}</td><td>${getCategoryName(t.categoryId)}</td></tr>`).join('') || '<tr><td colspan="5" style="padding:40px; text-align:center; color:var(--text-muted)">No transactions found.</td></tr>';
            // Wire up search
            searchEl.oninput = () => { clearTimeout(searchEl._t); searchEl._t = setTimeout(() => loadGenericModule('transactions'), 300); };
        } else if (page === 'budgets') {
            thead.innerHTML = `<tr><th>Category</th><th>Spent</th><th>Limit</th><th>Progress</th><th>Status</th></tr>`;
            const res = await fetch(`${API}/api/budgets/user/${currentUserId}/status/${new Date().toISOString().slice(0, 7)}`);
            const bgs = await res.json();
            tbody.innerHTML = bgs.map(b => { const pc = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0; return `<tr><td>${getCategoryName(b.categoryId)}</td><td>৳${formatNum(b.spentAmount)}</td><td>৳${formatNum(b.limitAmount)}</td><td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px"><div style="width:${Math.min(pc, 100)}%;height:6px;background:${b.isOverBudget ? 'var(--red)' : 'var(--green)'};border-radius:3px"></div></div><span style="font-size:0.75rem">${pc.toFixed(0)}%</span></div></td><td style="color:${b.isOverBudget ? 'var(--red)' : 'var(--green)'};font-weight:500">${b.isOverBudget ? 'Over Budget' : 'On Track'}</td></tr>`; }).join('') || '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--text-muted)">No budgets set.</td></tr>';
        } else if (page === 'bills') {
            thead.innerHTML = `<tr><th>Bill Name</th><th>Amount</th><th>Frequency</th><th>Next Due</th><th>Status</th></tr>`;
            const res = await fetch(`${API}/api/recurring-bills/user/${currentUserId}`);
            const bills = await res.json();
            tbody.innerHTML = bills.map(b => `<tr><td style="font-weight:500">${b.billName}</td><td style="font-weight:600">৳${formatNum(b.amount)}</td><td>${b.frequency}</td><td>${formatDate(b.nextDueDate)}</td><td style="color:${b.isActive ? 'var(--green)' : 'var(--text-muted)'}">${b.isActive ? 'Active' : 'Inactive'}</td></tr>`).join('') || '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--text-muted)">No bills.</td></tr>';
        } else if (page === 'goals') {
            thead.innerHTML = `<tr><th>Goal</th><th>Target</th><th>Saved</th><th>Progress</th><th>Action</th></tr>`;
            const res = await fetch(`${API}/api/goals/user/${currentUserId}`);
            const gls = await res.json();
            tbody.innerHTML = gls.map(g => { const pc = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0; return `<tr><td style="font-weight:500">${g.goalName}</td><td>৳${formatNum(g.targetAmount)}</td><td style="font-weight:600">৳${formatNum(g.currentAmount)}</td><td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px"><div style="width:${Math.min(pc, 100)}%;height:6px;background:var(--blue);border-radius:3px"></div></div><span style="font-size:0.75rem">${pc.toFixed(0)}%</span></div></td><td><button class="btn btn-outline" onclick="addToGoal(${g.id})" style="font-size:0.75rem;padding:4px 10px">+ Add</button></td></tr>`; }).join('') || '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--text-muted)">No goals.</td></tr>';
        } else if (page === 'debts') {
            thead.innerHTML = `<tr><th>Person</th><th>Type</th><th>Total</th><th>Remaining</th><th>Due</th><th>Action</th></tr>`;
            const res = await fetch(`${API}/api/debts/user/${currentUserId}`);
            const dts = await res.json();
            tbody.innerHTML = dts.map(d => `<tr><td style="font-weight:500">${d.personName}</td><td style="color:${d.type === 'DEBT' ? 'var(--red)' : 'var(--green)'};font-weight:600">${d.type === 'DEBT' ? 'I Owe' : 'Owed to Me'}</td><td>৳${formatNum(d.amount)}</td><td style="font-weight:600">৳${formatNum(d.remainingAmount)}</td><td>${formatDate(d.dueDate)}</td><td>${d.status !== 'PAID' ? `<button class="btn btn-outline" onclick="makePayment(${d.id})" style="font-size:0.75rem;padding:4px 10px">Pay</button>` : '<span style="color:var(--green)">✓ Paid</span>'}</td></tr>`).join('') || '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--text-muted)">No records.</td></tr>';
        } else if (page === 'reports') {
            thead.innerHTML = '';
            const month = new Date().toISOString().slice(0, 7);
            const res = await fetch(`${API}/api/reports/user/${currentUserId}/monthly/${month}`);
            const r = await res.json();
            const netClass = r.netSavings >= 0 ? 'text-green' : 'text-red';
            document.getElementById('genericTableBody').innerHTML = '';
            // Use the section directly
            const section = document.querySelector('#page-generic .net-worth-section');
            section.innerHTML = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:32px;">
                    <div style="background:var(--bg-hover); padding:24px; border-radius:12px; border:1px solid var(--border-light);">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px">Total Income</div>
                        <div style="font-size:1.5rem; font-weight:700; color:var(--green)">৳${formatNum(r.totalIncome)}</div>
                    </div>
                    <div style="background:var(--bg-hover); padding:24px; border-radius:12px; border:1px solid var(--border-light);">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px">Total Expense</div>
                        <div style="font-size:1.5rem; font-weight:700; color:var(--red)">৳${formatNum(r.totalExpense)}</div>
                    </div>
                    <div style="background:var(--bg-hover); padding:24px; border-radius:12px; border:1px solid var(--border-light);">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px">Net Savings</div>
                        <div class="${netClass}" style="font-size:1.5rem; font-weight:700;">৳${formatNum(r.netSavings)}</div>
                    </div>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 24px;">Report for <strong>${month}</strong> — ${r.transactionCount} transactions processed</div>
            `;
            
            // Fetch and render spending insights (Complex SQL Feature)
            const insightsRes = await fetch(`${API}/api/reports/user/${currentUserId}/insights`);
            const insights = await insightsRes.json();
            
            let insightsHtml = `<div style="background:#fff3cd; border:1px solid #ffeeba; border-radius:12px; padding:20px; margin-top:32px;">
                <h3 style="color:#856404; margin:0 0 16px 0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                    <i class="ph ph-warning-circle"></i> Spending Insights (vs. Platform Average)
                </h3>`;
            
            if (insights && insights.length > 0) {
                insightsHtml += `<ul style="margin:0; padding-left:20px; color:#856404; line-height:1.6;">`;
                insights.forEach(insight => {
                    insightsHtml += `<li>You spent <strong>৳${formatNum(insight.userSpending)}</strong> on <strong>${insight.categoryName}</strong>, which is higher than the platform average of <strong>৳${formatNum(insight.averageSpending)}</strong>!</li>`;
                });
                insightsHtml += `</ul>`;
            } else {
                insightsHtml += `<p style="margin:0; color:#856404; font-size:0.9rem;">Great job! Your spending is well below the platform average across all categories.</p>`;
            }
            insightsHtml += `</div>`;
            
            section.innerHTML += insightsHtml;

        } else if (page === 'admin') {
            thead.innerHTML = `<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Total Balance</th><th>Total Debt</th><th>Action</th></tr>`;
            const res = await fetch(`${API}/api/users/admin/summary`);
            const all = await res.json();
            tbody.innerHTML = all.map(u => `<tr>
                <td style="color:var(--text-muted)">#${u.id}</td>
                <td style="font-weight:500">${u.fullName}</td>
                <td>${u.email}</td>
                <td><span style="padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; background:${u.role === 'ADMIN' ? 'var(--orange)' : '#e5e7eb'}; color:${u.role === 'ADMIN' ? '#fff' : 'var(--text-muted)'}">${u.role}</span></td>
                <td style="font-weight:600; color:var(--green)">৳${formatNum(u.totalBalance)}</td>
                <td style="font-weight:600; color:var(--red)">৳${formatNum(u.totalDebt)}</td>
                <td>
                    <button class="btn btn-outline" onclick="deleteUser(${u.id})" style="font-size:0.75rem;padding:4px 10px; color:var(--red); border-color:var(--red)">Delete</button>
                </td>
            </tr>`).join('') || '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--text-muted)">No users found.</td></tr>';
        }
    } catch (e) { console.error('Module load error:', e); }
}

// ===== FORMS & MODALS =====
function showModal(title, html) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

function showAddWallet() {
    showModal('Add Account', `
        <div class="group"><label>Name</label><input class="input" id="wfName" placeholder="e.g. Dutch-Bangla Bank"></div>
        <div class="group"><label>Type</label><select class="input" id="wfType"><option value="BANK">Bank</option><option value="CASH">Cash</option><option value="BKASH">bKash</option><option value="NAGAD">Nagad</option><option value="CREDIT_CARD">Credit Card</option></select></div>
        <div class="group"><label>Balance (৳)</label><input class="input" type="number" id="wfBal" value="0"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitWallet()">Save</button></div>
    `);
}
async function submitWallet() {
    await fetch(`${API}/api/wallets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, walletName: document.getElementById('wfName').value, walletType: document.getElementById('wfType').value, balance: parseFloat(document.getElementById('wfBal').value) || 0, currency: 'BDT' }) });
    closeModal(); loadAccounts();
}

function showAddTransaction() {
    const exp = categories.filter(c => c.type === 'EXPENSE').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const inc = categories.filter(c => c.type === 'INCOME').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const wOpts = wallets.map(w => `<option value="${w.id}">${w.walletName}</option>`).join('');
    showModal('Log Transaction', `
        <div class="group"><label>Type</label><select class="input" id="tfType"><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></div>
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" id="tfAmt"></div>
        <div class="group"><label>Account</label><select class="input" id="tfWal">${wOpts}</select></div>
        <div class="group"><label>Category</label><select class="input" id="tfCat"><optgroup label="Expense">${exp}</optgroup><optgroup label="Income">${inc}</optgroup></select></div>
        <div class="group"><label>Description</label><input class="input" id="tfDesc" placeholder="What was this for?"></div>
        <div class="group"><label>Date</label><input class="input" type="datetime-local" id="tfDate" value="${new Date().toISOString().slice(0, 16)}"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitTransaction()">Save</button></div>
    `);
}
async function submitTransaction() {
    await fetch(`${API}/api/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, walletId: parseInt(document.getElementById('tfWal').value), categoryId: parseInt(document.getElementById('tfCat').value), type: document.getElementById('tfType').value, amount: parseFloat(document.getElementById('tfAmt').value) || 0, description: document.getElementById('tfDesc').value, transactionDate: document.getElementById('tfDate').value + ':00' }) });
    closeModal(); loadGenericModule('transactions');
}

function showAddBudget() {
    const exp = categories.filter(c => c.type === 'EXPENSE').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    showModal('Set Budget', `
        <div class="group"><label>Category</label><select class="input" id="bfCat">${exp}</select></div>
        <div class="group"><label>Limit (৳)</label><input class="input" type="number" id="bfLimit"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitBudget()">Save</button></div>
    `);
}
async function submitBudget() {
    await fetch(`${API}/api/budgets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, categoryId: parseInt(document.getElementById('bfCat').value), budgetMonth: new Date().toISOString().slice(0, 7), limitAmount: parseFloat(document.getElementById('bfLimit').value) || 0 }) });
    closeModal(); loadGenericModule('budgets');
}

function showAddBill() {
    const exp = categories.filter(c => c.type === 'EXPENSE').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const wOpts = wallets.map(w => `<option value="${w.id}">${w.walletName}</option>`).join('');
    showModal('Add Bill', `
        <div class="group"><label>Name</label><input class="input" id="rbName"></div>
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" id="rbAmt"></div>
        <div class="group"><label>Frequency</label><select class="input" id="rbFreq"><option>MONTHLY</option><option>WEEKLY</option><option>YEARLY</option></select></div>
        <div class="group"><label>Category</label><select class="input" id="rbCat">${exp}</select></div>
        <div class="group"><label>Account</label><select class="input" id="rbWal">${wOpts}</select></div>
        <div class="group"><label>Next Due</label><input class="input" type="date" id="rbDate"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitBill()">Save</button></div>
    `);
}
async function submitBill() {
    await fetch(`${API}/api/recurring-bills`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, billName: document.getElementById('rbName').value, amount: parseFloat(document.getElementById('rbAmt').value) || 0, frequency: document.getElementById('rbFreq').value, categoryId: parseInt(document.getElementById('rbCat').value), walletId: parseInt(document.getElementById('rbWal').value), nextDueDate: document.getElementById('rbDate').value, isActive: true }) });
    closeModal(); loadGenericModule('bills');
}

function showAddGoal() {
    showModal('Add Goal', `
        <div class="group"><label>Goal Name</label><input class="input" id="gfName" placeholder="e.g. Emergency Fund"></div>
        <div class="group"><label>Target Amount (৳)</label><input class="input" type="number" id="gfTarget"></div>
        <div class="group"><label>Deadline</label><input class="input" type="date" id="gfDeadline"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitGoal()">Save</button></div>
    `);
}
async function submitGoal() {
    await fetch(`${API}/api/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, goalName: document.getElementById('gfName').value, targetAmount: parseFloat(document.getElementById('gfTarget').value) || 0, currentAmount: 0, deadline: document.getElementById('gfDeadline').value || null, status: 'IN_PROGRESS' }) });
    closeModal(); loadGenericModule('goals');
}
async function addToGoal(id) {
    showModal('Contribute to Goal', `
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" id="gfAddAmt" placeholder="e.g. 5000"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitAddToGoal(${id})">Add Funds</button></div>
    `);
}
async function submitAddToGoal(id) {
    const amount = parseFloat(document.getElementById('gfAddAmt').value);
    if (!amount || isNaN(amount) || amount <= 0) return;
    await fetch(`${API}/api/goals/${id}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
    closeModal();
    loadGenericModule('goals');
}

function showAddDebt() {
    showModal('Log Debt/Loan', `
        <div class="group"><label>Type</label><select class="input" id="dfType"><option value="DEBT">I Borrowed (Debt)</option><option value="LOAN">I Lent (Loan)</option></select></div>
        <div class="group"><label>Person Name</label><input class="input" id="dfPerson"></div>
        <div class="group"><label>Amount (৳)</label><input class="input" type="number" id="dfAmt"></div>
        <div class="group"><label>Due Date</label><input class="input" type="date" id="dfDue"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitDebt()">Save</button></div>
    `);
}
async function submitDebt() {
    const amt = parseFloat(document.getElementById('dfAmt').value) || 0;
    await fetch(`${API}/api/debts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId, type: document.getElementById('dfType').value, personName: document.getElementById('dfPerson').value, amount: amt, remainingAmount: amt, dueDate: document.getElementById('dfDue').value || null, status: 'PENDING' }) });
    closeModal(); loadGenericModule('debts');
}
async function makePayment(id) {
    showModal('Make Payment', `
        <div class="group"><label>Payment Amount (৳)</label><input class="input" type="number" id="dfPayAmt" placeholder="e.g. 2000"></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitMakePayment(${id})">Submit Payment</button></div>
    `);
}
async function submitMakePayment(id) {
    const amount = parseFloat(document.getElementById('dfPayAmt').value);
    if (!amount || isNaN(amount) || amount <= 0) return;
    await fetch(`${API}/api/debts/${id}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
    closeModal();
    loadGenericModule('debts');
}

async function loadReport() { window.print(); }

// ===== UTILS =====
function formatNum(n) { return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(dStr) { if (!dStr) return '—'; return new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function getCategoryName(id) { const c = categories.find(c => c.id === id); return c ? c.name : 'Uncategorized'; }

// ===== ADMIN MODULE =====
function showAddUser() {
    showModal('Add User', `
        <div class="group"><label>Full Name</label><input class="input" id="ufName" placeholder="e.g. John Doe"></div>
        <div class="group"><label>Email</label><input class="input" type="email" id="ufEmail" placeholder="john@example.com"></div>
        <div class="group"><label>Phone</label><input class="input" id="ufPhone" placeholder="01712345678"></div>
        <div class="group"><label>Role</label><select class="input" id="ufRole"><option value="USER">User</option><option value="ADMIN">Admin</option></select></div>
        <div class="actions"><button class="btn btn-orange" onclick="submitUser()">Save User</button></div>
    `);
}
async function submitUser() {
    const payload = {
        fullName: document.getElementById('ufName').value,
        email: document.getElementById('ufEmail').value,
        phone: document.getElementById('ufPhone').value,
        role: document.getElementById('ufRole').value
    };
    await fetch(`${API}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    closeModal(); 
    loadDashboardUsers(); // Refresh global user list
    loadGenericModule('admin'); // Refresh table
}
async function deleteUser(id) {
    if (id === currentUserId) {
        alert("You cannot delete yourself.");
        return;
    }
    if (!confirm("Are you sure you want to delete this user? All their data will be lost.")) return;
    await fetch(`${API}/api/users/${id}`, { method: 'DELETE' });
    loadDashboardUsers();
    loadGenericModule('admin');
}
