/**
 * API ROUTE: CREATE USER
 * Adiciona novo usuário (funcionário) à empresa
 * Vercel Serverless Function
 */

const admin = require('firebase-admin');

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Validar token
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const companyId = decodedToken.companyId;
        const userRole = decodedToken.role;

        // Apenas admins podem criar usuários
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão' });
        }

        const { name, email, password, role } = req.body;

        // Validações
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        }

        // Criar usuário no Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        // Criar usuário na subcoleção da empresa
        await db.collection('companies')
            .doc(companyId)
            .collection('users')
            .doc(userRecord.uid)
            .set({
                name,
                email,
                role,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        // Definir Custom Claims
        await auth.setCustomUserClaims(userRecord.uid, {
            companyId,
            role
        });

        // Log
        await db.collection('companies')
            .doc(companyId)
            .collection('logs')
            .add({
                action: 'user_created',
                details: `Usuário criado: ${email} (${role})`,
                userId: decodedToken.uid,
                userName: decodedToken.email,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        return res.status(201).json({
            success: true,
            userId: userRecord.uid,
            message: 'Usuário criado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        
        let errorMessage = 'Erro ao criar usuário';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está cadastrado';
        }

        return res.status(500).json({ error: errorMessage });
    }
};
