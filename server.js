require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', 'file://'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Sert les fichiers statiques

// Validation de la clé API au démarrage
if (!GEMINI_API_KEY) {
    console.error('❌ ERREUR: GEMINI_API_KEY non configurée dans .env');
    process.exit(1);
}

// Route racine - Sert maamportfolio.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/maamportfolio.html');
});

// Endpoint de test
app.get('/health', (req, res) => {
    res.json({ status: '✅ Serveur actif', timestamp: new Date().toISOString() });
});

// Endpoint principal du chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message, model = 'gemini-2.0-flash' } = req.body;

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message invalide' });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'Le message ne peut pas être vide' });
        }

        if (message.trim().length > 5000) {
            return res.status(400).json({ error: 'Message trop long (max 5000 caractères)' });
        }

        // Context pour que Gemini comprenne le contexte du portfolio
        const systemPrompt = `Tu es l'assistant IA du portfolio de Sawadogo Moctar Hassane, développeur et étudiant en Électronique & Informatique Industrielle. 

Voici les informations à connaître:
- Nom: Sawadogo Moctar Hassane
- Titre: Étudiant | Électronique & Informatique Industrielle
- Email: contact@mhtech.bf
- Téléphone: +226 76320088
- GitHub: https://github.com/MHTechOfficial
- LinkedIn: https://www.linkedin.com/in/moctar-hassane-sawadogo

Compétences principales:
- Langages: HTML5, CSS3, JavaScript, Python, C++, Arduino
- Frontend: Responsive Design, Animation CSS, Intégration API
- Backend: Node.js, Express, APIs REST
- Outils: Git, VS Code, Arduino IDE, Figma
- Domaines: Robotique, Drones, IoT, Développement Web

Projets réalisés:
1. Drone Game - Jeu interactif avec contrôle du drone
2. Car Project - Système de contrôle automobile
3. Portfolio Personnel - Site Web moderne avec chatbot IA
4. Système IOT - Intégration de capteurs et Arduino

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
            return res.status(401).json({ 
                error: 'Clé API invalide ou expirée',
                details: 'Vérifiez que GEMINI_API_KEY est correctement configurée'
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({ 
                error: 'Limite de requêtes dépassée',
                details: 'Attendez un moment avant de réessayer'
            });
        }

        return res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message
        });
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
║  🚀 Serveur Chatbot MHTech Démarré    ║
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
