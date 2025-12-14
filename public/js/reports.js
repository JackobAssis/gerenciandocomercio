/**
 * RELATÓRIOS E ANÁLISES
 * Sistema SaaS Multi-tenant
 */

let currentUser = null;
let currentCompany = null;
let salesData = [];
let charts = {};
let currentPeriod = { start: null, end: null };

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            currentUser = user;
            const userDoc = await getUserData(user.uid);
            
            if (!userDoc || !userDoc.companyId) {
                showNotification('Erro ao carregar dados do usuário', 'error');
                return;
            }

            currentCompany = userDoc;
            updateCompanyInfo(currentCompany.companyName, currentCompany.plan);
            
            // Carregar dados de hoje por padrão
            setPeriod('today');
            setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados', 'error');
        }
    });
});

/**
 * Definir período
 */
function setPeriod(period) {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start;

    switch (period) {
        case 'today':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            break;
        case 'week':
            start = new Date(now);
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'month':
            start = new Date(now);
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            return;
    }

    currentPeriod = { start, end };
    loadReportData();
}

/**
 * Carregar dados do relatório
 */
async function loadReportData() {
    try {
        const db = firebase.firestore();
        let query = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('sales')
            .orderBy('createdAt', 'desc');

        if (currentPeriod.start && currentPeriod.end) {
            query = query
                .where('createdAt', '>=', currentPeriod.start)
                .where('createdAt', '<=', currentPeriod.end);
        }

        const snapshot = await query.get();
        
        salesData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
                salesData.push({ 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt.toDate()
                });
            }
        });

        updateStatistics();
        renderCharts();
        renderDetailedTable();
        
        await logAction('view_reports', `Visualizou relatórios: ${salesData.length} vendas`);

    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

/**
 * Atualizar estatísticas
 */
function updateStatistics() {
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalSales = salesData.length;
    
    let totalProducts = 0;
    let totalServices = 0;
    
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (item.type === 'product') {
                totalProducts += item.quantity;
            } else {
                totalServices += item.quantity;
            }
        });
    });

    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalSales').textContent = totalSales;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalServices').textContent = totalServices;
}

/**
 * Renderizar gráficos
 */
function renderCharts() {
    renderSalesByDayChart();
    renderPaymentMethodsChart();
    renderTopProductsChart();
    renderTopServicesChart();
}

/**
 * Gráfico de vendas por dia
 */
function renderSalesByDayChart() {
    const ctx = document.getElementById('salesByDayChart');
    
    // Agrupar vendas por dia
    const salesByDay = {};
    salesData.forEach(sale => {
        const dateStr = sale.createdAt.toLocaleDateString('pt-BR');
        salesByDay[dateStr] = (salesByDay[dateStr] || 0) + sale.total;
    });

    const labels = Object.keys(salesByDay).sort();
    const data = labels.map(date => salesByDay[date]);

    if (charts.salesByDay) charts.salesByDay.destroy();
    
    charts.salesByDay = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Faturamento',
                data,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de formas de pagamento
 */
function renderPaymentMethodsChart() {
    const ctx = document.getElementById('paymentMethodsChart');
    
    const paymentMethods = {};
    salesData.forEach(sale => {
        const method = sale.paymentMethod || 'Não informado';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const labels = Object.keys(paymentMethods);
    const data = Object.values(paymentMethods);

    if (charts.paymentMethods) charts.paymentMethods.destroy();
    
    charts.paymentMethods = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#00ff88',
                    '#00ccff',
                    '#ff6b9d',
                    '#ffd93d',
                    '#a8e6cf',
                    '#dda0dd'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Gráfico de produtos mais vendidos
 */
function renderTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    
    const productSales = {};
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (item.type === 'product') {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            }
        });
    });

    const sorted = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, qty]) => qty);

    if (charts.topProducts) charts.topProducts.destroy();
    
    charts.topProducts = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Quantidade Vendida',
                data,
                backgroundColor: '#00ff88'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

/**
 * Gráfico de serviços mais solicitados
 */
function renderTopServicesChart() {
    const ctx = document.getElementById('topServicesChart');
    
    const serviceSales = {};
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (item.type === 'service') {
                serviceSales[item.name] = (serviceSales[item.name] || 0) + item.quantity;
            }
        });
    });

    const sorted = Object.entries(serviceSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, qty]) => qty);

    if (charts.topServices) charts.topServices.destroy();
    
    charts.topServices = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Quantidade',
                data,
                backgroundColor: '#00ccff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

/**
 * Renderizar tabela detalhada
 */
function renderDetailedTable() {
    const tbody = document.getElementById('detailedSalesBody');
    
    if (salesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma venda no período selecionado</td></tr>';
        return;
    }

    tbody.innerHTML = salesData.map(sale => `
        <tr>
            <td>${formatDateTime(sale.createdAt)}</td>
            <td>${escapeHtml(sale.customerName || 'N/A')}</td>
            <td>${sale.items.length} item(ns)</td>
            <td><strong>${formatCurrency(sale.total)}</strong></td>
            <td>${sale.discountPercent > 0 ? sale.discountPercent + '%' : '-'}</td>
            <td><span class="badge">${escapeHtml(sale.paymentMethod)}</span></td>
        </tr>
    `).join('');
}

/**
 * Exportar para CSV
 */
function exportToCSV() {
    if (salesData.length === 0) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }

    const headers = ['Data/Hora', 'Cliente', 'Total', 'Desconto', 'Pagamento', 'Itens'];
    const rows = salesData.map(sale => [
        formatDateTime(sale.createdAt),
        sale.customerName || 'N/A',
        sale.total.toFixed(2),
        sale.discountPercent || 0,
        sale.paymentMethod,
        sale.items.map(i => `${i.name} (${i.quantity})`).join('; ')
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_vendas_${Date.now()}.csv`;
    link.click();

    showNotification('Relatório exportado com sucesso!', 'success');
    logAction('export_report', `Exportou relatório: ${salesData.length} vendas`);
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botões de período
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const period = btn.dataset.period;
            if (period === 'custom') {
                document.getElementById('customDateRange').style.display = 'flex';
            } else {
                document.getElementById('customDateRange').style.display = 'none';
                setPeriod(period);
            }
        });
    });

    // Período customizado
    document.getElementById('applyCustomRange').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            showNotification('Selecione as datas', 'warning');
            return;
        }

        currentPeriod = {
            start: new Date(startDate + 'T00:00:00'),
            end: new Date(endDate + 'T23:59:59')
        };

        loadReportData();
    });

    // Exportar
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * Formatar data/hora
 */
function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Log de auditoria
 */
async function logAction(action, details) {
    try {
        const db = firebase.firestore();
        await db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('logs')
            .add({
                action,
                details,
                userId: currentUser.uid,
                userName: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Erro ao registrar log:', error);
    }
}
