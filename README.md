# 🏪 Gerenciando Comércio - SaaS Multi-Tenant

Sistema completo de gestão para comércios formais e informais, com suporte a produtos e serviços.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Auth + Firestore)
- **Deploy**: Vercel
- **Gráficos**: Chart.js

## 📦 Características

- ✅ Multi-tenant (múltiplas empresas isoladas)
- ✅ Autenticação segura com Firebase
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão de produtos e serviços
- ✅ Controle de vendas e estoque
- ✅ Relatórios exportáveis
- ✅ Interface moderna dark theme
- ✅ Totalmente responsivo

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone [seu-repo]
cd gerenciandocomercio
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password)
3. Crie um banco Firestore
4. Copie as credenciais Web e Admin SDK
5. Renomeie `.env.example` para `.env` e preencha os valores

### 4. Configure as regras do Firestore

Copie o conteúdo de `firestore.rules` para o Firebase Console.

### 5. Execute localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 6. Deploy na Vercel

```bash
npm run deploy
```

Ou conecte o repositório diretamente no [Vercel Dashboard](https://vercel.com).

## 📁 Estrutura do Projeto

```
/public           # Arquivos estáticos (HTML)
/js              # JavaScript modules
/css             # Estilos
/api             # Vercel API Routes
```

## 🔐 Segurança

- Dados isolados por empresa (companyId)
- Custom claims no Firebase Auth
- Regras de segurança no Firestore
- Validação de tokens em todas as APIs

## 📊 Modelo Multi-Tenant

Cada empresa possui seus próprios dados isolados:

```
/companies/{companyId}
  ├── /users
  ├── /products
  ├── /services
  ├── /sales
  └── /logs
```

## 🎨 Temas de Cores

- Fundo: Dark (#0a0a0a)
- Destaque: Verde Neon (#00ff88)
- Texto: Branco/Cinza claro

## 📝 Licença

MIT

## 🤝 Suporte

Para suporte, envie um email para: suporte@seudominio.com
