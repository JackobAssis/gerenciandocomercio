/**
 * API ROUTE: GET DASHBOARD DATA
 * Retorna métricas do dashboard
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
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

        if (!companyId) {
            return res.status(403).json({ error: 'Empresa não identificada' });
        }

        // Buscar dados
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const salesSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('sales')
            .where('createdAt', '>=', today)
            .get();

        let todayRevenue = 0;
        let todaySales = salesSnapshot.size;

        salesSnapshot.forEach(doc => {
            const data = doc.data();
            todayRevenue += data.total || 0;
        });

        // Total geral (últimos 30 dias para performance)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const allSalesSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('sales')
            .where('createdAt', '>=', thirtyDaysAgo)
            .get();

        let totalRevenue = 0;
        allSalesSnapshot.forEach(doc => {
            const data = doc.data();
            totalRevenue += data.total || 0;
        });

        return res.status(200).json({
            success: true,
            data: {
                todayRevenue,
                todaySales,
                totalRevenue,
                totalSales: allSalesSnapshot.size
            }
        });

    } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        return res.status(500).json({ error: 'Erro ao buscar dados' });
    }
};
