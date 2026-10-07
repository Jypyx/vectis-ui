export default {
  title: 'Fonctions JavaScript',
  lead: 'Fonctions de configuration des langues et des icônes, et d’affichage des notifications. Importez-les par leur nom depuis <code>vectis-ui</code>.',

  exportedHeading: 'Exports publics',
  columnExport: 'Export',
  columnDoes: 'Usage',
  setLocale:
    'Définit la langue globale et les formats régionaux par défaut. Les composants avec une prop <code>locale</code> peuvent remplacer les formats.',
  registerMessages:
    'Enregistre ou met à jour un dictionnaire de langue. Les clés omises conservent les traductions précédentes, puis utilisent l’anglais en dernier recours.',
  dictionaries:
    'Dictionnaires anglais et français. L’anglais est utilisé par défaut ; importez et enregistrez <code>fr</code> pour activer le français.',
  setIconResolver:
    'Enregistre le résolveur d’icônes. Retournez <code>undefined</code> pour utiliser le SVG importé ou une ligature en dernier recours.',
  ligatureResolver: 'Crée un résolveur qui affiche les noms d’icônes avec une police à ligatures.',
  classResolver:
    'Crée un résolveur pour les classes CSS. Par défaut, les noms intégrés sans alias conservent leur solution de repli.',
  componentResolver: 'Crée un résolveur qui associe les noms d’icônes à des composants Vue.',
  toast:
    'Ajoute un toast et renvoie son ID. <code>dismissToast(id)</code> le retire ; sans ID, tous les toasts sont retirés. Ajoutez <code>VToaster</code> pour les afficher.',
  snackbar:
    'Affiche une snackbar et renvoie son ID, en remplaçant la précédente. <code>dismissSnackbar(id)</code> retire la snackbar correspondante ; sans ID, la snackbar actuelle est retirée. Ajoutez <code>VSnackbar</code> pour l’afficher.',

  moduleState:
    'La configuration des langues et des icônes est partagée par tout le processus. Définissez-la au démarrage de l’application ; pour du SSR multilingue simultané, transmettez explicitement les textes et la locale via les props. Appelez <code>toast</code> et <code>snackbar</code> dans des gestionnaires d’événements du navigateur ou des hooks <code>onMounted</code>.',
  types:
    'Les types sont exportés avec les fonctions, notamment <code>MessagesInput</code>, <code>IconResolver</code>, <code>ToastOptions</code> et <code>SnackbarOptions</code>. Les pages des composants documentent leurs propres types.',

  internalHeading: 'Fonctions internes',
  internalBody:
    'Les utilitaires de date, d’heure, de fichiers et de texte servent à l’implémentation des composants. Ils ne font pas partie des exports publics.',

  composablesHeading: 'Composables',
  composablesBody:
    'Les composables de la bibliothèque sont internes. Utilisez les props, événements et slots documentés sur la page de chaque composant.',
}
