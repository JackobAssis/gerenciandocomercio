/**
 * GERENCIAMENTO DE VENDAS
 * Sistema SaaS Multi-tenant
 */

let currentUser = null;
let currentCompany = null;
let products = [];
let services = [];
let cart = [];
let salesHistory = [];

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
            
            await Promise.all([
                loadProducts(),
                loadServices()
            ]);
            
            setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados', 'error');
        }
    });
});

/**
 * Carregar produtos
 */
async function loadProducts() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('products')
            .where('stock', '>', 0)
            .orderBy('stock', 'desc')
            .get();

        products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        renderProducts(products);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('productsList').innerHTML = '<p class="error">Erro ao carregar</p>';
    }
}

/**
 * Carregar serviços
 */
async function loadServices() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('services')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });

        renderServices(services);
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        document.getElementById('servicesList').innerHTML = '<p class="error">Erro ao carregar</p>';
    }
}

/**
 * Renderizar produtos
 */
function renderProducts(productsToRender) {
    const container = document.getElementById('productsList');
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<p class="empty">Nenhum produto disponível</p>';
        return;
    }

    container.innerHTML = productsToRender.map(product => `
        <div class="item-card" onclick="addToCart('product', '${product.id}')">
            <div class="item-info">
                <strong>${escapeHtml(product.name)}</strong>
                <span class="item-price">${formatCurrency(product.price)}</span>
            </div>
            <div class="item-meta">
                <span class="badge">${escapeHtml(product.category)}</span>
                <span class="stock-badge">Estoque: ${product.stock}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar serviços
 */
function renderServices(servicesToRender) {
    const container = document.getElementById('servicesList');
    
    if (servicesToRender.length === 0) {
        container.innerHTML = '<p class="empty">Nenhum serviço disponível</p>';
        return;
    }

    container.innerHTML = servicesToRender.map(service => `
        <div class="item-card" onclick="addToCart('service', '${service.id}')">
            <div class="item-info">
                <strong>${escapeHtml(service.name)}</strong>
                <span class="item-price">${formatCurrency(service.price)}</span>
            </div>
            <div class="item-meta">
                <span class="badge">⏱️ ${service.duration || 30} min</span>
            </div>
        </div>
    `).join('');
}

/**
 * Adicionar item ao carrinho
 */
window.addToCart = function(type, itemId) {
    const item = type === 'product' 
        ? products.find(p => p.id === itemId)
        : services.find(s => s.id === itemId);

    if (!item) return;

    // Verificar se já existe no carrinho
    const existingIndex = cart.findIndex(i => i.id === itemId && i.type === type);
    
    if (existingIndex >= 0) {
        // Se for produto, verificar estoque
        if (type === 'product') {
            if (cart[existingIndex].quantity >= item.stock) {
                showNotification('Estoque insuficiente', 'warning');
                return;
            }
        }
        cart[existingIndex].quantity++;
    } else {
        cart.push({
            id: itemId,
            type,
            name: item.name,
            price: item.price,
            quantity: 1,
            stock: type === 'product' ? item.stock : null
        });
    }

    renderCart();
    showNotification(`${item.name} adicionado`, 'success');
};

/**
 * Renderizar carrinho
 */
function renderCart() {
    const container = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Nenhum item adicionado</p>';
        document.getElementById('finalizeSaleBtn').disabled = true;
        updateTotals();
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${escapeHtml(item.name)}</strong>
                <span class="item-type-badge">${item.type === 'product' ? '📦' : '🛠️'}</span>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${index}, -1)" class="qty-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)" class="qty-btn">+</button>
                <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
                <button onclick="removeFromCart(${index})" class="remove-btn">🗑️</button>
            </div>
        </div>
    `).join('');

    document.getElementById('finalizeSaleBtn').disabled = false;
    updateTotals();
}

/**
 * Atualizar quantidade
 */
window.updateQuantity = function(index, change) {
    const item = cart[index];
    const newQty = item.quantity + change;

    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }

    // Verificar estoque para produtos
    if (item.type === 'product' && newQty > item.stock) {
        showNotification('Estoque insuficiente', 'warning');
        return;
    }

    cart[index].quantity = newQty;
    renderCart();
};

/**
 * Remover do carrinho
 */
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    renderCart();
};

/**
 * Atualizar totais
 */
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountValue = subtotal * (discountPercent / 100);
    const total = subtotal - discountValue;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('discountValue').textContent = `- ${formatCurrency(discountValue)}`;
    document.getElementById('totalValue').textContent = formatCurrency(total);
}

/**
 * Limpar carrinho
 */
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Deseja realmente limpar o carrinho?')) {
        cart = [];
        renderCart();
        showNotification('Carrinho limpo', 'info');
    }
}

/**
 * Finalizar venda
 */
