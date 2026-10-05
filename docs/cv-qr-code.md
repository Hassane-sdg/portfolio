# QR code du CV

Le dépôt ne contient pas de fichier de CV (PDF, DOCX, HTML ou autre) : le QR code est donc livré séparément, sans modification du CV ni génération d’un PDF final.

- [`cv-portfolio-qr.svg`](./cv-portfolio-qr.svg) : version vectorielle noire sur fond blanc, dimensions physiques 30 × 30 mm.
- [`cv-portfolio-qr.png`](./cv-portfolio-qr.png) : version PNG 1300 × 1300 px, environ 1100 ppp à 30 mm.

Les deux fichiers encodent exactement :

`https://hassane-sdg.github.io/portfolio/?utm_source=cv&utm_medium=pdf&utm_campaign=portfolio`

Pour l’intégrer au CV, placez le QR code dans l’en-tête, près des coordonnées ou des liens professionnels, à 30 mm de côté. Gardez la marge blanche intégrée intacte et ajoutez le libellé à côté, pas dans le QR code : « Portfolio & projets — Scanner ». Le PNG et le SVG sont monochromes, sans logo ni effet ; le SVG est recommandé pour préserver la netteté à l’impression.

Contrôle réalisé : décodage exact de l’URL avec OpenCV après rendu du PNG à 325 × 325 px, soit environ 27,5 mm à 300 ppp. L’URL, ses trois paramètres UTM et la zone de silence de quatre modules ont aussi été vérifiés. Faites un essai avec un smartphone après insertion dans le document et avant impression en série.
