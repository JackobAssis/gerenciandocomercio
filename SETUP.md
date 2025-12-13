# 💼 Gerenciando Comércio - SaaS Multi-Tenant

Sistema completo de gestão comercial para empresas formais e informais, com suporte a produtos e serviços, isolamento multi-tenant e arquitetura escalável.

---

## 🚀 Recursos Principais

✅ **Multi-tenant**: Várias empresas usando a mesma aplicação com dados isolados  
✅ **Gestão de Produtos**: CRUD completo com controle de estoque  
✅ **Gestão de Serviços**: Cadastro de serviços com duração e preços  
✅ **Vendas**: Registro de vendas com atualização automática de estoque  
✅ **Relatórios**: Dashboard com gráficos e exportação CSV  
✅ **Autenticação**: Firebase Authentication com custom claims  
✅ **Logs de Auditoria**: Rastreamento completo de ações  
✅ **Segurança**: Regras Firestore para isolamento de dados  

---

## 🏗️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Authentication, Firestore)
- **API**: Vercel Serverless Functions
- **Gráficos**: Chart.js
- **Deploy**: Vercel

---

## 📁 Estrutura do Projeto

```
gerenciandocomercio/
├── public/
│   ├── index.html          # Landing page
│   ├── login.html          # Login
│   ├── dashboard.html      # Dashboard principal
│   ├── products.html       # Gestão de produtos
│   ├── services.html       # Gestão de serviços
│   ├── sales.html          # Vendas
│   └── reports.html        # Relatórios
├── js/
│   ├── firebase-config.js  # Configuração Firebase
│   ├── auth.js             # Autenticação e cadastro
│   ├── dashboard.js        # Lógica do dashboard
│   ├── products.js         # CRUD produtos
│   ├── services.js         # CRUD serviços
│   ├── sales.js            # Sistema de vendas
│   ├── reports.js          # Relatórios e gráficos
│   └── utils.js            # Funções utilitárias
├── css/
│   ├── global.css          # Estilos globais
│   └── dashboard.css       # Estilos do dashboard
├── api/
│   ├── createCompany.js    # API: Criar empresa
│   ├── createUser.js       # API: Criar usuário
│   └── getDashboard.js     # API: Dados do dashboard
├── firestore.rules         # Regras de segurança
├── package.json            # Dependências
├── vercel.json             # Configuração Vercel
└── README.md               # Documentação
```

---

## ⚙️ Configuração e Instalação

### 1️⃣ **Pré-requisitos**

- Node.js 18+ instalado
- Conta Firebase (plano Blaze para Cloud Functions)
- Conta Vercel
- Git

### 2️⃣ **Configurar Firebase**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Authentication** (método Email/Senha)
4. Ative **Firestore Database** (modo produção)
5. Nas configurações do projeto, copie as credenciais Web

6. Edite o arquivo `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

7. **Implantar Regras de Segurança**:
   - No Firebase Console, vá em Firestore > Regras
   - Copie o conteúdo de `firestore.rules` e publique

### 3️⃣ **Configurar Service Account (APIs)**

1. No Firebase Console: Configurações > Contas de Serviço
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. Extraia as seguintes informações:
   - `project_id`
   - `client_email`
   - `private_key`

### 4️⃣ **Instalar Dependências**

```bash
npm install
```

### 5️⃣ **Configurar Variáveis de Ambiente (Vercel)**

Crie um arquivo `.env` local (não commitar):

```env
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...SUA_CHAVE...\n-----END PRIVATE KEY-----\n"
```

### 6️⃣ **Deploy na Vercel**

```bash
# Instalar CLI da Vercel
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Durante o deploy, adicione as variáveis de ambiente quando solicitado.

Ou pelo dashboard da Vercel:
1. Importe o repositório
2. Vá em Settings > Environment Variables
3. Adicione as 3 variáveis acima

---

## 🔐 Estrutura Multi-Tenant (Firestore)

```
/companies
  /{companyId}
    name: string
    plan: "free" | "pro" | "premium"
    status: "active" | "inactive"
    
    /users/{userId}
      name, email, role
    
    /products/{productId}
      name, price, stock, category
    
    /services/{serviceId}
      name, price, duration, description
    
    /sales/{saleId}
      items[], total, paymentMethod, createdAt
    
    /logs/{logId}
      action, details, userId, createdAt
```

