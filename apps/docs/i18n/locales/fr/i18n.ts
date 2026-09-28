export default {
  title: 'Localisation (i18n)',
  lead: 'Vectis UI utilise les messages anglais et la locale <code>en-US</code> par défaut. Enregistrez le dictionnaire français fourni ou ajoutez vos propres traductions.',
  split:
    'Les dictionnaires fournissent les textes de l’interface. La locale détermine aussi les formats régionaux via <code>Intl</code>. Si aucun dictionnaire n’est enregistré pour une langue, les messages restent en anglais et les formats suivent la locale choisie.',

  frenchHeading: 'Changer de langue',
  frenchBody:
    'Importez et enregistrez le dictionnaire français, puis sélectionnez une locale avec <code>setLocale</code> :',
  frenchWhere:
    'Enregistrez les dictionnaires au démarrage de l’application, dans <code>main.ts</code> ou un plugin Nuxt universel. Appelez <code>setLocale</code> pour mettre à jour les messages des composants et les formats par défaut sans recharger la page.',
  processBody:
    'La locale est partagée par tout le processus. Pour des requêtes SSR simultanées dans plusieurs langues, transmettez explicitement les textes et la locale via les props des composants. Pour la génération statique, rendez les routes séquentiellement et définissez la locale avant le rendu de chaque route.',

  addHeading: 'Ajouter une langue',
  addBody:
    'Enregistrez un dictionnaire sous son code de langue, par exemple <code>de</code>. Un dictionnaire partiel conserve les valeurs déjà enregistrées pour les clés omises, puis utilise l’anglais en dernier recours.',
  addTyping:
    'Utilisez <code>MessagesInput</code> pour vérifier les espaces de noms, les clés et les paramètres des messages. Les dictionnaires ont deux niveaux : espace de noms et clé.',
  precedenceBody:
    '<code>en-GB</code> et <code>en-US</code> partagent le dictionnaire <code>en</code>, mais utilisent des formats régionaux différents. Les props de texte, comme <code>loadingText</code>, remplacent les messages correspondants du dictionnaire.',

  demoHeading: 'Langue et formats',
  demoBody:
    'Utilisez <code>setLocale</code> pour définir la langue globale et les formats par défaut. Sur les composants qui l’acceptent, la prop <code>locale</code> remplace les formats sans changer les messages du dictionnaire. Dans cet exemple, choisissez séparément la langue et les formats de date et d’heure.',
  demoLanguage: 'Langue',
  demoFormats: 'Formats',

  keysHeading: 'Clés de traduction',
  keysBody:
    'Le tableau présente les messages français par espace de noms. Enregistrez uniquement les clés à traduire ou à remplacer.',
  keysFunctions:
    'Les messages paramétrés sont des fonctions TypeScript, présentées avec leurs arguments ci-dessous. Gérez les règles de pluriel dans ces fonctions.',
  keysColumnKey: 'Clé',
  keysColumnDefault: 'Valeur française',
}
