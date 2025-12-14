# 🔐 Configuração das Variáveis de Ambiente - Vercel

## ✅ Credenciais Extraídas do Service Account

Você já tem o arquivo JSON do Firebase Service Account. Agora vamos configurar essas credenciais na Vercel.

---

## 📋 Valores a Configurar

### 1. FIREBASE_PROJECT_ID
```
gerenciandocomercio
```

### 2. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@gerenciandocomercio.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC52OWDf+W1hwjh
JvxyFURC/9PqCv41YUNPgj0MwLuFH9YIZR/Ozh272UvOI8sd3WgCoK9uBd54HZ0Y
oLy39q8r02EuoPVUUj8kPNdwkxig+olFXsm04hgHcHuB3yug3XCaIuQtGqSUek8E
PoeeoEkX1c80hM+JbChCPBc1puKzfmOWn5pM9gtJkpW1wYrBVTLDYfcaeyhvtwNl
hXBF7oS0/8MiRGi6Chg0kyuFx8hMA9a0tFWIoccUa7b5n6MMUGmKnoR1gFGRirO6
cy3VuWcJB43l/ho59xij28x0uuHA8w7/EhDjDT2wjQoRmvF1e7aPHArVwGD+0j2o
SJrcX2PlAgMBAAECggEAEim9fJWSWKRi3MZXo7qqWjXwew4p/AOOdYXP+6AWc5NB
8r4XVrnUNBivjOz4m+mYkbEsk/8k1+5k/RQwfXYxdoIJHGqEr4H+Q8dictEddhYm
Nk5mPjRejtOSboXmGKmrqJTCYhoZfZ1afZqy3HDj092Ei6hzNAYLBTYkOo0d2NbV
oG71eO5SqZzCgfwvtfAsiAVH5uxzFkq6VF8pwZ1e54iYHOHecTFhfqsGSr1I687v
MG0ic8qLN5zADvvlkhobIXVsdmSKHP1CFrKr09zmQ6yfK74/tVH8lmJpCo6JhafL
NcXcN9o7UwTEMOZdPTUAF6YU2r+lg40q/i1+OB243QKBgQDpAoLMANrS51QHQae2
4xjFrrwSsC7nNcTAZwrK6kyvcsc3Nwq/3wsLNn8yGJrPeoLmAujGSuLchnHcoHP+
YWoPeYz3is2Pgt71b7EistmbSVpvJiwfkgjxVRxlOPX9j+4uXAjmjYlcuEoxwy1F
35mPixGfi75jz2u0g1rUUz2ahwKBgQDMLyDEOsSfyRtrSourvAcCUPfpSIKcpTCg
y/qUsyiggPOxykqsXsfJUsqDaHns52mO/xTyclhGrScmlFN4TWLD6+Acu1XPdzbf
G68ye+9/oBDEuZu5NFAUqtX39jNIL4cPqE8SNFK1yyH7c8bqO9L+BZewSDBsFzEy
FBUhAClNMwKBgBBlwNaiaMPWy68HC8pvCNtAhLO7+lEDE6mGltfYzTS7mxFjqjn+
dESBvUnFOX/IW1Xcdo0d0AE85N5l3EPWjyQvpZ/2AKlMyGv1RD3w4Cdxbg/MW+aM
3Fw/ZRQqggUqD9TrXST8aOJBhdciqRj1t1TGsKLNrsRPYID/jXDLutYZAoGAKgKY
T0d4JRgPmCeiTRdGqedW2pycovYp5yuQxv+FoGBnw3DHpGdr27Q5Doh0bZW/VjiN
asSz/ParU3i5I8toQr9JQSAaK7FvjL/5b/2n7S5VxOQbciOdRmNP2tDBBF0jAMm0
Wx6A1f6RY1cS2ias5q7n4tE3hUXQTWlsX3nVBZkCgYAwMSGtcKZEapd9v8RZ6yy6
otipFZONeFM/mS5Qckz2JS5yGS6voVdb3NEftZAaIcN4YE9uy0w7kOH9APjC5YLD
3rdfpMv+nbaxr9cScgBYUbsseztfzzSy3eJYjFw6SiqHa6oMvNAE88iWo3vzIW0c
1gkkDk0k11qogh9s6LODgA==
-----END PRIVATE KEY-----
```

⚠️ **IMPORTANTE:** Quando colar na Vercel, a chave deve estar em **UMA ÚNICA LINHA** com `\n` representando as quebras:

```
-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC52OWDf+W1hwjh\nJvxyFURC/9PqCv41YUNPgj0MwLuFH9YIZR/Ozh272UvOI8sd3WgCoK9uBd54HZ0Y\noLy39q8r02EuoPVUUj8kPNdwkxig+olFXsm04hgHcHuB3yug3XCaIuQtGqSUek8E\nPoeeoEkX1c80hM+JbChCPBc1puKzfmOWn5pM9gtJkpW1wYrBVTLDYfcaeyhvtwNl\nhXBF7oS0/8MiRGi6Chg0kyuFx8hMA9a0tFWIoccUa7b5n6MMUGmKnoR1gFGRirO6\ncy3VuWcJB43l/ho59xij28x0uuHA8w7/EhDjDT2wjQoRmvF1e7aPHArVwGD+0j2o\nSJrcX2PlAgMBAAECggEAEim9fJWSWKRi3MZXo7qqWjXwew4p/AOOdYXP+6AWc5NB\n8r4XVrnUNBivjOz4m+mYkbEsk/8k1+5k/RQwfXYxdoIJHGqEr4H+Q8dictEddhYm\nNk5mPjRejtOSboXmGKmrqJTCYhoZfZ1afZqy3HDj092Ei6hzNAYLBTYkOo0d2NbV\noG71eO5SqZzCgfwvtfAsiAVH5uxzFkq6VF8pwZ1e54iYHOHecTFhfqsGSr1I687v\nMG0ic8qLN5zADvvlkhobIXVsdmSKHP1CFrKr09zmQ6yfK74/tVH8lmJpCo6JhafL\nNcXcN9o7UwTEMOZdPTUAF6YU2r+lg40q/i1+OB243QKBgQDpAoLMANrS51QHQae2\n4xjFrrwSsC7nNcTAZwrK6kyvcsc3Nwq/3wsLNn8yGJrPeoLmAujGSuLchnHcoHP+\nYWoPeYz3is2Pgt71b7EistmbSVpvJiwfkgjxVRxlOPX9j+4uXAjmjYlcuEoxwy1F\n35mPixGfi75jz2u0g1rUUz2ahwKBgQDMLyDEOsSfyRtrSourvAcCUPfpSIKcpTCg\ny/qUsyiggPOxykqsXsfJUsqDaHns52mO/xTyclhGrScmlFN4TWLD6+Acu1XPdzbf\nG68ye+9/oBDEuZu5NFAUqtX39jNIL4cPqE8SNFK1yyH7c8bqO9L+BZewSDBsFzEy\nFBUhAClNMwKBgBBlwNaiaMPWy68HC8pvCNtAhLO7+lEDE6mGltfYzTS7mxFjqjn+\ndESBvUnFOX/IW1Xcdo0d0AE85N5l3EPWjyQvpZ/2AKlMyGv1RD3w4Cdxbg/MW+aM\n3Fw/ZRQqggUqD9TrXST8aOJBhdciqRj1t1TGsKLNrsRPYID/jXDLutYZAoGAKgKY\nT0d4JRgPmCeiTRdGqedW2pycovYp5yuQxv+FoGBnw3DHpGdr27Q5Doh0bZW/VjiN\nasSz/ParU3i5I8toQr9JQSAaK7FvjL/5b/2n7S5VxOQbciOdRmNP2tDBBF0jAMm0\nWx6A1f6RY1cS2ias5q7n4tE3hUXQTWlsX3nVBZkCgYAwMSGtcKZEapd9v8RZ6yy6\notipFZONeFM/mS5Qckz2JS5yGS6voVdb3NEftZAaIcN4YE9uy0w7kOH9APjC5YLD\n3rdfpMv+nbaxr9cScgBYUbsseztfzzSy3eJYjFw6SiqHa6oMvNAE88iWo3vzIW0c\n1gkkDk0k11qogh9s6LODgA==\n-----END PRIVATE KEY-----\n
```

---

## 🚀 Passo a Passo - Configurar na Vercel

### Opção 1: Via Dashboard (Recomendado)

1. **Acesse seu projeto na Vercel:**
   ```
   https://vercel.com/[seu-usuario]/gerenciandocomercio
   ```

2. **Vá em Settings → Environment Variables**

3. **Adicione cada variável:**

   **Variável 1:**
   - Name: `FIREBASE_PROJECT_ID`
   - Value: `gerenciandocomercio`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variável 2:**
   - Name: `FIREBASE_CLIENT_EMAIL`
   - Value: `firebase-adminsdk-fbsvc@gerenciandocomercio.iam.gserviceaccount.com`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variável 3:**
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: (copie o texto acima com `\n` em uma única linha)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

4. **Clique em "Save"** para cada variável

5. **Faça um Redeploy:**
   - Vá em **Deployments**
   - Clique nos 3 pontinhos (...) do último deploy
   - Selecione **Redeploy**

---

### Opção 2: Via CLI do Vercel

```bash
# Fazer login
vercel login

