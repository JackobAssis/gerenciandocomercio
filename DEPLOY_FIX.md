# 🔧 Correções de Deploy - Caminhos de Arquivos

## ✅ Problema Resolvido

**Erro Original:**
```
Failed to load resource: the server responded with a status of 404
- global.css:1
- utils.js:1  
- firebase-config.js:1
- auth is not defined
```

## 🔍 Causa

Os arquivos HTML estavam usando caminhos relativos (`../css/`, `../js/`) que não funcionam corretamente com a estrutura de roteamento do Vercel.

## ✨ Solução Implementada

### 1. Atualização do vercel.json

Adicionado rotas específicas para servir arquivos CSS e JS da raiz:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/css/(.*)",
      "dest": "/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/js/$1"
    },
    {
      "src": "/(.*\\.(html|ico|png|jpg|jpeg|gif|svg))",
      "dest": "/public/$1"
    },
    {
      "src": "/",
      "dest": "/public/index.html"
    }
  ]
}
```

### 2. Correção dos Caminhos em Todos os HTMLs

**Antes:**
```html
<link rel="stylesheet" href="../css/global.css">
<script src="../js/firebase-config.js"></script>
```

**Depois:**
```html
<link rel="stylesheet" href="/css/global.css">
<script src="/js/firebase-config.js"></script>
```

### 3. Arquivos Corrigidos

✅ [public/index.html](public/index.html) - Landing page + cadastro  
✅ [public/login.html](public/login.html) - Tela de login  
✅ [public/dashboard.html](public/dashboard.html) - Dashboard principal  
✅ [public/onboarding.html](public/onboarding.html) - Onboarding (novo)  
✅ [public/products.html](public/products.html) - Gestão de produtos  
✅ [public/services.html](public/services.html) - Gestão de serviços  
✅ [public/sales.html](public/sales.html) - Registro de vendas  
✅ [public/reports.html](public/reports.html) - Relatórios  

### 4. Adicionada Verificação do Firebase

No [public/index.html](public/index.html):

```javascript
// Aguardar carregamento do Firebase
if (typeof firebase === 'undefined' || typeof auth === 'undefined' || typeof db === 'undefined') {
  console.error('Firebase não carregado corretamente. Verifique firebase-config.js');
  alert('Erro ao carregar o sistema. Recarregue a página.');
}
```

## 🚀 Como Testar Localmente

### Opção 1: Live Server (VS Code)
```bash
# Instalar extensão Live Server no VS Code
# Clicar com botão direito em public/index.html
# Selecionar "Open with Live Server"
```

### Opção 2: Python HTTP Server
```bash
# Rodar da raiz do projeto
python -m http.server 8000

# Acessar: http://localhost:8000/public/index.html
```

### Opção 3: Node.js http-server
```bash
# Instalar
npm install -g http-server

# Rodar
http-server -p 8000

# Acessar: http://localhost:8000/public/index.html
```

## 📦 Deploy na Vercel

### Comandos
```bash
# Fazer commit das alterações
git add .
git commit -m "fix: corrigir caminhos de CSS/JS para deploy"
git push

# Ou fazer deploy direto
vercel --prod
```

### Verificações Pós-Deploy

1. **CSS carregando:**
   - Abrir DevTools > Network
   - Verificar se `/css/global.css` retorna 200 (não 404)

2. **JS carregando:**
   - Verificar se `/js/firebase-config.js` retorna 200
   - Console não deve ter erros de "auth is not defined"

3. **Firebase conectado:**
   - Tentar fazer cadastro/login
   - Verificar no Firebase Console se os dados são salvos

## ⚠️ Importante

Antes de fazer deploy na Vercel, configure as variáveis de ambiente:

```bash
# No dashboard da Vercel: Settings > Environment Variables

FIREBASE_PROJECT_ID = gerenciandocomercio
FIREBASE_CLIENT_EMAIL = (obter do service account JSON)
FIREBASE_PRIVATE_KEY = (obter do service account JSON - manter \n)
```

## ✅ Checklist de Deploy

- [x] Caminhos CSS atualizados (`/css/`)
- [x] Caminhos JS atualizados (`/js/`)
- [x] vercel.json com rotas corretas
- [x] Verificação Firebase adicionada
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Service Account do Firebase criado
- [ ] Deploy realizado
- [ ] Testes de funcionalidade (cadastro/login)

## 🎯 Resultado Esperado

Após o deploy:
- ✅ Todos os CSS carregam (visual correto)
- ✅ Todos os JS carregam (sem erros 404)
- ✅ Firebase conecta (auth e db funcionando)
- ✅ Cadastro de usuário funciona
- ✅ Login funciona
- ✅ Dashboard carrega

---

**Data:** 14/12/2025  
**Status:** ✅ Correções aplicadas com sucesso
