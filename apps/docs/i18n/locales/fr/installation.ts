export default {
  title: 'Installation',
  lead: "Vectis UI est publiée comme un unique paquet npm, et elle entre de la même façon dans n'importe quel projet Vue 3 : ajouter le paquet, charger une feuille de styles. Les deux parcours ci-dessous sont ces deux mêmes gestes, écrits pour la configuration que vous avez déjà.",

  viteHeading: 'Avec Vite',
  viteBody:
    "Une application Vue 3, créée avec <code>create-vue</code> ou par n'importe quel autre projet Vite. Vue est une dépendance pair et non quelque chose que la bibliothèque emporte avec elle : elle s'installe à côté, et il n'y a jamais qu'un seul exemplaire de Vue dans votre application.",
  viteStyles:
    "Chargez ensuite la feuille de styles du noyau, une seule fois, là où l'application démarre. <code>styles.css</code>, c'est le reset, les tokens et le décor commun à tous les composants, 4,33 ko gzip. Le CSS propre à chaque composant voyage avec lui et arrive par l'import que vous écrivez déjà.",

  nuxtHeading: 'Avec Nuxt 3 ou 4',
  nuxtBody: 'Nuxt apporte Vue avec lui : la bibliothèque est donc la seule chose à ajouter.',
  nuxtStyles:
    "La feuille de styles se déclare dans la configuration plutôt que de s'importer depuis un fichier, ce qui la place dans le <code>&lt;head&gt;</code> de la page rendue par le serveur, et non dans un chunk que le navigateur va chercher alors qu'il affiche déjà la page.",
  nuxtSsr:
    "Rien d'autre n'est nécessaire. Le paquet est précompilé en ESM, il n'y a donc aucune entrée <code>build.transpile</code> à écrire, et tous les composants sont sûrs au rendu serveur : aucun ne lit <code>window</code> ni <code>document</code> hors d'un gestionnaire ou de <code>onMounted</code>, et les identifiants qu'ils fabriquent viennent du <code>useId()</code> de Vue, si bien que le serveur et le navigateur tombent d'accord dessus. Ce site en est la démonstration plutôt que la promesse. C'est une application Nuxt 4 prérendue en fichiers statiques, où un composant qui irait chercher le DOM trop tôt ferait échouer le build plutôt que le visiteur.",

  cssHeading: 'CSS des composants',
  cssBody:
    "Le CSS d'un composant voyage avec lui sous la forme d'un simple import statique, que Vite, Nitro et webpack transforment tous en lien bloquant le rendu, y compris pour une route chargée paresseusement.",
}