### Custom Claims (Firebase Auth)

```json
{
  "companyId": "abc123",
  "role": "admin" | "employee"
}
```

---

## 🧪 Testando Localmente

### Opção 1: Live Server (VS Code)

1. Instale a extensão "Live Server"
2. Clique com botão direito em `public/index.html`
3. Selecione "Open with Live Server"

### Opção 2: Servidor HTTP Simples

```bash
npx http-server public -p 8080
```

Acesse: `http://localhost:8080`

⚠️ **Nota**: As API routes só funcionarão após deploy na Vercel.

---

## 📊 Fluxo de Uso

### 1️⃣ **Cadastro de Empresa**

1. Acesse a landing page
2. Clique em "Criar minha empresa"
3. Preencha os dados
4. O sistema automaticamente:
   - Cria usuário no Firebase Auth
   - Cria empresa no Firestore
   - Define custom claims
   - Faz login automático

### 2️⃣ **Login**

- Email e senha
- Validação de companyId via custom claims
- Redirecionamento para dashboard

### 3️⃣ **Cadastrar Produtos**

- Dashboard > Produtos > + Novo Produto
- Preencha: nome, categoria, preço, estoque
- Sistema valida e salva

### 4️⃣ **Cadastrar Serviços**

- Dashboard > Serviços > + Novo Serviço
- Preencha: nome, preço, duração, descrição

### 5️⃣ **Registrar Venda**

- Dashboard > Vendas
- Adicione produtos/serviços ao carrinho
- Defina forma de pagamento
- Finalize a venda
- **Estoque é atualizado automaticamente**

### 6️⃣ **Ver Relatórios**

- Dashboard > Relatórios
- Filtre por período
- Veja gráficos e métricas
- Exporte para CSV

---

## 🔒 Segurança

### Regras Firestore

✅ Usuários só acessam dados de sua empresa  
✅ Custom claims validam companyId  
✅ Logs não podem ser editados/deletados  
✅ Apenas admins criam usuários  
✅ Master admin acessa todas as empresas  

### API Routes

✅ Validação de token Firebase  
✅ Verificação de companyId  
✅ Verificação de role (admin/employee)  
✅ CORS configurado  

---

## 🎨 Personalização Visual

### Cores (global.css)

```css
--primary-color: #00ff88;    /* Verde neon */
--background-dark: #0f0f1e;  /* Fundo escuro */
--card-bg: #1a1a2e;          /* Cards */
--text-light: #e0e0e0;       /* Texto */
```

---

## 🚨 Troubleshooting

### Erro: "Permission denied"
- Verifique se as regras do Firestore estão corretas
- Confirme que o custom claim `companyId` está definido

### Erro: "Token inválido"
- Faça logout e login novamente
- Verifique se as credenciais Firebase estão corretas

### API Routes não funcionam
- Confirme que as variáveis de ambiente estão na Vercel
- Verifique logs em Vercel > Project > Deployments > Function Logs

### Estoque não atualiza
- Verifique a estrutura do documento `products`
- Confirme que o campo `stock` existe e é numérico

---

## 📈 Planos Futuros (Monetização)

### Free (Atual)
- 1 usuário
- 50 produtos
- 100 vendas/mês

### Pro ($29/mês)
- 5 usuários
- Produtos ilimitados
- Vendas ilimitadas
- Suporte por email

### Premium ($99/mês)
- Usuários ilimitados
- Multi-loja
- API personalizada
- Suporte prioritário

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 📧 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Email: suporte@gerenciandocomercio.com (exemplo)

---

## ✅ Checklist de Deploy

- [ ] Firebase configurado (Auth + Firestore)
- [ ] Regras Firestore publicadas
- [ ] Service Account gerado
- [ ] Variáveis de ambiente na Vercel
- [ ] Código deployado na Vercel
- [ ] Teste de cadastro de empresa
- [ ] Teste de login
- [ ] Teste de CRUD (produtos/serviços)
- [ ] Teste de venda
- [ ] Teste de relatórios

---

**Desenvolvido com ❤️ para empreendedores**