# Adicionar variáveis (será solicitado a colar o valor)
vercel env add FIREBASE_PROJECT_ID
# Cole: gerenciandocomercio
# Selecione: Production, Preview, Development

vercel env add FIREBASE_CLIENT_EMAIL
# Cole: firebase-adminsdk-fbsvc@gerenciandocomercio.iam.gserviceaccount.com
# Selecione: Production, Preview, Development

vercel env add FIREBASE_PRIVATE_KEY
# Cole: -----BEGIN PRIVATE KEY-----\nMIIEvAIB...\n-----END PRIVATE KEY-----\n
# (tudo em uma linha com \n)
# Selecione: Production, Preview, Development

# Fazer deploy
vercel --prod
```

---

## 🧪 Testar Localmente (Opcional)

O arquivo `.env.local` já foi criado com as credenciais. Para testar:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Rodar localmente
npm run dev
# ou
vercel dev
```

---

## ✅ Verificar se Funcionou

Após configurar e fazer redeploy:

1. **Acesse seu site na Vercel**
2. **Tente fazer cadastro de um novo usuário**
3. **Verifique no Firebase Console:**
   - Authentication → Users (deve aparecer o usuário)
   - Firestore Database → Coleções (deve aparecer `users` e `companies`)

---

## ⚠️ Segurança

✅ `.env.local` está no `.gitignore` - NÃO será commitado  
✅ Service Account JSON foi usado apenas para extrair valores  
✅ Variáveis estão seguras na Vercel  
❌ **NUNCA** commite credenciais no Git  

---

## 📝 Resumo dos Valores

| Variável | Valor |
|----------|-------|
| `FIREBASE_PROJECT_ID` | `gerenciandocomercio` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@gerenciandocomercio.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | (chave privada completa com `\n`) |

---

**Próximo passo:** Configure essas 3 variáveis na Vercel e faça um redeploy! 🚀
