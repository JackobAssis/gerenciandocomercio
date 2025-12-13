// ========================================
// DASHBOARD - MÉTRICAS E GRÁFICOS
// ========================================

const { utils } = window;
const { checkAuth, logout } = window.authManager;
const { auth, db } = window.firebaseApp;

let currentUser = null;
let companyId = null;
let salesChart = null;
let paymentChart = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoading();

    // Verificar autenticação
    const authData = await checkAuth(true);
    currentUser = authData.userData;
    companyId = authData.companyId;

    // Atualizar UI com dados do usuário
    updateUserInfo(authData);

    // Carregar dados do dashboard
    await loadDashboardData();

    // Configurar event listeners
    setupEventListeners();

    hideLoading();

  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
    hideLoading();
  }
});

// ========================================
// ATUALIZAR INFORMAÇÕES DO USUÁRIO
// ========================================

function updateUserInfo(authData) {
  // Nome da empresa
  document.getElementById('companyName').textContent = authData.company.name || 'Empresa';

  // Plano
  const planBadge = document.getElementById('companyPlan');
  planBadge.textContent = authData.company.plan.toUpperCase();
  planBadge.className = `badge badge-${getPlanColor(authData.company.plan)}`;

  // Usuário
  const userName = authData.userData.displayName || authData.userData.name || 'Usuário';
  document.getElementById('userName').textContent = userName;
  document.getElementById('userRole').textContent = authData.role;

  // Avatar (primeira letra do nome)
  document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
}

function getPlanColor(plan) {
  const colors = {
    free: 'info',
    pro: 'success',
    premium: 'warning'
  };
  return colors[plan] || 'info';
}

// ========================================
// CARREGAR DADOS DO DASHBOARD
// ========================================

async function loadDashboardData() {
  try {
    // Carregar em paralelo
    await Promise.all([
      loadStats(),
      loadTopProducts(),
      loadRecentSales(),
      loadLowStock(),
      loadCharts()
    ]);

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showToast('Erro ao carregar dados do dashboard', 'error');
  }
}

// ========================================
// CARREGAR ESTATÍSTICAS
// ========================================

async function loadStats() {
  try {
    // Buscar todas as vendas
    const salesSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('sales')
      .orderBy('createdAt', 'desc')
      .get();

    const sales = salesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calcular estatísticas
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);

    // Vendas de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const salesToday = sales.filter(sale => {
      const saleDate = sale.createdAt.toDate();
      return saleDate >= today;
    }).length;
    document.getElementById('salesToday').textContent = salesToday;
    document.getElementById('salesTodayChange').textContent = salesToday;

    // Produtos
    const productsSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('products')
      .get();

    const products = productsSnapshot.docs.map(doc => doc.data());
    document.getElementById('totalProducts').textContent = products.length;

    // Produtos com estoque baixo (menos de 10)
    const lowStock = products.filter(p => (p.stock || 0) < 10).length;
    document.getElementById('lowStockCount').textContent = lowStock;

    // Ticket médio
    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
    document.getElementById('avgTicket').textContent = formatCurrency(avgTicket);

    // Calcular mudança de receita (mock - em produção comparar com mês anterior)
    document.getElementById('revenueChange').textContent = '+12.5%';

  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

// ========================================
// PRODUTOS MAIS VENDIDOS
// ========================================

