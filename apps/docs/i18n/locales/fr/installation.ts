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
    'Ajoutez la feuille de styles globale au tableau <code>css</code> dans <code>nuxt.config.ts</code>.',
  nuxtSsr: 'Les composants prennent en charge le rendu côté serveur.',
  cssHeading: 'CSS des composants',
  cssBody:
    'Les styles des composants sont chargés avec leurs imports. Aucune feuille de styles individuelle n’est à importer.',
}
