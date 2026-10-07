export default {
  title: 'Thèmes',
  lead: 'Choisissez un thème clair ou sombre avec <code>data-theme</code>. Personnalisez les styles des composants en redéfinissant les variables CSS <code>--vectis-*</code>.',
  switchHeading: 'Changer de thème',
  switchBody:
    'Ajoutez <code>data-theme="dark"</code> à <code>&lt;html&gt;</code> pour le thème sombre. Utilisez <code>data-theme="light"</code> pour le thème clair, également appliqué par défaut.',
  switchLight: 'Clair',
  switchDark: 'Sombre',
  switchScope:
    'Placez <code>data-theme</code> sur un conteneur pour limiter le thème à une section. Les conteneurs imbriqués peuvent utiliser un autre thème.',
  switchColorScheme:
    'Chaque thème définit aussi <code>color-scheme</code>, qui adapte les contrôles de formulaire natifs et les barres de défilement.',
  switchSystem:
    'La bibliothèque ne choisit pas de thème selon la préférence système. Lisez <code>prefers-color-scheme</code> dans votre application si nécessaire. Cet exemple lit la préférence une seule fois ; appliquez-la avant le premier affichage pour éviter un flash de thème.',
  tokensHeading: 'Personnaliser les couleurs et les tokens',
  tokensBody: 'Les design tokens sont exposés sous forme de variables CSS à deux niveaux :',
  tokensLevels: [
    '<strong>Primitives</strong> : palettes de couleurs et échelles d’espacement, de typographie, de rayons, d’ombres et d’animation.',
    '<strong>Rôles sémantiques</strong> : variables nommées selon leur usage, comme <code>--vectis-color-surface</code> ou <code>--vectis-color-accent</code>. Utilisez-les pour personnaliser les composants.',
  ],
  tokensRoles:
    'Modifier un token sémantique met à jour les composants qui l’utilisent. La couleur du focus a son propre token, <code>--vectis-focus-ring-color</code>. Vérifiez le contraste du texte et du focus lorsque vous changez de palette.',
  tokensOverride:
    'Redéfinissez les tokens sur <code>:root</code> pour toute la page, sur une classe pour une section ou sur <code>[data-theme="dark"]</code> pour le thème sombre.',
  tokensDemoCaption:
    'Ce panneau redéfinit les couleurs d’accent et de focus ainsi que les rayons des angles. Le texte d’accent utilise une valeur distincte en thème sombre.',
  tokensOklch:
    'Les palettes intégrées utilisent OKLCH. Vous pouvez choisir d’autres formats de couleur CSS pour vos surcharges. Vérifiez les états survolés, appuyés et teintés obtenus, y compris ceux calculés avec <code>color-mix()</code>.',
  tokensPalettes:
    'Cinq palettes sont incluses : <code>gray</code>, <code>indigo</code>, <code>red</code>, <code>green</code> et <code>amber</code>. Pour utiliser une autre palette, affectez vos couleurs aux tokens sémantiques.',
  tokensReferenceBefore:
    'Les descriptions des tokens et leurs valeurs par défaut dans les deux thèmes figurent sur la page',
  tokensReferenceAfter: '.',
  layersHeading: 'Couches CSS',
  layersBody:
    'La bibliothèque déclare quatre couches, dans cet ordre : <code>vectis.reset</code>, <code>vectis.tokens</code>, <code>vectis.components</code> et <code>vectis.utilities</code>. Écrivez vos surcharges hors de ces couches pour qu’elles priment sur les déclarations normales de la bibliothèque.',
  layersTrap:
    'Si votre application utilise des couches, déclarez sa couche de surcharge après celles de la bibliothèque. Évitez d’ajouter des surcharges à <code>vectis.components</code>, où la spécificité des sélecteurs et l’ordre du code déterminent encore la priorité.',
  buildHeading: 'Cibles de compilation CSS',
  buildBody:
    'Alignez les cibles de compilation CSS sur les versions de navigateurs prises en charge par la bibliothèque. Des cibles plus anciennes peuvent entraîner la réécriture de fonctionnalités comme <code>:dir()</code> et les couleurs OKLCH.',
  buildDir:
    'Par exemple, convertir <code>:dir(rtl)</code> en sélecteurs de langue casse les styles liés à la direction sur une page avec <code>dir="rtl"</code> et <code>lang="en"</code>. Vérifiez le build de production en plus du serveur de développement.',
  buildFix:
    'Définissez <code>build.cssTarget</code> dans Vite ou <code>vite.build.cssTarget</code> dans Nuxt :',
}