async function finalizeSale() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountValue = subtotal * (discountPercent / 100);
    const total = subtotal - discountValue;

    const saleData = {
        items: cart.map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        subtotal,
        discountPercent,
        discountValue,
        total,
        paymentMethod: document.getElementById('paymentMethod').value,
        customerName: document.getElementById('customerName').value.trim() || 'Cliente não informado',
        notes: document.getElementById('saleNotes').value.trim(),
        userId: currentUser.uid,
        userName: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const db = firebase.firestore();
        const batch = db.batch();

        // Adicionar venda
        const saleRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('sales')
            .doc();
        batch.set(saleRef, saleData);

        // Atualizar estoque de produtos
        const productItems = cart.filter(item => item.type === 'product');
        for (const item of productItems) {
            const productRef = db.collection('companies')
                .doc(currentCompany.companyId)
                .collection('products')
                .doc(item.id);
            
            batch.update(productRef, {
                stock: firebase.firestore.FieldValue.increment(-item.quantity)
            });
        }

        // Log
        const logRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('logs')
            .doc();
        batch.set(logRef, {
            action: 'create_sale',
            details: `Venda finalizada: ${formatCurrency(total)} - ${cart.length} itens`,
            userId: currentUser.uid,
            userName: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        showNotification('✅ Venda finalizada com sucesso!', 'success');
        
        // Limpar formulário
        cart = [];
        renderCart();
        document.getElementById('customerName').value = '';
        document.getElementById('saleNotes').value = '';
        document.getElementById('discountPercent').value = '0';
        
        // Recarregar produtos (estoque atualizado)
        await loadProducts();

    } catch (error) {
        console.error('Erro ao finalizar venda:', error);
        showNotification('Erro ao finalizar venda', 'error');
    }
}

/**
 * Ver histórico de vendas
 */
async function viewSalesHistory() {
    document.getElementById('salesHistoryModal').classList.add('show');
    await loadSalesHistory();
}

/**
 * Carregar histórico
 */
async function loadSalesHistory(startDate = null, endDate = null) {
    const tbody = document.getElementById('salesHistoryBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Carregando...</td></tr>';

    try {
        const db = firebase.firestore();
        let query = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('sales')
            .orderBy('createdAt', 'desc')
            .limit(50);

        const snapshot = await query.get();
        
        salesHistory = [];
        snapshot.forEach(doc => {
            salesHistory.push({ id: doc.id, ...doc.data() });
        });

        renderSalesHistory(salesHistory);

    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="error">Erro ao carregar</td></tr>';
    }
}

/**
 * Renderizar histórico
 */
function renderSalesHistory(sales) {
    const tbody = document.getElementById('salesHistoryBody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma venda encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = sales.map(sale => {
        const date = sale.createdAt ? sale.createdAt.toDate() : new Date();
        return `
            <tr>
                <td>${formatDateTime(date)}</td>
                <td>${sale.items.length} item(ns)</td>
                <td><strong>${formatCurrency(sale.total)}</strong></td>
                <td><span class="badge">${escapeHtml(sale.paymentMethod)}</span></td>
                <td>${escapeHtml(sale.customerName)}</td>
                <td>
                    <button onclick="viewSaleDetails('${sale.id}')" class="btn-icon">👁️</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Ver detalhes da venda
 */
window.viewSaleDetails = function(saleId) {
    const sale = salesHistory.find(s => s.id === saleId);
    if (!sale) return;

    const content = `
        <div class="sale-details">
            <p><strong>Data:</strong> ${formatDateTime(sale.createdAt.toDate())}</p>
            <p><strong>Cliente:</strong> ${escapeHtml(sale.customerName)}</p>
            <p><strong>Pagamento:</strong> ${escapeHtml(sale.paymentMethod)}</p>
            
            <h4>Itens:</h4>
            <ul>
                ${sale.items.map(item => `
                    <li>${escapeHtml(item.name)} - ${item.quantity}x ${formatCurrency(item.price)} = ${formatCurrency(item.subtotal)}</li>
                `).join('')}
            </ul>
            
            <p><strong>Subtotal:</strong> ${formatCurrency(sale.subtotal)}</p>
            <p><strong>Desconto:</strong> ${sale.discountPercent}% (${formatCurrency(sale.discountValue)})</p>
            <p><strong>Total:</strong> ${formatCurrency(sale.total)}</p>
            
            ${sale.notes ? `<p><strong>Observações:</strong> ${escapeHtml(sale.notes)}</p>` : ''}
        </div>
    `;

    document.getElementById('saleDetailsContent').innerHTML = content;
    document.getElementById('saleDetailsModal').classList.add('show');
};

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Botões
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('finalizeSaleBtn').addEventListener('click', finalizeSale);
    document.getElementById('viewSalesBtn').addEventListener('click', viewSalesHistory);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Desconto
    document.getElementById('discountPercent').addEventListener('input', updateTotals);
    
    // Busca
    document.getElementById('searchProduct').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(term));
        renderProducts(filtered);
    });
    
    document.getElementById('searchService').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = services.filter(s => s.name.toLowerCase().includes(term));
        renderServices(filtered);
    });
    
    // Modais
    document.getElementById('closeSalesModal').addEventListener('click', () => {
        document.getElementById('salesHistoryModal').classList.remove('show');
    });
    
    document.getElementById('closeDetailsModal').addEventListener('click', () => {
        document.getElementById('saleDetailsModal').classList.remove('show');
    });
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
