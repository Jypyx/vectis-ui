export default {
  title: 'Installation',
  lead: "Vectis UI est distribué sous la forme d'un unique paquet npm. Son intégration dans un projet Vue 3 se résume toujours à deux étapes : installer le paquet et importer la feuille de styles. Les guides ci-dessous vous montrent comment appliquer ces deux étapes selon votre configuration.",

  viteHeading: 'Avec Vite',
  viteBody:
    "Vectis UI s'intègre dans n'importe quelle application Vue 3, qu'elle soit générée avec <code>create-vue</code> ou un autre projet Vite. Vue étant une peer dependency, elle n'est pas directement incluse dans notre paquet. Cela évite les conflits en s'assurant qu'il n'y a toujours qu'une seule instance de Vue dans votre projet final.",
  viteStyles:
    "Importez ensuite la feuille de styles globale une seule fois, au niveau du point d'entrée de votre application (ex. <code>main.ts</code>). Le fichier <code>styles.css</code> inclut le reset CSS, les design tokens et les styles de base communs (seulement 4,33 ko gzippé). Les styles propres à chaque composant sont quant à eux automatiquement chargés lors de leur import.",

  nuxtHeading: 'Avec Nuxt 3 ou 4',
  nuxtBody: "Nuxt incluant déjà Vue, vous n'avez qu'à ajouter le paquet Vectis UI à votre projet.",
  nuxtStyles:
    "Déclarez la feuille de styles directement dans <code>nuxt.config.ts</code> plutôt que de l'importer dans un fichier JavaScript. Nuxt pourra ainsi l'injecter dans le <code>&lt;head&gt;</code> de la page lors du rendu serveur (SSR), évitant un chargement asynchrone et tout flash visuel (FOUC).",
  nuxtSsr:
    "Aucune configuration supplémentaire n'est requise. Distribué nativement au format ESM, le paquet ne nécessite pas d'option <code>build.transpile</code>. Tous les composants sont totalement compatibles SSR : ils n'accèdent aux objets du navigateur (<code>window</code>, <code>document</code>) qu'au sein de <code>onMounted</code> ou des gestionnaires d'événements. De plus, ils utilisent le composable <code>useId()</code> de Vue pour garantir la cohérence des identifiants entre le serveur et le client.",

  cssHeading: 'CSS des composants',
  cssBody:
    "Le CSS de chaque composant est directement lié à celui-ci via un import statique. Les outils comme Vite, Nitro ou Webpack le transforment automatiquement en une feuille de styles prioritaire, garantissant l'affichage correct des styles même pour les routes chargées à la demande (lazy loading).",
}
