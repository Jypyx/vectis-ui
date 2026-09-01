export default {
  title: 'Iconographie',
  lead: "Vectis UI n'utilise ni n'embarque aucune police d'icônes (icon font). Les composants s'appuient exclusivement sur des tracés SVG en ligne (inline SVG), issus directement de la collection Material Symbols Rounded (poids 400, GRAD 0, taille optique 24px, sous licence Apache 2.0 © Google).",
  weight:
    "Vectis UI intègre 34 icônes distribuées dans des modules distincts pour garantir un tree-shaking parfait : seules les icônes réellement importées ou rendues dans votre application sont incluses dans le bundle final. Un composant comme <code>VButton</code> n'embarque ainsi aucune icône par défaut.<br>Chaque icône prend en charge la variante <code>outline</code> et, optionnellement, la version <code>filled</code>. Pour optimiser l'empreinte du code, le tracé <code>filled</code> n'est déclaré que si la propriété <code>FILL</code> modifie la géométrie de l'icône (ce qui concerne 15 des 34 icônes).",
  gridCaption: "Les positions 3 et 4, ainsi que 6 et 7, illustrent un même symbole décliné successivement dans ses variantes 'outline' et 'filled'",

  importHeading: 'Importer une icône',
  importBody:
    "Les icônes fournies par la bibliothèque sont exportées sous forme de valeurs JavaScript depuis <code>vectis-ui/icons</code>. Elles se passent directement aux props dédiées aux icônes : une même référence d'icône s'utilise ainsi indifféremment sur le composant <code>VIcon</code>, un bouton, un champ de saisie ou un élément de menu.",
  importWhy:
    "Passer une simple chaîne de caractères à une prop équivaut à fournir un nom d'icône : la valeur est alors transmise à votre résolveur d'icônes ou injectée sous forme de ligature pour une police d'icônes.<br>Les deux mécanismes (chaîne de caractères ou objet importé) ne répondent pas aux mêmes contraintes, et c'est cette distinction qui garantit le tree-shaking. Un tracé SVG n'est inclus dans le bundle final que parce qu'un module l'a importé de façon explicite, et non sur la base d'une chaîne évaluée dynamiquement à l'exécution..",

  ownHeading: "Utiliser votre propre bibliothèque d'icônes",
  ownBody:
    "L'utilisation des icônes natives de Vectis UI est entièrement optionnelle. En configurant un résolveur d'icônes (une fonction chargée d'associer un nom à un composant ou un tracé SVG), celui-ci devient prioritaire sur les icônes par défaut. L'ensemble de vos composants adopte ainsi votre propre jeu d'icônes, garantissant une parfaite cohérence visuelle.<br>La bibliothèque inclut trois helpers (factories) adaptés aux différents formats du marché. Vous pouvez également définir votre propre résolveur sur mesure via une simple fonction de callback.",
  ownWhere:
    "Configurez le résolveur à l'échelle globale de l'application (dans <code>main.ts</code> ou via un plugin Nuxt), et jamais au sein du <code>setup()</code> d'un composant ni de manière exclusive au client (client-only). Enregistrer le résolveur après la phase d'hydratation ou uniquement côté navigateur provoque un décalage (hydration mismatch), les icônes générées par le client ne correspondant plus au HTML initial envoyé par le serveur.",
  ownPartial:
    "Quelle que soit la famille du résolveur, retourner <code>undefined</code> indique l'absence de correspondance pour un nom donné, et non une instruction d'omettre le rendu. Le composant déclenche alors son mécanisme de secours (fallback) : il utilise le tracé SVG natif du composant, puis retombe en dernier recours sur la ligature de la police d'icônes. Ce fonctionnement rend la cartographie partielle (partial mapping) parfaitement valide et recommandée : vous pouvez intercepter uniquement les noms d'icônes gérés par votre jeu personnalisé et déléguer le reste aux valeurs par défaut.",
  ownQuote:
    "Lorsqu'un nom d'icône ne peut être résolu et qu'aucune police d'icônes n'est disponible, le composant affiche la chaîne de caractères brute, tronquée aux dimensions du conteneur de l'icône. Bien que la mise en page globale soit préservée, la présence d'un texte littéral à l'emplacement d'un symbole visuel constitue l'indicateur d'un échec de résolution.",

  classHeading: 'Une police pilotée par classe',
  classBody:
    "Pour les bibliothèques d'icônes basées sur des classes CSS (telles que Font Awesome, Phosphor ou Bootstrap Icons), l'affichage repose sur l'injection d'un glyphe via un pseudo-élément. La fonction <code>className</code> génère la classe CSS requise à partir de l'identifiant mappé et de la variante (<code>filled</code> ou <code>outline</code>). Le design system applique cette classe sur un élément <code>&lt;span&gt;</code> interne, ce qui permet de normaliser le dimensionnement et l'alignement de toutes les icônes au moyen d'une règle CSS unique.",
  classPartial:
    "L'option <code>strict</code>, activée par défaut, sécurise l'usage des correspondances partielles (partial mapping). Sans elle, un identifiant natif fourni par un composant mais absent de votre dictionnaire générerait une classe CSS inexistante pour la police d'icônes, entraînant un défaut d'affichage (rectangle vide). En s'abstenant de résoudre les identifiants non répertoriés, le mode strict autorise le tracé SVG natif à prendre le relais. Vos identifiants personnalisés restent traités normalement dès lors qu'ils figurent dans votre table de résolution.",

  ligatureHeading: 'Une police à ligatures',
  ligatureBody:
    "Pour les polices basées sur les ligatures (telles que Material Symbols ou une police IcoMoon configurée à cet effet), l'identifiant textuel de l'icône correspond directement au glyphe restitué. Ce résolveur accepte l'ensemble des noms transmis : la correspondance s'effectue directement au niveau de la table de ligatures de la police d'icônes. Ce mécanisme permet de substituer votre propre police aux tracés SVG natifs de Vectis UI sur l'intégralité du design system.",
  ligaturePartial:
    "Ce résolveur interceptant l'ensemble des requêtes, la table d'alias constitue la seule couche de correspondance : un nom présent dans la table est substitué, tandis qu'un nom absent est transmis inchangé à la police d'icônes. Ce mécanisme contourne la rétrogradation (fallback) vers les SVG natifs : tout nom non géré par la police se traduira par un glyphe manquant. Réservez ce résolveur aux projets dont la police d'icônes couvre la totalité des besoins applicatifs.",

  componentHeading: 'Un jeu de composants',
  componentBody:
    "Pour les bibliothèques distribuant leurs icônes sous forme de composants Vue (telles que Lucide ou Untitled UI), le rendu s'appuie directement sur les composants importés. Une contrainte d'architecture doit être respectée : chaque composant d'icône doit posséder un nœud <code>&lt;svg&gt;</code> unique à sa racine, indispensable à l'application du dimensionnement et du ciblage CSS par le design system. La fonction optionnelle <code>props</code> permet d'injecter des propriétés spécifiques lors du rendu (comme l'épaisseur de trait <code>stroke-width</code> ou une variante).",
  componentPartial:
    "Ce résolveur est strict par conception : lorsqu'un identifiant est absent de la table de correspondance, aucun composant ne peut être retourné. La résolution bascule alors sur la chaîne de fallback standard (tracé SVG natif, puis ligature). Mapper uniquement un jeu restreint d'icônes personnalisées et déléguer le reste aux valeurs par défaut du design system constitue un cas d'usage courant et parfaitement supporté.",

  handHeading: 'Écrit à la main',
  handBody:
    "Les trois fabriques intégrées ne couvrent pas nécessairement tous les cas d'usage. Un résolveur n'étant qu'une fonction associant un nom d'icône à un élément à rendre (composant, tracé SVG ou classe), écrire son propre résolveur constitue un modèle d'extension de premier ordre, et non une solution de dernier recours.<br>À titre d'exemple, voici le résolveur configuré pour ce site de documentation via un plugin Nuxt universel. Il traite les icônes propres à l'interface du site et retourne undefined pour tous les autres identifiants, déclenchant le fallback vers les tracés SVG natifs de Vectis UI.",

  sizingHeading: 'Taille',
  sizingBody:
    "Par défaut, une icône adopte une dimension de <code>1em</code>, héritant automatiquement de la taille du texte environnant (font-size). Deux mécanismes permettent de surcharger ce comportement : ",
  sizingOverrides: ["Surcharge locale : La prop <code>size</code> (en pixels), appliquée directement sur l'icône, prévaut sur toute autre règle stylistique.", "Surcharge contextuelle : La variable CSS <code>--vectis-icon-size</code>, définie sur un élément ancêtre, se propage à toutes les icônes descendantes ne spécifiant pas leur propre prop <code>size</code>."],
  sizingReason: "C'est cette seconde approche par cascade CSS qui permet aux composants de contrôle (via <code>v-control</code>) d'ajuster automatiquement la taille des icônes enfants selon la variante de taille du composant parent.",
  sizingCaption: 'La même icône à 16, 24 et 40 pixels.',

  orderHeading: 'Ordre de résolution',
  orderBody:
    "Le composant <code>VIcon</code> évalue sa source d'affichage selon un ordre de priorité immuable. Cet ordre de précédence constitue le contrat d'interface du composant :",
  orderRules: ["Prop  <code>render</code> (fonction de rendu explicite)", "Prop  <code>src</code> (valeur ou objet d'icône importé)", "Prop  <code>name</code> (identifiant résolu séquentiellement : résolveur personnalisé -> tracé SVG natif embarqué -> ligature de la police d'icônes)", "Slot par défaut (contenu SVG ou HTML injecté)"],
  noHeuristic:
    "Une chaîne de caractères est systématiquement traitée comme un nom d'icône. Pour déclarer une image, un composant ou un style spécifique, la valeur doit être passée explicitement sous forme d'objet (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code> ou <code>{ class }</code>). L'absence totale d'heuristique garantit qu'un identifiant à espace de noms tel que mdi:close (format Iconify) parvienne intact à votre résolveur sans risque d'être interprété à tort comme une URL ou un chemin réseau.",

  listHeading: 'Icônes existantes',
  listBody:
    "Vectis UI intègre un jeu de 34 icônes natives. Leurs identifiants constituent le vocabulaire de référence pour établir vos tables d'alias. Vous pouvez importer directement les icônes nécessaires depuis le sous-module <code>vectis-ui/icons</code> pour un rendu explicite, ou mapper leurs identifiants au sein de votre résolveur afin de substituer l'iconographie par défaut par votre propre système visuel.",
  listFilled:
    "Lorsque deux variantes de glyphes coexistent, la propriété <code>filled</code> bascule l'affichage du style filaire au style plein. Pour les icônes constituées d'un tracé unique, le contour représente l'intégralité du motif : la propriété <code>filled</code> n'a alors aucun effet sur le rendu visuel.",
}
