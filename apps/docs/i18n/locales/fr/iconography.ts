export default {
  title: 'Iconographie',
  lead: "Aucune police d'icônes n'est requise, et aucune n'est embarquée. Les icônes que la bibliothèque dessine elle-même sont des tracés SVG intégrés — répliques exactes de Material Symbols Rounded (graisse 400, GRAD 0, taille optique 24, Apache-2.0 © Google).",
  weight:
    "La bibliothèque en dessine 34, chacune dans son propre module : vous payez les icônes que vos composants rendent réellement, et rien d'autre — un VButton seul n'en embarque aucune. Chacune porte un <code>[outline, filled?]</code> : le second tracé n'existe que là où l'axe FILL change réellement la géométrie, ce qui est le cas de 15 des 34.",
  gridCaption: 'Troisième et quatrième, sixième et septième : le même nom, contour puis plein.',

  importHeading: 'Importer une icône',
  importBody:
    "Les icônes que la bibliothèque dessine elle-même sont des valeurs, importées depuis <code>vectis-ui/icons</code> et passées là où irait un nom. Toutes les props d'icône du design system en acceptent une.",
  importWhy:
    "Une chaîne nue reste un NOM : elle part vers votre résolveur, puis vers la police d'icônes — elle n'atteint plus les tracés de la bibliothèque. C'est délibéré : une icône arrive dans votre bundle parce qu'un module l'a importée, jamais parce qu'une chaîne pourrait un jour la demander. C'est aussi pour cela que les composants que vous n'importez pas ne vous coûtent aucune des leurs.",

  orderHeading: "L'ordre de résolution",
  orderBody:
    "VIcon résout sa source dans cet ordre, et l'ordre EST le contrat : un <code>render</code> explicite → <code>src</code> → <code>name</code> (votre résolveur d'abord, puis le tracé que l'icône a apporté avec elle, puis la police à ligatures) → le slot.",
  noHeuristic:
    "Une chaîne est TOUJOURS un nom ; une image ou un composant se déclare explicitement sous forme d'objet (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>, <code>{ class }</code>). Il n'y a aucune heuristique, et c'est ce qui permet à un nom de style Iconify comme <code>mdi:close</code> d'atteindre votre résolveur intact au lieu d'être pris pour une adresse.",

  wiringHeading: 'Brancher votre propre bibliothèque',
  wiringBody:
    "Le résolveur est consulté AVANT le tracé de l'icône, sans quoi les icônes du design system resteraient Material pour un consommateur ayant branché sa propre bibliothèque — une icône importée porte son NOM autant que ses tracés, et c'est exactement ce qui la fait parvenir jusqu'à vous. Trois fabriques sont livrées, une par famille de source : <code>ligatureIconResolver</code> pour une police dont la ligature est le glyphe, <code>classIconResolver</code> pour une police pilotée par une classe et un pseudo-élément, et <code>componentIconResolver</code> pour un jeu livré sous forme de composants.",
  wiringWhere:
    "Posez-le au niveau du module — un plugin Nuxt, <code>main.ts</code> — jamais dans un <code>setup()</code>, et jamais côté client seul : un résolveur installé après l'hydratation fait dessiner au navigateur des icônes différentes de celles que le serveur a envoyées.",

  partialHeading: 'Correspondances partielles',
  partialBody:
    "Un résolveur qui répond <code>undefined</code> dit « je ne connais pas ce nom », et non « ne dessine rien » : VIcon retombe alors sur le tracé que porte l'icône, puis sur la ligature. C'est cette distinction qui rend utile de mapper six noms et de laisser le reste tranquille — ce que fait précisément ce site, dont le décor a besoin de six icônes que la bibliothèque n'a aucune raison de livrer.",
  partialQuote:
    "Une ligature non chargée affiche son propre NOM en texte brut, rogné à la boîte de l'icône. La mise en page survit dans les deux cas — mais voir un mot là où une icône devrait être est le symptôme d'un nom que rien n'a résolu.",

  sizingHeading: 'Taille et sémantique',
  sizingBody:
    "Les icônes font 1em par défaut et suivent le texte environnant. Un parent pose le contexte via <code>--vectis-icon-size</code> et <code>--vectis-icon-opsz</code> — c'est exactement ce que fait <code>v-control</code> pour chaque taille de contrôle — et une prop <code>size</code> numérique l'emporte dessus. À noter : l'axe de taille optique n'atteint qu'une LIGATURE ; les tracés du registre sont dessinés à une seule taille optique et ne peuvent pas le suivre.",
  semantics:
    "Les icônes sont décoratives par défaut et portent <code>aria-hidden</code>. Donner un <code>label</code> à l'une d'elles la rend informative — ce qui est juste quand l'icône est la seule chose à dire ce que fait un contrôle, et faux quand le texte à côté le dit déjà.",
  forcedColors:
    'Elles sont rendues en <code>&lt;svg&gt;&lt;path&gt;</code> et jamais en fond masqué, pour une seule raison : sous le mode couleurs forcées de Windows, un fond masqué disparaît entièrement, alors que <code>fill: currentcolor</code> survit.',
}
