/**
 * API ROUTE: CREATE COMPANY
 * Cria uma nova empresa (autoatendimento)
 * Vercel Serverless Function
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin (apenas uma vez)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { companyName, adminName, email, password } = req.body;

        // Validações
        if (!companyName || !adminName || !email || !password) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        }

        // 1. Criar usuário no Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: adminName
        });

        // 2. Criar empresa no Firestore
        const companyRef = db.collection('companies').doc();
        const companyId = companyRef.id;

        await companyRef.set({
            name: companyName,
            plan: 'free',
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            adminEmail: email
        });

        // 3. Criar usuário admin na subcoleção
        await companyRef.collection('users').doc(userRecord.uid).set({
            name: adminName,
            email,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 4. Definir Custom Claims
        await auth.setCustomUserClaims(userRecord.uid, {
            companyId,
            role: 'admin'
        });

        // 5. Log de auditoria
        await companyRef.collection('logs').add({
            action: 'company_created',
            details: 'Empresa criada via autoatendimento',
            userId: userRecord.uid,
            userName: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(201).json({
            success: true,
            companyId,
            userId: userRecord.uid,
            message: 'Empresa criada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao criar empresa:', error);
        
        let errorMessage = 'Erro ao criar empresa';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está cadastrado';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido';
        }

        return res.status(500).json({ error: errorMessage });
    }
};