async function loadTopProducts() {
  try {
    const salesSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('sales')
      .get();

    // Contar vendas por produto
    const productStats = {};

    salesSnapshot.docs.forEach(doc => {
      const sale = doc.data();
      (sale.items || []).forEach(item => {
        if (!productStats[item.productId || item.name]) {
          productStats[item.productId || item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[item.productId || item.name].quantity += item.quantity || 1;
        productStats[item.productId || item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    // Converter para array e ordenar
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Renderizar tabela
    const tbody = document.getElementById('topProductsTable');
    
    if (topProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhuma venda registrada</td></tr>';
      return;
    }

    tbody.innerHTML = topProducts.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>${product.quantity} unidades</td>
        <td>${formatCurrency(product.revenue)}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar produtos mais vendidos:', error);
  }
}

// ========================================
// ÚLTIMAS VENDAS
// ========================================

async function loadRecentSales() {
  try {
    const salesSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('sales')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const sales = salesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const tbody = document.getElementById('recentSalesTable');

    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhuma venda registrada</td></tr>';
      return;
    }

    tbody.innerHTML = sales.map(sale => `
      <tr>
        <td>${formatDateTime(sale.createdAt)}</td>
        <td>${formatCurrency(sale.total)}</td>
        <td><span class="badge badge-info">${sale.paymentMethod || 'N/A'}</span></td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar últimas vendas:', error);
  }
}

// ========================================
// PRODUTOS COM ESTOQUE BAIXO
// ========================================

async function loadLowStock() {
  try {
    const productsSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('products')
      .where('stock', '<', 10)
      .orderBy('stock', 'asc')
      .limit(5)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const tbody = document.getElementById('lowStockTable');

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: var(--success);">✓ Todos os produtos com estoque adequado</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>${product.category || 'Sem categoria'}</td>
        <td><span class="badge badge-warning">${product.stock || 0}</span></td>
        <td>${formatCurrency(product.price)}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="window.location.href='products.html'">
            Repor
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar estoque baixo:', error);
  }
}

// ========================================
// GRÁFICOS
// ========================================

async function loadCharts() {
  await Promise.all([
    loadSalesChart(),
    loadPaymentChart()
  ]);
}

async function loadSalesChart() {
  try {
    const days = parseInt(document.getElementById('salesPeriod').value) || 30;
    
    // Buscar vendas do período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('sales')
      .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .orderBy('createdAt', 'asc')
      .get();

    const sales = salesSnapshot.docs.map(doc => doc.data());

    // Agrupar por dia
    const salesByDay = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      salesByDay[dateKey] = 0;
    }

    sales.forEach(sale => {
      const dateKey = sale.createdAt.toDate().toISOString().split('T')[0];
      if (salesByDay.hasOwnProperty(dateKey)) {
        salesByDay[dateKey] += sale.total || 0;
      }
    });

    // Preparar dados para o gráfico
    const labels = Object.keys(salesByDay).map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const data = Object.values(salesByDay);

    // Destruir gráfico anterior se existir
    if (salesChart) {
      salesChart.destroy();
    }

    // Criar gráfico
    const ctx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Vendas (R$)',
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
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#b0b0b0',
              callback: function(value) {
                return 'R$ ' + value.toFixed(0);
              }
            },
            grid: {
              color: '#2a2a2a'
            }
          },
          x: {
            ticks: {
              color: '#b0b0b0'
            },
            grid: {
              color: '#2a2a2a'
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao carregar gráfico de vendas:', error);
  }
}

async function loadPaymentChart() {
  try {
    const salesSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('sales')
      .get();

    // Contar por método de pagamento
    const paymentMethods = {};

    salesSnapshot.docs.forEach(doc => {
      const sale = doc.data();
      const method = sale.paymentMethod || 'Não especificado';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // Preparar dados
    const labels = Object.keys(paymentMethods);
    const data = Object.values(paymentMethods);

    // Destruir gráfico anterior se existir
    if (paymentChart) {
      paymentChart.destroy();
    }

    // Criar gráfico
    const ctx = document.getElementById('paymentChart').getContext('2d');
    paymentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#00ff88',
            '#00aaff',
            '#ffaa00',
            '#ff3366',
            '#aa00ff'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#b0b0b0',
              padding: 15
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao carregar gráfico de pagamentos:', error);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Refresh
  document.getElementById('refreshBtn').addEventListener('click', async () => {
    showLoading();
    await loadDashboardData();
    hideLoading();
    showToast('Dados atualizados', 'success');
  });

  // Nova venda
  document.getElementById('newSaleBtn').addEventListener('click', () => {
    window.location.href = 'sales.html';
  });

  // Período do gráfico
  document.getElementById('salesPeriod').addEventListener('change', loadSalesChart);

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Fechar sidebar ao clicar fora (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 968) {
      if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function showLoading() {
  document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

function showToast(message, type = 'info') {
  if (window.utils && window.utils.showToast) {
    window.utils.showToast(message, type);
  }
}

function formatCurrency(value) {
  if (window.utils && window.utils.formatCurrency) {
    return window.utils.formatCurrency(value);
  }
  return `R$ ${value.toFixed(2)}`;
}

function formatDateTime(date) {
  if (window.utils && window.utils.formatDateTime) {
    return window.utils.formatDateTime(date);
  }
  if (date && date.toDate) {
    return date.toDate().toLocaleString('pt-BR');
  }
  return '-';
}
