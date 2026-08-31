export default {
  title: 'Localisation (i18n)',
  lead: "Aucun texte destiné à l'utilisateur n'est écrit en dur dans les composants : tout vient d'un dictionnaire. Le design system est anglais par défaut et livre le français ; toute autre langue s'ajoute côté consommateur.",
  split:
    "Deux choses se règlent séparément. Les MOTS viennent du dictionnaire, les FORMATS dérivent d'<code>Intl</code> à partir du tag de langue. Une locale sans dictionnaire correspondant donne donc déjà les bonnes dates, les bons nombres, le bon premier jour de la semaine et le bon cycle horaire, avec les libellés restés en anglais. C'est un état dégradé cohérent, et non un bug.",

  demoHeading: 'La séparation, en pratique',
  demoBody:
    "Le calendrier ci-dessous reçoit une prop <code>locale</code>, qui l'emporte sur la locale globale. Choisissez l'allemand ou le japonais, des langues pour lesquelles la bibliothèque ne livre aucun dictionnaire, et le nom du mois, les initiales des jours et le premier jour de la semaine bougent tous, tandis que les libellés que le dictionnaire possède restent en anglais. C'est cela, l'état dégradé, et il est utilisable.",
  demoLabel: 'Locale du calendrier',
  demoQuote:
    "La prop ne concerne que ce calendrier ; rien d'autre sur la page ne change. C'est toute la différence entre la prop <code>locale</code> d'un composant et le <code>setLocale</code> global, qui déplace un état de module pour le processus entier.",

  frenchHeading: 'Passer au français',
  frenchBody:
    "<code>fr</code> est optionnel : ne pas l'importer suffit à l'élaguer du bundle. L'argument n'est pas son poids, qui reste sous le kilo-octet gzippé. C'est qu'activer le français livré et ajouter une langue que la bibliothèque ne livre pas sont le MÊME geste, plutôt que deux catégories de dictionnaire.",

  addHeading: 'Ajouter une langue',
  addBody:
    "Un dictionnaire partiel est légitime : ce qui manque retombe sur l'anglais plutôt que sur une clé. La fusion est non récursive par construction, puisque le dictionnaire fait exactement deux niveaux, <code>namespace.key</code>. C'est ce qui la rend structurellement incapable de descendre dans un message paramétré, qui est une fonction.",
  addTyping:
    "Les messages paramétrés sont des fonctions TypeScript typées, sans ICU ni moteur de pluriel : un pluriel est un ternaire à l'intérieur de la fonction. Les deux dictionnaires livrés sont annotés <code>VectisMessages</code>, si bien que la parité des clés et des signatures est garantie à la compilation plutôt que testée.",

  precedenceHeading: 'Précédence',
  precedenceBody:
    "Une prop <code>text</code> ou <code>label</code> posée sur un composant reste souveraine. Pour le nom accessible d'un conteneur, la chaîne est <code>aria-labelledby</code> › <code>aria-label</code> › la prop <code>label</code> › le dictionnaire › l'anglais. Il n'y a jamais de chaîne vide, jamais de clé technique à l'écran, et jamais de silence en développement quand une langue manque.",
  precedenceSubtag:
    "La résolution se fait par SOUS-TAG DE LANGUE : <code>en-GB</code> et <code>en-US</code> partagent leurs mots, et ce qui les sépare vient d'<code>Intl</code>.",

  processHeading: 'Une locale par processus',
  processBody:
    "Le dictionnaire est un état de module, et c'est ce qui permet d'appeler <code>setLocale</code> depuis n'importe quel fichier <code>.ts</code> tout en atteignant des composants déjà montés. La limite acceptée en est l'autre face : le SSR multilingue PAR REQUÊTE n'est pas couvert, donc un seul processus Node servant deux langues à la fois doit passer les props de texte explicitement.",
  processPrerender:
    "Le prérendu est le cas où cette limite ne coûte rien, et ce site en est la démonstration. <code>nuxt generate</code> rend ses routes l'une après l'autre dans un seul processus : un plugin peut donc poser la locale de la page qu'il s'apprête à rendre, et jamais deux ne se chevauchent. Chaque page française d'ici est construite avec des mots français dedans, et servie en HTML statique. Ce qu'un serveur rendant deux langues SIMULTANÉMENT ne peut pas faire, un build qui les enchaîne le peut.",
  processQuote:
    "Recourez aux props de texte quand un seul processus en cours d'exécution doit répondre en deux langues au même instant. Partout ailleurs, qu'il s'agisse d'une application dans une langue ou d'un site prérendu en plusieurs, <code>setLocale</code> suffit.",
}
