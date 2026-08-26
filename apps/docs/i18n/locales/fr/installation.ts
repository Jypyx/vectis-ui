export default {
  title: 'Installation',
  lead: "La bibliothèque est livrée précompilée en ESM et sûre en SSR. Les imports nommés sont élagués par Vite et Nitro ; aucun <code>build.transpile</code> n'est nécessaire.",

  vueHeading: 'Vue 3',
  vueBody:
    "<code>styles.css</code> est le noyau : le reset, les tokens et le décor commun à tous les composants, 6,7 ko gzip. Le CSS propre à chaque composant voyage avec lui et arrive par l'import que vous écrivez déjà.",

  nuxtHeading: 'Nuxt 3',
  nuxtBody:
    "Ce site EST cette configuration : c'est une application Nuxt 3, prérendue en fichiers statiques, ce qui en fait aussi un test de bout en bout de la sûreté SSR de la bibliothèque — un composant qui irait chercher <code>window</code> hors d'un gestionnaire ferait échouer le build plutôt que le visiteur.",

  cssHeading: 'CSS des composants',
  cssBody:
    "Le CSS d'un composant voyage avec lui sous la forme d'un simple import statique, que Vite, Nitro et webpack transforment tous en lien bloquant le rendu — y compris pour une route chargée paresseusement. Gardez le CSS client extrait dans un fichier et la question du flash ne se pose pas.",
  cssQuote:
    'Une page qui importe un seul VButton télécharge 7,25 ko gzip de CSS — le noyau plus la feuille de ce composant. Les cinquante-cinq autres feuilles ne sont jamais demandées.',

  getHeading: 'Ce que vous obtenez',
  getBody:
    "Uniquement des exports nommés, pour que le bundler élague ce dont vous ne vous servez pas. Le dictionnaire français est optionnel pour la même raison : ne pas l'importer suffit à le laisser dehors.",
}
