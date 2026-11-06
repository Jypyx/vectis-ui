export default {
  title: 'Installation',
  lead: 'Installez <code>vectis-ui</code> dans votre projet Vue 3 et importez sa feuille de styles globale.',
  viteHeading: 'Avec Vite',
  viteBody: 'Installez <code>vectis-ui</code> et sa peer dependency, <code>vue</code>.',
  viteStyles:
    'Importez <code>vectis-ui/styles.css</code> une seule fois dans <code>main.ts</code>. Ce fichier contient le reset CSS, les design tokens et les styles communs.',
  nuxtHeading: 'Avec Nuxt 3 ou 4',
  nuxtBody: 'Installez <code>vectis-ui</code>. Nuxt fournit déjà Vue.',
  nuxtStyles:
    'Dans <code>nuxt.config.ts</code>, ajoutez la feuille de styles globale au tableau <code>css</code> et <code>vectis-ui</code> à <code>build.transpile</code>.',
  nuxtSsr:
    'Le rendu côté serveur nécessite <code>build.transpile</code>. Sans ce réglage, le serveur de production charge le paquet avec Node, qui ne peut pas importer les fichiers CSS des composants, et toutes les pages échouent.',
  cssHeading: 'CSS des composants',
  cssBody:
    'Les styles des composants sont chargés avec leurs imports. Aucune feuille de styles individuelle n’est à importer.',
  cssSsr:
    'Pour le rendu côté serveur avec Vite hors de Nuxt, ajoutez <code>vectis-ui</code> à <code>ssr.noExternal</code> afin que Vite intègre ces imports CSS au bundle.',
}
