// ========================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// ========================================

// ========================================
// AUTH MANAGER
// ========================================

window.authManager = {
  /**
   * Verifica autenticação do usuário
   */
  async checkAuth(requireAuth = true) {
    const { auth, db } = window.firebaseApp;
    
    return new Promise((resolve, reject) => {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          if (requireAuth) {
            window.location.href = 'login.html';
          }
          reject(new Error('Usuário não autenticado'));
          return;
        }

        try {
          // Buscar dados do token
          const tokenResult = await user.getIdTokenResult(true);
          const companyId = tokenResult.claims.companyId;
          const role = tokenResult.claims.role;

          if (!companyId) {
            throw new Error('Usuário sem empresa associada');
          }

          // Buscar dados do usuário no Firestore
          const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(user.uid).get();

          if (!userDoc.exists) {
            throw new Error('Dados do usuário não encontrados');
          }

          const userData = {
            uid: user.uid,
            email: user.email,
            name: userDoc.data().name || user.displayName,
            role: role,
            ...userDoc.data()
          };

          resolve({
            user,
            userData,
            companyId,
            role
          });
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          if (requireAuth) {
            alert(error.message);
            window.location.href = 'login.html';
          }
          reject(error);
        }
      });
    });
  },

  /**
   * Faz logout do usuário
   */
  async logout() {
    const { auth } = window.firebaseApp;
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  }
};

/**
 * Formata valor em moeda brasileira
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data para o formato brasileiro
 */
function formatDate(date) {
  if (!date) return '-';
  
  if (date.toDate) {
    date = date.toDate(); // Firestore Timestamp
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

/**
 * Formata data e hora
 */
function formatDateTime(date) {
  if (!date) return '-';
  
  if (date.toDate) {
    date = date.toDate();
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Formata número
 */
function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Valida email
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Gera ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Mostra loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay') || createLoadingOverlay();
  overlay.classList.add('active');
}

/**
 * Esconde loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Cria loading overlay se não existir
 */
function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Mostra toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove toast anterior se existir
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-left: 4px solid var(--accent-primary);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;

  // Cores baseadas no tipo
  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };

  toast.style.borderLeftColor = colors[type] || colors.info;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.25rem;">${getToastIcon(type)}</span>
      <span style="color: var(--text-primary);">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Retorna ícone do toast baseado no tipo
 */
function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

/**
 * Confirma ação com modal
 */
function confirmAction(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Confirmar Ação</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancelBtn">Cancelar</button>
        <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('confirmBtn').addEventListener('click', () => {
    modal.remove();
    onConfirm();
  });

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Sanitiza string para evitar XSS
 */
function sanitizeString(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Copia texto para clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copiado para área de transferência', 'success');
  } catch (error) {
    showToast('Erro ao copiar', 'error');
  }
}

/**
 * Download de arquivo
 */
function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados para CSV
 */
function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    showToast('Nenhum dado para exportar', 'warning');
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape aspas e vírgulas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
  showToast('Arquivo exportado com sucesso', 'success');
}

/**
 * Exporta dados para JSON
 */
function exportToJSON(data, filename) {
  if (!data) {
    showToast('Nenhum dado para exportar', 'warning');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
  showToast('Arquivo exportado com sucesso', 'success');
}

/**
 * Filtra array de objetos
 */
function filterData(data, searchTerm, fields) {
  if (!searchTerm) return data;

  searchTerm = searchTerm.toLowerCase();

  return data.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm);
    });
  });
}

/**
 * Ordena array de objetos
 */
function sortData(data, field, order = 'asc') {
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Lidar com timestamps do Firestore
    if (aVal && aVal.toDate) aVal = aVal.toDate();
    if (bVal && bVal.toDate) bVal = bVal.toDate();

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Agrupa dados por campo
 */
function groupBy(data, field) {
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Calcula soma de um campo
 */
function sum(data, field) {
  return data.reduce((total, item) => total + (item[field] || 0), 0);
}

/**
 * Calcula média de um campo
 */
function average(data, field) {
  if (data.length === 0) return 0;
  return sum(data, field) / data.length;
}

/**
 * Paginação de dados
 */
function paginate(data, page = 1, perPage = 10) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    data: data.slice(start, end),
    currentPage: page,
    totalPages: Math.ceil(data.length / perPage),
    totalItems: data.length,
    perPage
  };
}

/**
 * Trunca texto
 */
function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliza primeira letra
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Escape HTML para evitar XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exportar funções globalmente
window.utils = {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  isValidEmail,
  generateId,
  debounce,
  showLoading,
  hideLoading,
  showToast,
  confirmAction,
  sanitizeString,
  copyToClipboard,
  downloadFile,
  exportToCSV,
  exportToJSON,
  filterData,
  sortData,
  groupBy,
  sum,
  average,
  paginate,
  truncate,
  capitalize,
  escapeHtml
};
