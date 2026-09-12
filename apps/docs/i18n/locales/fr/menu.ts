export default {
  title: 'Menu',
  lead: "Une liste de commandes ouverte par un bouton. Il porte tout le patron ARIA menu : focus glissant, sous-menus imbriqués, et l'empilement des panneaux par le navigateur pour qu'une seule fermeture referme la branche.",

  examples: {
    menuItems: {
      title: 'Les commandes',
      text: "Une ligne porte un libellé, une icône à chaque extrémité, et un <code>tone</code> : <code>danger</code> pour ce qui détruit quelque chose, <code>neutral</code> pour tout le reste. <code>disabled</code> la rend muette et les flèches l'enjambent, et <code>href</code> en fait un vrai lien. VMenuSeparator trace un filet entre deux séries de commandes.",
    },
    sublabels: {
      title: 'Seconde ligne',
      text: '<code>sublabel</code> ajoute une seconde ligne sous le libellé, pour ce que la commande fait et que son nom ne dit pas, ou pour le raccourci qui la déclenche.',
    },
    selection: {
      title: 'Sélection',
      text: "<code>selected</code> marque la ligne en vigueur, la colore et l'annonce comme le choix courant. Choisir une ligne ferme toujours le panneau.",
    },
    groups: {
      title: 'Groupes',
      text: "VMenuGroup est un bloc nommé de commandes. Son libellé est un titre : rien ne se passe au clic et les flèches ne s'y arrêtent jamais.",
    },
    submenus: {
      title: 'Sous-menus',
      text: "Une ligne à laquelle on donne un slot <code>#submenu</code> ouvre son propre panneau, et ces panneaux peuvent s'imbriquer autant que nécessaire. Le survol l'ouvre après un court délai, et les flèches droite et gauche y entrent et en sortent.",
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la hauteur des lignes à 32, 40 ou 48 pixels, et <code>compact</code> lui retire 4px. Elle se pose une fois sur le menu, les sous-menus la lisant de là.',
    },
    width: {
      title: 'Largeur',
      text: "<code>width</code> remplace le plancher et le plafond du panneau par n'importe quelle longueur ou mot-clé CSS. <code>matchTrigger</code> ne remplace que le plancher : le panneau ne peut plus être plus étroit que le bouton qui l'a ouvert. Les deux valent pour le menu lui-même, les sous-menus gardant la valeur par défaut.",
    },
    placement: {
      title: 'Position',
      text: "<code>placement</code> nomme la direction d'ouverture préférée du panneau, au-dessus ou en dessous du déclencheur.",
    },
    open: {
      title: 'Savoir si le menu est ouvert',
      text: "<code>v-model:open</code> est alimenté par le panneau autant que lu par vous : un clic à l'extérieur, Échap ou le choix d'une commande y réécrivent. Un menu ouvert depuis le code s'ancre quand même à son déclencheur.",
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
