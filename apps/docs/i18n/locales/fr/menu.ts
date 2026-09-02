export default {
  title: 'Menu',
  lead: "Une liste de commandes ouverte par un bouton. Il porte tout le patron ARIA menu : focus glissant, sous-menus imbriqués, et l'empilement des panneaux par le navigateur pour qu'une seule fermeture referme la branche.",

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
        danger:
          "Marque la commande comme destructrice, ce qui la colore en conséquence. Supprimer quelque chose relève d'ici.",
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
