require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']);
const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.PUBLIC_ORIGIN
].filter(Boolean));
const requestBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_MESSAGE_LENGTH = 5000;

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origine non autorisée'));
    },
    credentials: false
}));
app.use(express.json({ limit: '16kb' }));

// Ne jamais exposer les secrets, le dépôt ou le code serveur via les fichiers statiques.
app.use((req, res, next) => {
    const blockedPath = /^\/(?:\.git|\.venv|node_modules)(?:\/|$)|^\/(?:\.env(?:\.|$)|server\.js$|package(?:-lock)?\.json$|\.htaccess$)/i.test(req.path);
    if (blockedPath) {
        return res.status(404).end();
    }
    return next();
});
const publicDirectory = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirectory, { dotfiles: 'deny', index: false }));

function isRateLimited(clientKey) {
    const now = Date.now();
    const bucket = requestBuckets.get(clientKey);
    if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
        requestBuckets.set(clientKey, { startedAt: now, count: 1 });
        return false;
    }
    bucket.count += 1;
    return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    for (const [key, bucket] of requestBuckets) {
        if (bucket.startedAt < cutoff) requestBuckets.delete(key);
    }
}, RATE_LIMIT_WINDOW_MS).unref();

// Validation de la clé API au démarrage
if (!GEMINI_API_KEY) {
    console.error('❌ ERREUR: GEMINI_API_KEY non configurée dans .env');
    process.exit(1);
}

// Route racine - Sert la page d'accueil publique.
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'index.html'));
});

// Endpoint de test
app.get('/health', (req, res) => {
    res.json({ status: '✅ Serveur actif', timestamp: new Date().toISOString() });
});

// Endpoint principal du chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
        if (isRateLimited(clientKey)) {
            return res.status(429).json({ error: 'Trop de requêtes. Réessayez dans une minute.' });
        }

        const { message, model = 'gemini-2.0-flash' } = req.body;

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message invalide' });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'Le message ne peut pas être vide' });
        }

        if (message.trim().length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)` });
        }

        if (typeof model !== 'string' || !ALLOWED_MODELS.has(model)) {
            return res.status(400).json({ error: 'Modèle non autorisé' });
        }

        // Context pour que Gemini comprenne le contexte du portfolio
        const systemPrompt = `Tu es l'assistant IA du portfolio de Moctar Hassane Sawadogo, Ingénieur de Travaux en Électronique et Informatique Industrielle.

Voici les informations à connaître:
- Nom: Moctar Hassane Sawadogo
- Titre: Ingénieur de Travaux | Électronique & Informatique Industrielle
- Email: sawadogosmhtech@gmail.com
- Ambition entrepreneuriale: MHTech
- Téléphone: +226 76320088
- GitHub: https://github.com/Hassane-sdg
- LinkedIn: https://www.linkedin.com/in/moctar-hassane-sawadogo

Compétences principales:
- Langages: HTML5, CSS3, JavaScript, Python, C++, Arduino
- Frontend: Responsive Design, Animation CSS, Intégration API
- Backend: Node.js, Express, APIs REST
- Outils: Git, VS Code, Arduino IDE, Figma
- Domaines: Robotique, Drones, IoT, Développement Web

Projets réalisés:
1. Robot Éboueur Téléopéré pour le nettoyage des caniveaux - projet de fin de formation associant mécanique, motorisation, électronique embarquée, capteurs, communication sans fil et supervision à distance
2. Drone agricole intelligent
3. Système de contrôle de voiture via ESP32
4. Systèmes de pisciculture, jardinage automatisé et domotique

Réponds en français de manière professionnelle et amicale. Si quelqu'un te demande des informations sur Moctar, fournis les détails du portfolio. Sois concis et utile.`;

        // Appel à l'API Gemini via le serveur
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{ text: message }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 2048
                }
            },
            {
                headers: { 'x-goog-api-key': GEMINI_API_KEY },
                timeout: 30000
            }
        );

        // Extraction de la réponse
        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'Désolé, je n\'ai pas pu générer une réponse.';

        return res.json({
            success: true,
            response: aiResponse,
            model: model,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erreur Gemini API:', error.response?.data || error.message);

        // Gestion des erreurs spécifiques
        if (error.response?.status === 401) {
            return res.status(502).json({ error: 'Service IA temporairement indisponible' });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({ error: 'Limite du service IA atteinte. Réessayez plus tard.' });
        }

        return res.status(500).json({ error: 'Erreur serveur temporaire' });
    }
});

// Endpoint pour vérifier la configuration
app.get('/api/config', (req, res) => {
    res.json({
        apiConfigured: !!GEMINI_API_KEY,
        serverVersion: '1.0.0',
        supportedModels: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 MHTech Chatbot lancé                         ║
╠════════════════════════════════════════╣
║  URL: http://localhost:${PORT}${PORT === 3000 ? '  ' : '    '}║
║  API: http://localhost:${PORT}/api/chat ║
║  Health: http://localhost:${PORT}/health ║
╚════════════════════════════════════════╝
    `);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erreur non gérée:', reason);
});
