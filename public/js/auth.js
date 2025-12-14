// ========================================
// SISTEMA DE AUTENTICAÇÃO
// ========================================

const { auth, db } = window.firebaseApp;

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginLoading = document.getElementById('loginLoading');
const loadingOverlay = document.getElementById('loadingOverlay');
const alertContainer = document.getElementById('alertContainer');

const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

const forgotPasswordLink = document.getElementById('forgotPassword');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const cancelReset = document.getElementById('cancelReset');
const sendResetEmailBtn = document.getElementById('sendResetEmail');
const resetEmailInput = document.getElementById('resetEmail');

// ========================================
// LOGIN
// ========================================

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validações
    if (!email || !password) {
      showAlert('Por favor, preencha todos os campos', 'error');
      return;
    }

    // Desabilitar botão
    setButtonLoading(true);

    try {
      // Configurar persistência
      const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;

      await auth.setPersistence(persistence);

      // Fazer login
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Buscar dados do usuário
      const tokenResult = await user.getIdTokenResult(true);
      const companyId = tokenResult.claims.companyId;
      const role = tokenResult.claims.role;

      if (!companyId) {
        throw new Error('Usuário sem empresa associada. Entre em contato com o suporte.');
      }

      // Verificar status da empresa
      const companyDoc = await db.collection('companies').doc(companyId).get();
      
      if (!companyDoc.exists) {
        throw new Error('Empresa não encontrada.');
      }

      const companyData = companyDoc.data();
      
      if (companyData.status !== 'active') {
        throw new Error('Empresa inativa. Entre em contato com o suporte.');
      }

      // Criar log de login
      await db.collection('companies').doc(companyId).collection('logs').add({
        action: 'user_login',
        userId: user.uid,
        details: { email, role },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showAlert('Login realizado com sucesso!', 'success');

      // Redirecionar
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (error) {
      console.error('Erro no login:', error);

      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desabilitado.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert(errorMessage, 'error');
      setButtonLoading(false);
    }
  });
}

// ========================================
// TOGGLE PASSWORD VISIBILITY
// ========================================

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
  });
}

// ========================================
// RECUPERAÇÃO DE SENHA
// ========================================

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', () => {
    forgotPasswordModal.classList.add('active');
  });
}

if (closeForgotModal) {
  closeForgotModal.addEventListener('click', () => {
    forgotPasswordModal.classList.remove('active');
  });
}

if (cancelReset) {
  cancelReset.addEventListener('click', () => {
    forgotPasswordModal.classList.remove('active');
  });
}

if (sendResetEmailBtn) {
  sendResetEmailBtn.addEventListener('click', async () => {
    const email = resetEmailInput.value.trim();

    if (!email) {
      alert('Por favor, digite seu email');
      return;
    }

    if (!utils.isValidEmail(email)) {
      alert('Email inválido');
      return;
    }

    sendResetEmailBtn.disabled = true;
    sendResetEmailBtn.textContent = 'Enviando...';

    try {
      await auth.sendPasswordResetEmail(email);
      
      alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
      forgotPasswordModal.classList.remove('active');
      resetEmailInput.value = '';

    } catch (error) {
      console.error('Erro ao enviar email:', error);

      let errorMessage = 'Erro ao enviar email. Tente novamente.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email não encontrado.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }

      alert(errorMessage);

    } finally {
      sendResetEmailBtn.disabled = false;
      sendResetEmailBtn.textContent = 'Enviar Link';
    }
  });
}

// Fechar modal ao clicar fora
if (forgotPasswordModal) {
  forgotPasswordModal.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.classList.remove('active');
    }
  });
}

// ========================================
// LOGOUT
// ========================================

async function logout() {
  try {
    showLoading();
    
    const user = auth.currentUser;
    
    if (user) {
      // Buscar companyId
      const tokenResult = await user.getIdTokenResult();
      const companyId = tokenResult.claims.companyId;

      // Criar log de logout
      if (companyId) {
        await db.collection('companies').doc(companyId).collection('logs').add({
          action: 'user_logout',
          userId: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    await auth.signOut();
    window.location.href = 'login.html';

  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    hideLoading();
  }
}

// ========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ========================================

async function checkAuth(requireAuth = true) {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (requireAuth && !user) {
        // Usuário não autenticado, redirecionar para login
        window.location.href = 'login.html';
        reject(new Error('Não autenticado'));
        return;
      }

      if (!requireAuth && user) {
        // Usuário autenticado, redirecionar para dashboard
        window.location.href = 'dashboard.html';
        reject(new Error('Já autenticado'));
        return;
      }

      if (user) {
        try {
          // Buscar dados do usuário
          const tokenResult = await user.getIdTokenResult(true);
          const companyId = tokenResult.claims.companyId;
          const role = tokenResult.claims.role;

          if (!companyId) {
            throw new Error('Usuário sem empresa associada');
          }

          // Buscar dados da empresa
          const companyDoc = await db.collection('companies').doc(companyId).get();
          
          if (!companyDoc.exists) {
            throw new Error('Empresa não encontrada');
          }

          const companyData = companyDoc.data();

          if (companyData.status !== 'active') {
            await auth.signOut();
            throw new Error('Empresa inativa');
          }

          // Buscar dados completos do usuário
          const userDoc = await db.collection('companies')
            .doc(companyId)
            .collection('users')
            .doc(user.uid)
            .get();

          const userData = userDoc.exists ? userDoc.data() : {};

          resolve({
            user,
            companyId,
            role,
            company: companyData,
            userData: {
              ...userData,
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.name
            }
          });

        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          await auth.signOut();
          window.location.href = 'login.html';
          reject(error);
        }
      } else {
        resolve(null);
      }
    });
  });
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function setButtonLoading(loading) {
  if (loading) {
    loginBtn.disabled = true;
    loginBtnText.classList.add('hidden');
    loginLoading.classList.remove('hidden');
    loadingOverlay.classList.add('active');
  } else {
    loginBtn.disabled = false;
    loginBtnText.classList.remove('hidden');
    loginLoading.classList.add('hidden');
    loadingOverlay.classList.remove('active');
  }
}

function showAlert(message, type = 'info') {
  // Remover alertas anteriores
  alertContainer.innerHTML = '';

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  alertContainer.appendChild(alert);

  // Remover após 5 segundos
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Exportar funções globalmente
window.authManager = {
  checkAuth,
  logout
};
