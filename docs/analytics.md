# Mesure des campagnes du portfolio

## Solution retenue

Le site est un site HTML/CSS/JavaScript statique publié depuis `public/` par GitHub Pages. GoatCounter est utilisé pour les statistiques de pages et de campagnes : son script est léger, il ne requiert ni backend ni cookie, et les paramètres UTM permettent de comparer les liens par source, medium et campagne. Le code du site chargé depuis `analytics-config.js` est un identifiant public, pas une clé secrète.

Google Analytics 4 sait exploiter les UTM, mais ajoute une collecte et une configuration de consentement plus complexes. Cloudflare Web Analytics est une bonne option gratuite et respectueuse de la vie privée pour les pages et référents, mais son tableau de bord est moins directement centré sur les rapports de campagnes UTM. GoatCounter répond donc mieux au besoin précis de comparer ces liens sans ajouter un serveur.

## Activation

Le suivi est volontairement inactif tant que l’identifiant du site n’a pas été configuré.

1. Créez un site GoatCounter et relevez son code de site (le sous-domaine, sans `.goatcounter.com`).
2. Dans [`public/analytics-config.js`](../public/analytics-config.js), remplacez la valeur vide de `goatCounterSiteCode` par ce code, par exemple `"mon-portfolio"`.
3. Publiez le dépôt : le workflow GitHub Pages déploie automatiquement `public/`.
4. Ouvrez le portfolio et contrôlez dans GoatCounter que la visite de test apparaît. Le blocage de la collecte par DNT ou Global Privacy Control est respecté.

Aucune clé API n’est utilisée ou nécessaire dans le navigateur. Le script de mesure est chargé de façon asynchrone ; si le code est vide, aucune requête vers GoatCounter n’est effectuée. Si le service est indisponible, le portfolio reste utilisable.

Les pages du portfolio (accueil, blog, galerie et fiches projets) sont mesurées. Le générateur de liens et le guide technique ne sont volontairement pas comptabilisés.

## Convention UTM

Les trois paramètres sont toujours renseignés, en minuscules, sans espace ni donnée personnelle :

- `utm_source` : plateforme ou origine, par exemple `whatsapp`, `linkedin`, `facebook`, `cv`, `github`.
- `utm_medium` : emplacement/format précis, par exemple `status`, `profile`, `post`, `pdf`.
- `utm_campaign` : initiative suivie ; utiliser `portfolio` pour les liens généraux et un nom stable pour une campagne ponctuelle.

| Canal | Lien |
| --- | --- |
| WhatsApp | `https://hassane-sdg.github.io/portfolio/?utm_source=whatsapp&utm_medium=status&utm_campaign=portfolio` |
| LinkedIn | `https://hassane-sdg.github.io/portfolio/?utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio` |
| Facebook | `https://hassane-sdg.github.io/portfolio/?utm_source=facebook&utm_medium=post&utm_campaign=portfolio` |
| CV | `https://hassane-sdg.github.io/portfolio/?utm_source=cv&utm_medium=pdf&utm_campaign=portfolio` |
| GitHub | `https://hassane-sdg.github.io/portfolio/?utm_source=github&utm_medium=profile&utm_campaign=portfolio` |

Conservez les valeurs d’une diffusion à l’autre pour pouvoir les comparer. Si vous partagez plusieurs emplacements sur une même plateforme, distinguez-les dans `utm_medium` (par exemple `profile`, `post`, `status`). N’ajoutez pas de nom, adresse e-mail, numéro de téléphone ni autre identifiant à l’URL.

## Créer un lien

Ouvrez [`public/utm-link-generator.html`](../public/utm-link-generator.html) (après publication : `https://hassane-sdg.github.io/portfolio/utm-link-generator.html`), saisissez la source, le medium et la campagne, puis générez et copiez le résultat. Le formulaire est exécuté dans le navigateur et n’envoie pas les valeurs saisies. Il est également possible de composer manuellement une URL en suivant la convention ci-dessus. Il n’est pas nécessaire de modifier le générateur pour ajouter un canal.

## Consulter et interpréter les statistiques

Connectez-vous au tableau de bord GoatCounter du site (à l’adresse `https://<code-de-site>.goatcounter.com/`), puis ouvrez le rapport des campagnes. Comparez les valeurs de source, medium et campaign et les pages vues associées. Par exemple, `linkedin / profile / portfolio` regroupe les visites issues du lien de profil LinkedIn ; `cv / pdf / portfolio` identifie les ouvertures provenant du lien placé dans le CV.

Un rapport compte des visites/pages vues mesurées, pas nécessairement des personnes uniques. Les bloqueurs, le refus de JavaScript, DNT/GPC, les règles du navigateur et les aperçus automatiques des plateformes peuvent réduire ou gonfler les valeurs : comparez les canaux avec la même convention et interprétez les chiffres comme des tendances, pas comme un décompte exact de personnes.

## Confidentialité et données

Le code du portfolio ne crée pas d’identifiant visiteur, n’utilise ni cookie ni stockage local, et ne réalise aucun fingerprinting. GoatCounter reçoit les données techniques nécessaires à la mesure agrégée, notamment la page consultée, les paramètres UTM, le référent lorsqu’il est disponible, ainsi que certaines informations de navigateur/appareil et de région décrites par le fournisseur. Comme pour toute requête web, l’adresse IP est visible par le service au niveau réseau ; consultez la politique de confidentialité GoatCounter pour ses modalités de traitement et de conservation. DNT et Global Privacy Control désactivent le chargement du compteur.

Ne mettez aucune donnée personnelle ou confidentielle dans les paramètres UTM. Évaluez les obligations d’information/consentement applicables à votre audience et vérifiez les conditions et limites de l’offre GoatCounter au moment de l’inscription.

## Tests pratiques

Après activation et publication, ouvrez successivement l’URL du CV ci-dessus puis `https://hassane-sdg.github.io/portfolio/` sans UTM. La première visite doit apparaître sous la campagne `cv / pdf / portfolio`, la seconde comme visite non balisée. Vérifiez aussi un lien vers une fiche projet, par exemple `project-details.html?project=glacier&utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio` : le paramètre `project` continue de sélectionner le projet et les UTM restent disponibles au compteur.
