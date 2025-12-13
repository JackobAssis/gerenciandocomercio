// Configuração do Firebase - Cliente
// Credenciais do projeto Gerenciando Comércio

const firebaseConfig = {
  apiKey: "AIzaSyAgje2t3sxd0-HOX7giRF9yaUkmZDPIv4A",
  authDomain: "gerenciandocomercio.firebaseapp.com",
  projectId: "gerenciandocomercio",
  storageBucket: "gerenciandocomercio.firebasestorage.app",
  messagingSenderId: "292981567670",
  appId: "1:292981567670:web:b20d43d5a6ba61b6c07617",
  measurementId: "G-HQ3LTK3NYT"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instâncias globais
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Exportar para uso global
window.firebaseApp = {
  auth,
  db,
  firebase
};
