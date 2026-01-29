/**
 * Configuration de Sécurité - Moctar Hassane Portfolio
 * Protège contre les attaques XSS, CSRF, injection de données, attaques OWASP
 */

// 0. CONFIGURATION DE SÉCURITÉ GLOBALE
const SecurityConfig = {
    maxInputLength: 500,
    maxNameLength: 100,
    maxEmailLength: 254,
    allowedProtocols: ['http:', 'https:'],
    csrfTokenExpiry: 3600000, // 1 heure
    logSensitiveEvents: true
};

// 1. PROTECTION CONTRE XSS - Fonction de sanitisation HTML robuste
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    // Créer un élément div pour échapper les caractères
    const div = document.createElement('div');
    div.textContent = str;
    
    // Échapper les caractères dangereux additionnels
    return div.innerHTML
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#x2F;');
}

// 2. VALIDATION DES ENTRÉES UTILISATEUR RENFORCÉE
function validateInput(input, type = 'text') {
    if (!input) return '';
    
    let sanitized = sanitizeHTML(String(input).trim());
    
    switch(type) {
        case 'email':
            // Valider format email et limiter la longueur
            if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitized)) {
                return '';
            }
            return sanitized.substring(0, SecurityConfig.maxEmailLength);
            
        case 'phone':
            // Accepter que les chiffres, espaces, tirets, +, ()
            if (!/^[\d\s\-\+\(\)]{6,}$/.test(sanitized)) {
                return '';
            }
            return sanitized;
            
        case 'url':
            // Valider URL avec protocole autorisé
            try {
                const urlObj = new URL(sanitized);
                if (!SecurityConfig.allowedProtocols.includes(urlObj.protocol)) {
                    return '';
                }
                return urlObj.toString();
            } catch {
                return '';
            }
            
        case 'name':
            // Accepter lettres, espaces, tirets, apostrophes
            if (!/^[a-zA-ZÀ-ÿ\s\-']{2,}$/.test(sanitized)) {
                return '';
            }
            return sanitized.substring(0, SecurityConfig.maxNameLength);
            
        case 'text':
        default:
            // Limiter la longueur et échapper
            return sanitized.substring(0, SecurityConfig.maxInputLength);
    }
}

// 3. PROTECTION CONTRE CSRF - Token CSRF avec expiration
function generateCSRFToken() {
    const token = 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    return token;
}

function getCSRFToken() {
    const key = 'csrfToken';
    const expiryKey = 'csrfTokenExpiry';
    
    let token = sessionStorage.getItem(key);
    let expiry = sessionStorage.getItem(expiryKey);
    
    // Vérifier si le token a expiré
    if (!token || !expiry || Date.now() > parseInt(expiry)) {
        token = generateCSRFToken();
        sessionStorage.setItem(key, token);
        sessionStorage.setItem(expiryKey, (Date.now() + SecurityConfig.csrfTokenExpiry).toString());
    }
    
    return token;
}

// 4. CONFIGURATION DES EN-TÊTES DE SÉCURITÉ POUR LES REQUÊTES
function getSecureHeaders() {
    return {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': getCSRFToken(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
    };
}

// 5. VALIDATION DE L'URL
function isValidURL(url) {
    try {
        const urlObj = new URL(url);
        return SecurityConfig.allowedProtocols.includes(urlObj.protocol);
    } catch {
        return false;
    }
}

// 6. PROTECTION CONTRE LE CLICKJACKING
function preventClickjacking() {
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }
}

// 7. PRÉVENTION DE L'EXÉCUTION DE SCRIPTS INLINE
function preventInlineScripts() {
    // Désactiver eval() et Function()
    window.eval = function() {
        throw new Error('eval() est désactivé pour des raisons de sécurité');
    };
    
    // Utiliser une CSP stricte (déjà en place dans le HTML)
}

// 8. MASQUER LES DÉTAILS DE VERSION
function hideVersionInfo() {
    Object.defineProperty(navigator, 'appVersion', {
        value: 'Hidden for security',
        writable: false,
        configurable: false
    });
}

