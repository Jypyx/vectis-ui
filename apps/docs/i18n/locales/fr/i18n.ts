export default {
  title: 'Localisation (i18n)',
  lead: "Aucun texte destiné à l'utilisateur n'est écrit en dur dans les composants : tout vient d'un dictionnaire. Le design system est anglais par défaut et livre le français ; toute autre langue s'ajoute côté consommateur.",
  split:
    "Deux choses se règlent séparément. Les MOTS viennent du dictionnaire, les FORMATS dérivent d'<code>Intl</code> à partir du tag de langue. Une locale sans dictionnaire correspondant donne donc déjà les bonnes dates, les bons nombres, le bon premier jour de la semaine et le bon cycle horaire, avec les libellés restés en anglais. C'est un état dégradé cohérent, et non un bug.",

  frenchHeading: 'Changer de langue',
  frenchBody:
    "Deux appels, et seul le premier est propre au français : enregistrer un dictionnaire, puis nommer la locale. <code>fr</code> est optionnel, et ne pas l'importer suffit à l'élaguer du bundle. L'argument n'est pas son poids, qui reste sous le kilo-octet gzippé. C'est qu'activer le français livré et ajouter une langue que la bibliothèque ne livre pas sont le MÊME geste, plutôt que deux catégories de dictionnaire.",
  frenchWhere:
    "Les deux vont au niveau du module, dans <code>main.ts</code> ou dans un plugin Nuxt, jamais dans un <code>setup()</code>. <code>setLocale</code> peut être rappelé à tout moment, depuis n'importe où : le dictionnaire est une référence réactive, si bien que les composants déjà à l'écran se rendent à nouveau avec les nouveaux mots au lieu d'attendre une navigation.",
  processBody:
    "L'état est au niveau du module, ce qui rend cela possible, et la limite acceptée en est l'autre face : il y a UNE locale par processus. Le SSR multilingue par requête n'est pas couvert, donc un seul processus Node qui répond en deux langues au même instant doit passer les props de texte explicitement. Le prérendu est le cas où cette limite ne coûte rien, puisque les routes sont rendues l'une après l'autre : ce site pose la locale de la page qu'il s'apprête à rendre, et chaque page française d'ici est construite avec des mots français dedans.",

  addHeading: 'Ajouter une langue',
  addBody:
    "Un dictionnaire à vous est un objet ordinaire, et un dictionnaire partiel est légitime : ce qui manque retombe sur l'anglais plutôt que sur une clé brute. Enregistrez-le sous son sous-tag de langue, puis nommez une locale qui le porte.",
  addTyping:
    "Typez-le en <code>VectisMessagesInput</code> et votre éditeur listera les espaces de noms, les clés et les paramètres des messages qui en prennent. Ces messages sont des fonctions TypeScript typées, sans ICU ni moteur de pluriel : un pluriel est un ternaire écrit à l'intérieur de la fonction. La fusion est non récursive par construction, puisque le dictionnaire fait exactement deux niveaux, ce qui la rend structurellement incapable de descendre dans une valeur de type fonction.",
  precedenceBody:
    "La résolution se fait par SOUS-TAG DE LANGUE : <code>en-GB</code> et <code>en-US</code> partagent donc leurs mots et ne diffèrent que par leurs formats. Au-dessus du dictionnaire viennent les props : un <code>text</code> ou un <code>label</code> posé sur un composant reste souverain, et pour le nom accessible d'un conteneur la chaîne est <code>aria-labelledby</code> › <code>aria-label</code> › la prop <code>label</code> › le dictionnaire › l'anglais. Il n'y a jamais de chaîne vide, jamais de clé technique à l'écran, et jamais de silence en développement quand une langue manque.",

  demoHeading: 'Les mots et les formats',
  demoBody:
    "Le dictionnaire et la locale de formatage sont deux réglages, et rien n'oblige les deux à s'accorder. <code>setLocale</code> et <code>registerMessages</code> décident des mots qu'un composant dit ; le tag, et la prop <code>locale</code> partout où un composant en prend une, décide de ce qu'<code>Intl</code> en dérive : l'ordre des parties d'une date, le séparateur entre elles, le jour où commence la semaine, douze heures ou vingt-quatre. Une application peut afficher ses mots en français et ses formats en <code>en-CA</code>, ou garder des libellés anglais tout en formatant pour l'Allemagne, sans qu'aucun des deux choix ne contraigne l'autre.",
  demoLanguage: 'Langue',
  demoFormats: 'Formats',

  keysHeading: 'Les clés du dictionnaire',
  keysBody:
    "Les 134 clés que lit la bibliothèque, réparties en 22 espaces de noms, avec la valeur anglaise de chacune : voici la liste contre laquelle écrire un dictionnaire. Seuls les espaces de noms que vous traduisez doivent être présents, et seules les clés que vous avez à l'intérieur.",
  keysFunctions:
    "Vingt-trois d'entre elles sont paramétrées, et ce sont des fonctions. Elles n'affichent aucune valeur par défaut ici parce qu'il n'y a rien d'utile à montrer : leurs paramètres sont typés par <code>VectisMessages</code>, que votre éditeur détaille au moment d'écrire la surcharge.",
  keysColumnKey: 'Clé',
  keysColumnDefault: 'Valeur anglaise',
}
