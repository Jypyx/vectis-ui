export default {
  title: 'Iconographie',
  lead: "Aucune police d'icônes n'est requise, et aucune n'est embarquée. Les icônes que la bibliothèque dessine elle-même sont des tracés SVG intégrés, répliques exactes de Material Symbols Rounded (graisse 400, GRAD 0, taille optique 24, Apache-2.0 © Google).",
  weight:
    "La bibliothèque en dessine 34, chacune dans son propre module : vous payez les icônes que vos composants rendent réellement, et rien d'autre. Un VButton seul n'en embarque aucune. Chacune porte un <code>[outline, filled?]</code> : le second tracé n'existe que là où l'axe FILL change réellement la géométrie, ce qui est le cas de 15 des 34.",
  gridCaption: 'Troisième et quatrième, sixième et septième : le même nom, contour puis plein.',

  importHeading: 'Importer une icône',
  importBody:
    "Les icônes que la bibliothèque dessine elle-même sont des valeurs, importées depuis <code>vectis-ui/icons</code> et passées là où irait un nom. Toutes les props d'icône du design system en acceptent une : la même valeur convient à <code>VIcon</code>, à un bouton, à un champ ou à un élément de menu.",
  importWhy:
    "Une chaîne simple est un NOM : elle est proposée à votre résolveur, puis à une police d'icônes sous forme de ligature. Les deux formes ne sont pas interchangeables, et c'est cette différence qui rend le jeu élagable. Un tracé arrive dans votre bundle parce qu'un module l'a importé, jamais parce qu'une chaîne pourrait le demander une fois la page en marche.",

  ownHeading: "Utiliser votre propre bibliothèque d'icônes",
  ownBody:
    "Rien ne vous oblige à utiliser les icônes que dessine la bibliothèque. Installez un <strong>résolveur</strong>, une fonction qui transforme un nom en quelque chose à dessiner, et il est consulté avant ces tracés : toutes les icônes de tous les composants viennent alors de votre jeu, au lieu de laisser deux styles cohabiter. Trois fabriques sont livrées, une par famille à laquelle une bibliothèque d'icônes peut appartenir, et écrire son résolveur à la main reste toujours possible : ce n'est qu'une fonction.",
  ownWhere:
    "Installez-le au niveau du module, depuis un plugin Nuxt ou depuis <code>main.ts</code>, jamais dans un <code>setup()</code>, et jamais côté client seul : un résolveur installé après l'hydratation fait dessiner au navigateur des icônes différentes de celles que le serveur a envoyées.",
  ownPartial:
    "Quelle que soit la famille, un résolveur qui répond <code>undefined</code> dit « je ne connais pas ce nom » et non « ne dessine rien » : l'icône retombe alors sur le tracé qu'elle porte, puis sur la police à ligatures. C'est ce qui rend légale une <strong>correspondance partielle</strong>, et c'est la façon normale de s'en servir. Mappez les noms que votre jeu possède, laissez le reste tranquille.",
  ownQuote:
    "Un nom que rien ne résout, sans police d'icônes chargée, s'affiche sous la forme du nom lui-même en texte brut, rogné à la boîte de l'icône. La mise en page survit dans les deux cas, mais un mot là où une icône devrait être est le symptôme à reconnaître.",

  classHeading: 'Une police pilotée par classe',
  classBody:
    "Font Awesome, Phosphor, Bootstrap Icons et leurs semblables : une classe nomme l'icône, un pseudo-élément la dessine. <code>className</code> construit cette classe à partir du nom mappé et de l'état plein, et le design system la rend sur un <code>&lt;span&gt;</code> qui lui appartient, afin de pouvoir normaliser cet élément en une seule règle.",
  classPartial:
    "<code>strict</code>, actif par défaut, est la correspondance partielle rendue sûre : un nom que le design system livre mais que votre table ne traduit pas deviendrait sinon une classe que votre police ne définit pas, et l'icône se rendrait en carré vide. Refuser de répondre laisse au contraire le tracé intégré prendre le relais. Vos propres noms passent toujours, puisqu'ils sont déjà écrits dans votre vocabulaire.",

  ligatureHeading: 'Une police à ligatures',
  ligatureBody:
    "Material Symbols dans n'importe laquelle de ses variantes, ou une compilation IcoMoon faite ainsi : le nom EST le glyphe. Ce résolveur répond à tous les noms, puisque c'est la police elle-même qui décide de ce qu'elle reconnaît, ce qui en fait aussi le moyen de faire dessiner les icônes du design system par votre police plutôt que par les SVG livrés avec elle.",
  ligaturePartial:
    "Comme il répond à tout, les alias sont toute la correspondance : un nom présent dans la table est traduit, un nom absent est transmis tel quel à la police. Il n'y a pas de repli sur les tracés intégrés ici, puisque ce que la police ne reconnaît pas est un glyphe manquant. Employez-le quand votre police couvre le terrain.",

  componentHeading: 'Un jeu de composants',
  componentBody:
    "Lucide, Untitled UI et leurs semblables, livrés sous forme de composants Vue. Un contrat à respecter : chaque composant doit avoir un unique <code>&lt;svg&gt;</code> pour racine, car c'est l'élément que la feuille de styles dimensionne. La fonction facultative <code>props</code> est transmise à chaque composant : c'est là que vont une épaisseur de trait ou une variante.",
  componentPartial:
    "Il est strict par construction : un nom absent de la table n'a aucun composant à retourner, il retombe donc sur le tracé intégré, puis sur la ligature. Mapper les huit icônes que vous avez dessinées et laisser la bibliothèque répondre pour le reste est une configuration parfaitement ordinaire.",

  sizingHeading: 'Taille',
  sizingBody:
    "Une icône fait <code>1em</code> par défaut : elle suit donc le texte qui l'entoure sans rien à régler. Deux choses passent outre. La prop <code>size</code>, en pixels, s'applique à une icône et l'emporte sur tout le reste ; <code>--vectis-icon-size</code>, posée sur n'importe quel ancêtre, s'applique à toutes les icônes en dessous qui ne nomment pas la leur. C'est cette seconde forme qui donne aux icônes de chaque taille de contrôle la leur, via <code>v-control</code>.",
  sizingCaption: 'La même icône à 16, 24 et 40 pixels.',

  orderHeading: 'Ordre de résolution',
  orderBody:
    "VIcon résout sa source dans cet ordre, et l'ordre EST le contrat : un <code>render</code> explicite › <code>src</code> › <code>name</code> (votre résolveur d'abord, puis le tracé que l'icône a apporté avec elle, puis la police à ligatures) › le slot.",
  noHeuristic:
    "Une chaîne est TOUJOURS un nom ; une image ou un composant se déclare explicitement sous forme d'objet (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>, <code>{ class }</code>). Il n'y a aucune heuristique, et c'est ce qui permet à un nom de style Iconify comme <code>mdi:close</code> d'atteindre votre résolveur intact au lieu d'être pris pour une adresse.",

  listHeading: 'Icônes existantes',
  listBody:
    "Les 34 icônes que dessine la bibliothèque, chacune avec le nom auquel elle répond, qui est le vocabulaire dans lequel s'écrit une table d'alias. Importez celle dont vous avez besoin depuis <code>vectis-ui/icons</code> pour la rendre vous-même, ou mappez son nom dans votre résolveur pour la faire dessiner par votre propre jeu.",
  listFilled:
    "Là où deux glyphes apparaissent, remplir change réellement le dessin et l'icône honore <code>filled</code>. Là où il n'y en a qu'un, le contour est toute l'icône et la prop n'a rien à y changer.",
}