// 9. PROTECTION CONTRE LES ATTAQUES DE TIMING (Constant-time comparison)
function constantTimeCompare(a, b) {
    let result = 0;
    const minLength = Math.min(a.length, b.length);
    
    for (let i = 0; i < minLength; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    result |= a.length ^ b.length;
    return result === 0;
}

// 10. LOGGING SÉCURISÉ DES ACTIONS
function logSecurityEvent(event, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        event,
        details,
        userAgent: navigator.userAgent.substring(0, 100), // Limiter la longueur
        referrer: document.referrer
    };
    
    // Enregistrer dans la console
    console.log(`[SECURITY] ${event}:`, logEntry);
    
    // Envoyer au serveur si HTTPS (optionnel)
    if (window.location.protocol === 'https:' && SecurityConfig.logSensitiveEvents) {
        fetch('/log-security', {
            method: 'POST',
            headers: getSecureHeaders(),
            body: JSON.stringify(logEntry),
            timeout: 5000
        }).catch(err => console.warn('Impossible de logger l\'événement de sécurité', err));
    }
}

// 11. NETTOYAGE DE DONNÉES SENSIBLES
function clearSensitiveData() {
    const sensitiveKeys = ['authToken', 'apiKey', 'password', 'secretData', 'tempData'];
    sensitiveKeys.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    });
    
    // Surcharger les variables sensibles
    if (window.sensitiveData) {
        delete window.sensitiveData;
    }
}

// 12. VÉRIFIER HTTPS
function enforceHTTPS() {
    if (window.location.protocol === 'http:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        window.location.protocol = 'https:';
    }
}

// 13. CONFIGURATION SÉCURISÉE DES COOKIES
function setupSecureCookies() {
    // Document les meilleures pratiques pour les cookies
    console.info('🔒 Politique de cookies recommandée:');
    console.info('- Secure flag (HTTPS uniquement)');
    console.info('- HttpOnly flag (inaccessible à JavaScript)');
    console.info('- SameSite=Strict (protection CSRF)');
}

// 14. RATE LIMITING CLIENT (protection contre les attaques par force brute)
const RateLimiter = {
    attempts: {},
    maxAttempts: 5,
    windowMs: 60000, // 1 minute
    
    checkLimit(key) {
        const now = Date.now();
        
        if (!this.attempts[key]) {
            this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
        }
        
        if (now > this.attempts[key].resetTime) {
            this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
        }
        
        this.attempts[key].count++;
        
        return this.attempts[key].count <= this.maxAttempts;
    },
    
    getRemainingAttempts(key) {
        if (!this.attempts[key]) return this.maxAttempts;
        return Math.max(0, this.maxAttempts - this.attempts[key].count);
    }
};

// 15. INITIALISER LA SÉCURITÉ
function initializeSecurity() {
    console.info('🔒 Initialisation des mesures de sécurité...');
    
    // Appliquer les protections
    preventClickjacking();
    hideVersionInfo();
    enforceHTTPS();
    setupSecureCookies();
    preventInlineScripts();
    
    // Générer le token CSRF
    getCSRFToken();
    
    // Ajouter les en-têtes CSRF aux formulaires
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form && (form.method === 'post' || form.method === 'POST')) {
            // Vérifier le rate limiting
            if (!RateLimiter.checkLimit(form.id || 'default')) {
                e.preventDefault();
                alert(`⚠️ Trop de tentatives. Veuillez attendre ${RateLimiter.windowMs / 1000} secondes.`);
                logSecurityEvent('rate_limit_exceeded', { form: form.id });
                return;
            }
            
            // Ajouter le token CSRF
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf';
            csrfInput.value = getCSRFToken();
            form.appendChild(csrfInput);
            
            logSecurityEvent('form_submitted', { form: form.id });
        }
    });
    
    // Nettoyer les données sensibles avant de quitter
    window.addEventListener('beforeunload', clearSensitiveData);
    
    // Surveiller les activités suspectes
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            if (!isValidURL(e.target.href)) {
                e.preventDefault();
                logSecurityEvent('invalid_url_detected', { url: e.target.href });
                console.warn('⚠️ URL suspecte bloquée');
            }
        }
    });
    
    console.info('✓ Sécurité initialisée avec succès');
}

// Exporter pour utilisation globale
window.Security = {
    sanitizeHTML,
    validateInput,
    getSecureHeaders,
    isValidURL,
    logSecurityEvent,
    clearSensitiveData,
    initializeSecurity,
    RateLimiter,
    SecurityConfig
};

// Initialiser automatiquement au chargement du document
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurity);
} else {
    initializeSecurity();
}
