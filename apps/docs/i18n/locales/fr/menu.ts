export default {
  title: 'Menu',
  lead: "Une liste de commandes ouverte par un bouton. Il porte tout le patron ARIA menu : focus glissant, sous-menus imbriqués, et l'empilement des panneaux par le navigateur pour qu'une seule fermeture referme la branche.",

  examples: {
    menuItems: {
      title: 'Les commandes',
      text: "Une ligne porte un libellé, une icône à chaque bout, et ce qu'elle signifie. Ce dernier point est une <code>tone</code> plutôt qu'un booléen à elle : le même mot sur la même prop qu'un bouton, <code>danger</code> pour ce qui détruit quelque chose, <code>neutral</code> pour tout le reste. Il n'y a pas d'accent ici, un menu n'ayant pas de commande principale parmi ses lignes. Une ligne désactivée cesse de répondre et les flèches l'enjambent, et <code>href</code> transforme une ligne en vrai lien, ce dont devrait être fait un menu qui navigue au lieu d'agir : on peut alors le cliquer au milieu et copier son adresse. VMenuSeparator trace un filet entre deux suites de commandes.",
    },
    sublabels: {
      title: 'Seconde ligne',
      text: "Une seconde ligne sous le libellé, pour ce que la commande fait et que son nom ne dit pas déjà, ou pour le raccourci qui la déclenche. La ligne grandit pour les contenir toutes les deux et l'icône reste centrée sur la paire plutôt que sur la première ligne.",
    },
    selection: {
      title: 'Sélection',
      text: "<code>selected</code> marque la ligne actuellement en vigueur, l'ordre de tri utilisé ou la vue affichée. Elle est colorée et annoncée comme le choix courant : une coche à côté est donc une décoration et non l'information elle-même, un lecteur d'écran étant prévenu dans les deux cas. Un menu reste une liste de commandes et non un jeu de cases à cocher, donc en choisir une referme le panneau.",
    },
    groups: {
      title: 'Groupes',
      text: "Un bloc nommé de commandes. Le libellé est un titre et non une commande : rien ne se passe quand on le clique et les flèches ne s'y arrêtent jamais. Il prend la même hauteur qu'une ligne, ce qui garde le rythme vertical de la liste même lorsqu'un titre l'interrompt. Séparateurs et groupes se mélangent librement, un séparateur étant un filet là où un groupe est un nom.",
    },
    submenus: {
      title: 'Sous-menus',
      text: "Une ligne pourvue d'un slot <code>#submenu</code> ouvre un panneau à elle, et ces panneaux s'imbriquent aussi profond qu'il le faut. La survoler l'ouvre après un court délai, assez long pour que passer dessus en allant ailleurs n'ouvre rien. Au clavier, la flèche droite entre dans le sous-menu et la flèche gauche ou Escape remonte d'un cran. Le navigateur empile les panneaux : un clic à l'extérieur referme donc toute la branche d'un coup, et passer à une ligne voisine referme celui qui était ouvert.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs de ligne, 32, 40 et 48 pixels, chacune avec sa version <code>compact</code> plus courte de 4px. Cela se pose une seule fois sur le menu entier : le panneau porte la taille et chaque ligne l'y lit, sous-menus compris, si bien qu'un panneau imbriqué ne peut pas se désaccorder de son parent.",
    },
    width: {
      title: 'Largeur',
      text: "Laissé à lui-même, le panneau se tient entre un plancher et un plafond qui lui sont propres, ce qui évite qu'un menu de commandes courtes soit un ruban et qu'un long libellé l'étire à travers la page. <code>width</code> remplace les deux par n'importe quelle longueur ou mot-clé CSS, <code>max-content</code> le resserrant sur sa plus longue ligne. <code>matchTrigger</code> remplace plutôt le plancher : le panneau ne peut plus être plus étroit que le bouton qui l'a ouvert, tout en restant libre de grandir pour une ligne plus longue. Les deux s'appliquent au menu lui-même, les sous-menus gardant la valeur par défaut.",
    },
    placement: {
      title: 'Position',
      text: "Où le panneau s'ouvre par rapport à son déclencheur. Seul l'axe de bloc est proposé, au-dessus ou en dessous, une liste de commandes s'ouvrant à côté de son bouton laissant le lecteur chercher au mauvais endroit. C'est une préférence et non une position : un navigateur à court de place en dessous bascule le panneau au-dessus de lui-même, la valeur ne décidant que du côté essayé en premier.",
    },
    open: {
      title: 'Savoir si le menu est ouvert',
      text: "Le modèle est alimenté par le panneau au lieu d'être seulement lu par lui : un clic à l'extérieur, Escape ou le choix d'une commande y réécrivent, si bien que rien n'est à remettre à zéro à la main. Le lire est l'usage courant, pour un déclencheur qui change pendant que son menu est sorti ou pour une page qui doit le savoir. Y écrire est plus rare et mérite d'être dit franchement : fermer depuis le code couvre le cas ordinaire d'une action qui s'achève ailleurs, tandis qu'ouvrir depuis le code ne convient vraiment qu'à un raccourci clavier ou à une visite guidée, un menu appartenant sinon au bouton qui l'ouvre. Un menu ouvert depuis le code s'ancre tout de même sur ce bouton.",
    },
  },

  api: {
    VMenu: {
      props: {
        placement:
          "Où le panneau s'ouvre par rapport à sa gâchette. Le navigateur le déplace de lui-même d'un autre côté quand la place manque.",
        size: 'La hauteur des lignes : 32, 40 ou 48 pixels. Les sous-menus en héritent, elle se pose donc une fois sur le menu dans son ensemble.',
        compact: 'Retire 4px à la hauteur de chaque ligne, sous-menus compris.',
        width:
          "Une largeur pour le panneau, donnée en n'importe quelle longueur ou mot-clé CSS, <code>16rem</code> ou <code>max-content</code>. Elle s'applique au menu lui-même ; les sous-menus gardent la largeur par défaut.",
        matchTrigger:
          "Empêche le panneau d'être plus étroit que le bouton qui l'a ouvert, tout en le laissant libre de s'élargir pour son contenu. Les sous-menus ne sont pas concernés.",
        vModelOpen:
          "Si le menu est affiché. Il part fermé et il est alimenté PAR le panneau, si bien que la fermeture propre au navigateur, un clic à l'extérieur, Échap, ou le choix d'une commande, y réécrit.",
      },
      slots: {
        trigger:
          "Le bouton qui ouvre le menu. Liez les <code>triggerProps</code> qu'il reçoit dessus : c'est ce qui relie les deux.",
        default: 'Le contenu du menu : VMenuItem, VMenuGroup et VMenuSeparator.',
      },
    },
    VMenuItem: {
      props: {
        label: 'Ce que dit la commande. Le slot par défaut le remplace.',
        sublabel: 'Une seconde ligne sous le libellé, pour un raccourci ou une courte explication.',
        iconStart: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        iconEnd: 'Une icône après le libellé. Le slot <code>#end</code> la remplace.',
        selected:
          'Marque cet item comme celui en vigueur, le tri choisi ou la vue active. Il est coloré et annoncé comme tel.',
        tone: 'Ce que signifie la commande, en couleur. <code>danger</code> la marque comme destructrice, ce dont relève la suppression, et <code>neutral</code>, la valeur par défaut, couvre toutes les autres.',
        disabled: "Rend l'item inutilisable : il ne répond plus et les flèches l'enjambent.",
        href: "Transforme l'item en lien pointant vers cette adresse, pour un menu qui navigue plutôt qu'il n'agit.",
      },
      events: {
        select: 'La commande a été choisie, au clic ou au clavier. Le menu se ferme de lui-même.',
      },
      slots: {
        default: 'Le libellé, qui remplace la prop <code>label</code>.',
        sublabel: 'La seconde ligne, qui remplace la prop <code>sublabel</code>.',
        start: 'Du contenu libre avant le libellé, qui prend la place de <code>iconStart</code>.',
        end: 'Du contenu libre après le libellé, qui prend la place de <code>iconEnd</code>.',
        submenu:
          "Le contenu d'un sous-menu : items, groupes et séparateurs, ce composant compris, si bien que les menus peuvent s'imbriquer aussi profond qu'il le faut.",
      },
    },
    VMenuGroup: {
      props: {
        label: "Le nom de la section. C'est un titre, pas une commande : rien ne se passe au clic.",
      },
      slots: {
        default: 'Les commandes appartenant à cette section.',
      },
    },
  },
}
