export default {
  title: 'Bouton',
  lead: "Le bouton qui déclenche une action, et la référence dont sont tirées les tables de tons et de variantes de tous les autres composants colorés. Il rend un <code>&lt;button&gt;</code> natif, ou un <code>&lt;a&gt;</code> dès qu'on lui donne un <code>href</code>.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: "Quatre variantes par rangée, trois tons en colonne : <code>accent</code>, puis <code>neutral</code>, puis <code>danger</code>. Les tons s'arrêtent là parce que sur un bouton un ton est une intention, là où succès et avertissement sont des états : ceux-là appartiennent aux composants qui rapportent un état, une puce ou un toast. Tous les autres composants colorés de la bibliothèque tiennent leur table de celle-ci.",
    },
    elevated: {
      title: 'Surélevé',
      text: "<code>elevated</code> est un booléen plutôt qu'une cinquième variante : il applique l'échelle d'ombres à la variante en cours, comme le montre la seconde rangée ci-dessous. Un bouton ghost ou outline gagne en plus un fond surélevé, ce qui n'est pas décoratif mais nécessaire : dans le thème sombre, une ombre posée à même la page n'a rien qui la projette.",
    },
    sizes: {
      title: 'Tailles',
      text: "Cinq hauteurs, issues de l'échelle partagée par tous les contrôles de la bibliothèque : 24, 32, 40, 48 et 56 pixels. La typographie, le rembourrage et les icônes suivent tous le palier, si bien qu'une taille est une prop et non un jeu de mesures à garder d'accord.",
    },
    compact: {
      title: 'Compact',
      text: "Chaque paire ci-dessous est un palier de l'échelle, le second des deux étant <code>compact</code> : 4px partent de la hauteur et rien d'autre ne bouge. C'est pour une barre d'outils dense, où un bouton doit s'aligner sur une rangée plutôt que tenir seul.",
    },
    icons: {
      title: 'Avec des icônes',
      text: "<code>iconStart</code> et <code>iconEnd</code> posent une icône de part et d'autre du libellé, et les deux peuvent être données ensemble. <code>iconFilled</code> les fait passer à leur forme pleine, l'axe FILL de l'icône : les deux derniers boutons sont la même cloche, creuse puis pleine, ce qui montre un état sans changer de glyphe. Les slots <code>#start</code> et <code>#end</code> prennent le relais quand le contenu est plus qu'une icône, et <code>iconFilled</code> n'a alors plus de prise.",
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: "Les deux props d'icône acceptent un <code>IconSource</code>, ce que toute prop d'icône de la bibliothèque accepte : une des icônes de la bibliothèque, un simple nom remis au resolver installé par l'application, des données de tracé SVG, un composant dont la racine est un unique <code>&lt;svg&gt;</code>, ou une image. Une chaîne est toujours un NOM et jamais une adresse, ce qui permet à <code>mdi:close</code> d'arriver intact au resolver. La page Iconographie couvre les deux formes restantes, une police à ligatures et une police pilotée par classe, qui demandent chacune une police chargée avant d'afficher quoi que ce soit.",
    },
    link: {
      title: 'Lien',
      text: "Avec un <code>href</code>, le bouton rend un <code>&lt;a&gt;</code> : le clic du milieu, l'ouverture dans un nouvel onglet et la barre d'état du navigateur reviennent tous, ce qu'aucun gestionnaire de clic sur un <code>&lt;button&gt;</code> ne sait imiter. Un lien désactivé ou en chargement est rendu inerte et pas seulement grisé, HTML n'ayant pas de <code>disabled</code> pour un lien : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
    },
    states: {
      title: 'États',
      text: "Un bouton désactivé se grise par les tokens de couleur et non par une opacité, ce qui garde son libellé lisible sur toutes les surfaces. <code>loading</code> est la seule exception à cette règle, et il fait trois choses à la fois : il désactive le bouton, l'annonce comme occupé, et met un spinner à la place de l'icône de début, si bien que les deux ne sont jamais côte à côte.",
    },
  },

  api: {
    VButton: {
      props: {
        variant:
          "Le poids visuel que porte l'action : <code>solid</code> est rempli du ton, <code>soft</code> utilise un fond teinté, <code>outline</code> ne garde qu'une bordure, et <code>ghost</code> ne montre rien jusqu'au survol. Dans un VButtonGroup, c'est le groupe qui en décide, comme de la taille, de la densité et de l'élévation.",
        tone: "Ce que l'action signifie : <code>accent</code> pour l'action ordinaire, <code>neutral</code> pour une action secondaire, <code>danger</code> pour celle qui détruit quelque chose. Sur un bouton, un ton est une intention, et c'est pourquoi des états comme succès ou avertissement ne sont pas proposés ici. Omis dans un VButtonGroup, il prend celui du groupe, ce qui est tout l'intérêt de ne pas lui donner de valeur par défaut ; seul, le bouton est en <code>accent</code>.",
        elevated:
          "Soulève le bouton de la page avec l'échelle d'ombres, quelle que soit la variante. Un bouton ghost ou outline reçoit en plus une surface surélevée, parce qu'en thème sombre une ombre posée sur le fond de page n'a rien qui la projette.",
        size: "La hauteur du bouton, tirée de l'échelle de tailles partagée par tous les contrôles : 24, 32, 40, 48 et 56 pixels.",
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        href: "Transforme le bouton en <code>&lt;a&gt;</code> pointant vers cette adresse. Un lien désactivé ou en chargement devient inerte : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
        type: 'Le type natif du bouton. Il est ignoré dès que <code>href</code> en fait un lien.',
        disabled:
          "Rend le bouton inutilisable : il cesse de répondre, quitte l'ordre de tabulation et se grise par les tokens de couleur plutôt que par l'opacité.",
        loading:
          "Affiche un indicateur, désactive le bouton et l'annonce comme occupé. L'indicateur prend la place de l'icône de début, si bien que les deux ne sont jamais côte à côte.",
        iconStart: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        iconEnd: 'Une icône après le libellé. Le slot <code>#end</code> la remplace.',
        iconFilled:
          "Rend les deux icônes dans leur forme pleine, l'axe <code>FILL</code> de la police. Sans effet sur les slots <code>#start</code> et <code>#end</code>, dont vous construisez vous-même les icônes.",
      },
      slots: {
        default: 'Le libellé du bouton.',
        start:
          'Du contenu placé avant le libellé, en général une icône. Marquez-la <code>aria-hidden</code> quand elle ne fait que répéter ce que le libellé dit déjà.',
        end: 'Du contenu placé après le libellé.',
      },
    },
  },
}
