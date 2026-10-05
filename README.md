# Yolsii Viima Tech Portfolio

Portfolio personnel de Moctar Hassane Sawadogo, Ingénieur de Travaux en Électronique et Informatique Industrielle, avec ses projets de conception et son ambition Yolsii Viima Tech (« Vous faciliter la vie »).

## Structure

```text
portfolio1/
|- public/                 Site statique publiable
|  |- index.html           Page d'accueil
|  |- assets/              Images, galeries, projets et certificats
|  |- *.html               Pages secondaires
|  |- robots.txt
|  `- sitemap.xml
|- server/                 API Express pour le chatbot Gemini
|- scripts/                Outils d'optimisation des images
|- docs/                   Documents de travail
|- .env.example            Variables d'environnement attendues
`- package.json
```

## Demarrage local

Prerequis : Node.js 18 ou une version plus recente.

```bash
npm install
copy .env.example .env
npm start
```

Puis ouvrir `http://localhost:3000`.

Pour le developpement avec redemarrage automatique :

```bash
npm run dev
```

Le serveur exige `GEMINI_API_KEY` pour demarrer. Le fichier `.env` ne doit jamais etre commite.

## Deploiement

- **GitHub Pages** publie automatiquement le dossier `public/` avec le workflow `.github/workflows/deploy-pages.yml`.
- Le chatbot Gemini necessite un serveur Node separe (par exemple Render, Railway ou un VPS). GitHub Pages ne peut pas executer `server/server.js`.
- Pour utiliser le chatbot depuis un domaine distant, definir `PUBLIC_ORIGIN` dans l'environnement du serveur et adapter l'URL API dans la page si necessaire.

## Analytics et liens suivis

Le site utilise GoatCounter pour les statistiques de campagnes sans cookies. Pour l'activer, configurez le code de site public dans `public/analytics-config.js`, puis publiez le site. Les liens UTM peuvent etre generes dans `public/utm-link-generator.html`. Consultez [la documentation analytics](docs/analytics.md) pour l'activation, la convention UTM, les statistiques et les informations de confidentialite.

## Commandes utiles

```bash
npm start       # Lancer le serveur
npm run dev     # Lancer le serveur en mode developpement
```

## Securite

Les secrets sont fournis par les variables d'environnement. Ne publiez jamais `.env`, une cle Gemini ou des fichiers de production contenant des identifiants.

## Licence

MIT. Voir `LICENSE`.
