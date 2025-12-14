# 🔐 Configuração de Variáveis de Ambiente na Vercel

## Erro Comum
```
Environment Variable "FIREBASE_PROJECT_ID" references Secret "firebase_project_id", which does not exist.
```

## Solução: Adicionar Variáveis de Ambiente

### Via Dashboard da Vercel:

1. **Acesse seu projeto na Vercel:**
   - https://vercel.com/seu-usuario/gerenciando-comercio

2. **Vá em Settings > Environment Variables**

3. **Adicione as 3 variáveis obrigatórias:**

#### Variável 1: FIREBASE_PROJECT_ID
```
Name: FIREBASE_PROJECT_ID
Value: gerenciandocomercio
Environment: Production, Preview, Development
```

✅ **Valor correto já configurado no vercel.json**

#### Variável 2: FIREBASE_CLIENT_EMAIL
```
Name: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@gerenciandocomercio.iam.gserviceaccount.com
Environment: Production, Preview, Development
```

⚠️ **Obtenha este valor no Firebase Console:**
- Vá em: Project Settings > Service Accounts
- Clique em "Generate new private key"
- Abra o arquivo JSON baixado
- Copie o valor de `client_email`

#### Variável 3: FIREBASE_PRIVATE_KEY
```
Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n
Environment: Production, Preview, Development
```

⚠️ **Obtenha este valor no mesmo arquivo JSON:**
- Copie o valor de `private_key`
- **IMPORTANTE:** Mantenha os `\n` no texto. A chave deve estar em uma única linha

**Exemplo correto:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### Via CLI da Vercel (Alternativa):

```bash
# Login
vercel login

# Adicionar variáveis
vercel env add FIREBASE_PROJECT_ID
# Digite: gerenciandocomercio
# Selecione: Production, Preview, Development

vercel env add FIREBASE_CLIENT_EMAIL
# Cole o client_email
# Selecione: Production, Preview, Development

vercel env add FIREBASE_PRIVATE_KEY
# Cole a private_key (com \n)
# Selecione: Production, Preview, Development
```

## 4. Redesploy

Após adicionar as variáveis, faça um novo deploy:

```bash
vercel --prod
```

Ou no dashboard: **Deployments > ... > Redeploy**

## 📋 Como Obter Service Account do Firebase

### Passo a passo:

1. **Acesse o Firebase Console:**
   https://console.firebase.google.com/project/gerenciandocomercio

2. **Vá em:** ⚙️ Project Settings > Service Accounts

3. **Clique em:** "Generate new private key"

4. **Confirme** e baixe o arquivo JSON

5. **Abra o arquivo** e extraia:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY

## ⚠️ Segurança

- ❌ **NUNCA** commite o arquivo JSON no Git
- ❌ **NUNCA** compartilhe as chaves
- ✅ Adicione apenas na Vercel como variáveis de ambiente
- ✅ O arquivo JSON já está no `.gitignore`

## ✅ Verificar se Funcionou

Após o deploy, teste as APIs:

```bash
# Testar API
curl https://seu-projeto.vercel.app/api/getDashboard
```

Se retornar erro 401 (sem token), está correto! ✅
Se retornar erro 500, verifique as variáveis novamente.

## 🔄 Resetar Chaves (se necessário)

Se as chaves vazaram:

1. Firebase Console > Service Accounts
2. Delete a service account antiga
3. Crie uma nova
4. Atualize as variáveis na Vercel
5. Redesploy

---

**Pronto! Seu backend na Vercel estará funcionando.** 🚀
