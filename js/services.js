/**
 * GERENCIAMENTO DE SERVIÇOS
 * Sistema SaaS Multi-tenant
 */

let currentUser = null;
let currentCompany = null;
let services = [];
let editingServiceId = null;

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
            
            await loadServices();
            setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados', 'error');
        }
    });
});

/**
 * Carregar serviços
 */
async function loadServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '<div class="loading-card">Carregando serviços...</div>';

    try {
        const db = firebase.firestore();
        const servicesRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('services');

        const snapshot = await servicesRef.orderBy('createdAt', 'desc').get();
        
        services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });

        renderServices(services);
        await logAction('view_services', `Visualizou ${services.length} serviços`);

    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        grid.innerHTML = '<div class="error-card">Erro ao carregar serviços</div>';
        showNotification('Erro ao carregar serviços', 'error');
    }
}

/**
 * Renderizar serviços
 */
function renderServices(servicesToRender) {
    const grid = document.getElementById('servicesGrid');
    
    if (servicesToRender.length === 0) {
        grid.innerHTML = '<div class="empty-card">Nenhum serviço encontrado. Clique em "Novo Serviço" para adicionar.</div>';
        return;
    }

    grid.innerHTML = servicesToRender.map(service => {
        const statusClass = service.active !== false ? 'badge-success' : 'badge-danger';
        const statusText = service.active !== false ? 'Ativo' : 'Inativo';
        
        return `
            <div class="service-card" data-id="${service.id}">
                <div class="service-header">
                    <h3>${escapeHtml(service.name)}</h3>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <p class="service-description">${escapeHtml(service.description || 'Sem descrição')}</p>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="detail-label">💰 Preço:</span>
                        <strong>${formatCurrency(service.price)}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏱️ Duração:</span>
                        <strong>${formatDuration(service.duration)}</strong>
                    </div>
                </div>
                <div class="service-actions">
                    <button onclick="editService('${service.id}')" class="btn btn-secondary btn-sm">✏️ Editar</button>
                    <button onclick="deleteService('${service.id}', '${escapeHtml(service.name)}')" class="btn btn-danger btn-sm">🗑️ Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Formatar duração
 */
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    document.getElementById('addServiceBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('serviceForm').addEventListener('submit', handleSubmit);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('searchService').addEventListener('input', applyFilters);
    document.getElementById('filterDuration').addEventListener('change', applyFilters);
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('serviceModal');
        if (e.target === modal) closeModal();
    });
}

/**
 * Abrir modal para adicionar
 */
function openAddModal() {
    editingServiceId = null;
    document.getElementById('modalTitle').textContent = 'Novo Serviço';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceActive').checked = true;
    document.getElementById('serviceModal').classList.add('show');
}

/**
 * Editar serviço
 */
window.editService = async function(serviceId) {
    try {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        editingServiceId = serviceId;
        document.getElementById('modalTitle').textContent = 'Editar Serviço';
        
        document.getElementById('serviceId').value = serviceId;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceDuration').value = service.duration;
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceActive').checked = service.active !== false;
        
        document.getElementById('serviceModal').classList.add('show');
    } catch (error) {
        console.error('Erro ao editar serviço:', error);
        showNotification('Erro ao carregar serviço', 'error');
    }
};

/**
 * Fechar modal
 */
function closeModal() {
    document.getElementById('serviceModal').classList.remove('show');
    document.getElementById('serviceForm').reset();
    editingServiceId = null;
}

/**
 * Submeter formulário
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const serviceData = {
        name: document.getElementById('serviceName').value.trim(),
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseInt(document.getElementById('serviceDuration').value),
        description: document.getElementById('serviceDescription').value.trim(),
        active: document.getElementById('serviceActive').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!serviceData.name || !serviceData.description || serviceData.price < 0 || serviceData.duration < 1) {
        showNotification('Preencha todos os campos obrigatórios corretamente', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        const servicesRef = db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('services');

        if (editingServiceId) {
            await servicesRef.doc(editingServiceId).update(serviceData);
            showNotification('Serviço atualizado com sucesso!', 'success');
            await logAction('update_service', `Atualizou serviço: ${serviceData.name}`);
        } else {
            serviceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await servicesRef.add(serviceData);
            showNotification('Serviço criado com sucesso!', 'success');
            await logAction('create_service', `Criou serviço: ${serviceData.name}`);
        }

        closeModal();
        await loadServices();

    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço', 'error');
    }
}

/**
 * Excluir serviço
 */
window.deleteService = async function(serviceId, serviceName) {
    if (!confirm(`Deseja realmente excluir o serviço "${serviceName}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('companies')
            .doc(currentCompany.companyId)
            .collection('services')
            .doc(serviceId)
            .delete();

        showNotification('Serviço excluído com sucesso!', 'success');
        await logAction('delete_service', `Excluiu serviço: ${serviceName}`);
        await loadServices();

    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        showNotification('Erro ao excluir serviço', 'error');
    }
};

/**
 * Aplicar filtros
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchService').value.toLowerCase();
    const durationFilter = document.getElementById('filterDuration').value;

    const filtered = services.filter(service => {
        const matchSearch = service.name.toLowerCase().includes(searchTerm) ||
                          (service.description && service.description.toLowerCase().includes(searchTerm));
        
        let matchDuration = true;
        if (durationFilter === 'short') {
            matchDuration = service.duration < 30;
        } else if (durationFilter === 'medium') {
            matchDuration = service.duration >= 30 && service.duration <= 120;
        } else if (durationFilter === 'long') {
            matchDuration = service.duration > 120;
        }

        return matchSearch && matchDuration;
    });

    renderServices(filtered);
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
