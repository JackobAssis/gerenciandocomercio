/**
 * GERENCIAMENTO DE PRODUTOS
 * Sistema SaaS Multi-tenant
 */

let currentUser = null;
let currentCompany = null;
let products = [];
let editingProductId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            currentUser = user;
            
            // Buscar dados do usuário
            const userDoc = await getUserData(user.uid);
            if (!userDoc || !userDoc.companyId) {
                showNotification('Erro ao carregar dados do usuário', 'error');
                return;
            }

            currentCompany = userDoc;
            
            // Atualizar interface
            updateCompanyInfo(currentCompany.companyName, currentCompany.plan);
            
            // Carregar produtos
            await loadProducts();
            
            // Configurar event listeners
            setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados', 'error');
        }
    });
});

/**
 * Carregar produtos da empresa
 */
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Carregando produtos...</td></tr>';

    try {
        const db = firebase.firestore();
        const productsRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('products');

        const snapshot = await productsRef.orderBy('createdAt', 'desc').get();
        
        products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        renderProducts(products);

        // Log de auditoria
        await logAction('view_products', `Visualizou ${products.length} produtos`);

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="error">Erro ao carregar produtos</td></tr>';
        showNotification('Erro ao carregar produtos', 'error');
    }
}

/**
 * Renderizar produtos na tabela
 */
function renderProducts(productsToRender) {
    const tbody = document.getElementById('productsTableBody');
    
    if (productsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhum produto encontrado. Clique em "Novo Produto" para adicionar.</td></tr>';
        return;
    }

    tbody.innerHTML = productsToRender.map(product => {
        const stockClass = getStockClass(product.stock, product.minStock || 5);
        const stockStatus = getStockStatus(product.stock, product.minStock || 5);
        
        return `
            <tr data-id="${product.id}">
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td><span class="badge">${escapeHtml(product.category)}</span></td>
                <td><strong>${formatCurrency(product.price)}</strong></td>
                <td class="${stockClass}">${product.stock}</td>
                <td><span class="badge ${stockStatus.class}">${stockStatus.text}</span></td>
                <td class="actions">
                    <button onclick="editProduct('${product.id}')" class="btn-icon" title="Editar">✏️</button>
                    <button onclick="deleteProduct('${product.id}', '${escapeHtml(product.name)}')" class="btn-icon" title="Excluir">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Obter classe CSS para estoque
 */
function getStockClass(stock, minStock) {
    if (stock === 0) return 'stock-empty';
    if (stock <= minStock) return 'stock-low';
    return '';
}

/**
 * Obter status do estoque
 */
function getStockStatus(stock, minStock) {
    if (stock === 0) {
        return { text: 'Esgotado', class: 'badge-danger' };
    }
    if (stock <= minStock) {
        return { text: 'Baixo', class: 'badge-warning' };
    }
    return { text: 'Normal', class: 'badge-success' };
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botão adicionar produto
    document.getElementById('addProductBtn').addEventListener('click', openAddModal);
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Formulário
    document.getElementById('productForm').addEventListener('submit', handleSubmit);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Filtros
    document.getElementById('searchProduct').addEventListener('input', applyFilters);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('filterStock').addEventListener('change', applyFilters);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

/**
 * Abrir modal para adicionar produto
 */
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Novo Produto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('show');
}

/**
 * Abrir modal para editar produto
 */
window.editProduct = async function(productId) {
    try {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        editingProductId = productId;
        document.getElementById('modalTitle').textContent = 'Editar Produto';
        
        document.getElementById('productId').value = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productMinStock').value = product.minStock || 5;
        document.getElementById('productDescription').value = product.description || '';
        
        document.getElementById('productModal').classList.add('show');
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        showNotification('Erro ao carregar produto', 'error');
    }
};

/**
 * Fechar modal
 */
function closeModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('productForm').reset();
    editingProductId = null;
}

/**
 * Submeter formulário
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        minStock: parseInt(document.getElementById('productMinStock').value) || 5,
        description: document.getElementById('productDescription').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Validação
    if (!productData.name || !productData.category || productData.price < 0 || productData.stock < 0) {
        showNotification('Preencha todos os campos obrigatórios corretamente', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        const productsRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('products');

        if (editingProductId) {
            // Atualizar produto existente
            await productsRef.doc(editingProductId).update(productData);
            showNotification('Produto atualizado com sucesso!', 'success');
            
            await logAction('update_product', `Atualizou produto: ${productData.name}`);
        } else {
            // Criar novo produto
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await productsRef.add(productData);
            showNotification('Produto criado com sucesso!', 'success');
            
            await logAction('create_product', `Criou produto: ${productData.name}`);
        }

        closeModal();
        await loadProducts();

    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar produto', 'error');
    }
}

/**
 * Excluir produto
 */
window.deleteProduct = async function(productId, productName) {
    if (!confirm(`Deseja realmente excluir o produto "${productName}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('products')
            .doc(productId)
            .delete();

        showNotification('Produto excluído com sucesso!', 'success');
        await logAction('delete_product', `Excluiu produto: ${productName}`);
        await loadProducts();

    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        showNotification('Erro ao excluir produto', 'error');
    }
};

/**
 * Aplicar filtros
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const stockFilter = document.getElementById('filterStock').value;

    const filtered = products.filter(product => {
        // Filtro de busca
        const matchSearch = product.name.toLowerCase().includes(searchTerm) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm));
        
        // Filtro de categoria
        const matchCategory = !categoryFilter || product.category === categoryFilter;
        
        // Filtro de estoque
        let matchStock = true;
        if (stockFilter === 'low') {
            matchStock = product.stock < 10;
        } else if (stockFilter === 'normal') {
            matchStock = product.stock >= 10 && product.stock <= 50;
        } else if (stockFilter === 'high') {
            matchStock = product.stock > 50;
        }

        return matchSearch && matchCategory && matchStock;
    });

    renderProducts(filtered);
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
