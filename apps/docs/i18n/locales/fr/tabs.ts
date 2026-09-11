export default {
  title: 'Onglets',
  lead: "Une barre d'onglets et les panneaux qu'ils montrent. Les panneaux sont un slot optionnel : le même composant sert donc de simple barre ou de contrôle segmenté quand il n'y a rien à révéler.",

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "La variante empaquette deux décisions dans un mot : la piste sur laquelle reposent les onglets, et le cadre autour de l'ensemble. <code>flat</code> trace une règle sous la rangée et souligne l'onglet sélectionné ; <code>outlined</code> est la même barre avec ses panneaux dans une carte, la règle devenant la frontière entre les deux ; <code>inset</code> pose la rangée dans une piste creusée et en fait un segmented control, ce qui est la raison pour laquelle elle n'est jamais encadrée, étant déjà une surface à elle. La tonalité colore l'onglet sélectionné et rien d'autre : les autres restent neutres quoi qu'elle dise, un seul d'entre eux affirmant quelque chose. Trois tonalités, celles que propose un bouton, puisque chaque onglet en est un.",
    },
    sizes: {
      title: 'Tailles',
      text: "L'échelle que partagent tous les contrôles, de 24 à 56 pixels, <code>compact</code> en retirant 4px. Elle se pose une fois sur la barre et chaque onglet est un bouton de cette taille : un onglet et un bouton côte à côte s'alignent, au lieu de presque s'aligner.",
    },
    tabContent: {
      title: 'Ce que porte un onglet',
      text: "Un libellé, une icône à l'une ou l'autre extrémité, ou le slot par défaut pour ce qu'une chaîne ne peut pas contenir, un compteur ou un badge. Un onglet réduit à son icône doit quand même dire ce qu'il est : sans libellé il ne reste aucun nom accessible, donnez-lui-en un. L'icône de fin est la place de ce que l'onglet porte plutôt que de ce qu'il est : un nombre d'éléments, un état.",
    },
    panels: {
      title: 'Panneaux',
      text: "Un panneau masqué est masqué et non détruit : ce qu'il contient garde son état, et un champ à l'intérieur est toujours soumis avec le formulaire. <code>lazy</code> est l'exception, et seulement pour le premier affichage : il retient le contenu jusqu'à ce que le panneau soit ouvert une fois, puis le conserve comme les autres, ce que veut un panneau coûteux. Omettre le slot ne rend aucune zone de panneaux, et c'est l'autre moitié du composant : la même barre devient alors un segmented control qui bascule une vue vivant ailleurs sur la page. Le slot doit être présent ou absent dès le départ, jamais apparaître ensuite : l'existence des panneaux se décide une fois et doit concorder entre le serveur et le navigateur.",
    },
    alignment: {
      title: 'Alignement',
      text: "Où se placent les onglets le long de la barre quand ils ne la remplissent pas. Cela se pose sur la barre et non sur la liste d'onglets, et ce n'est pas un détail : pousser une liste qui déborde mettrait définitivement hors d'atteinte ce qui dépasse du bord de départ.",
    },
    grow: {
      title: 'Remplir la barre',
      text: "Les onglets se partagent toute la barre à parts égales, quoi que valent leurs libellés, ce qui transforme une rangée courte en segmented control couvrant son conteneur. Un libellé trop long pour sa part est tronqué plutôt qu'autorisé à l'élargir. Remplir et défiler sont incompatibles par construction : des onglets sommés de remplir la barre ne peuvent jamais la déborder.",
    },
    orientation: {
      title: 'Orientation',
      text: "Sur le côté plutôt qu'en travers. Les panneaux se placent alors à côté des onglets et non en dessous, les flèches suivent l'axe, et les boutons de défilement passent aux extrémités de la colonne, leurs icônes tournées en conséquence. Une chose bouge qui mérite d'être sue : encadrée, la règle entre les onglets et les panneaux change de bord, le cadre traçant déjà celle de l'extérieur et ce qui manque étant la frontière entre les deux moitiés.",
    },
    scrolling: {
      title: 'Défilement',
      text: "Trop d'onglets pour la place et la barre défile : au doigt, au trackpad, et au clavier, où les flèches ramènent dans le champ l'onglet qu'elles atteignent. La barre de défilement elle-même est masquée, les onglets qui filent hors du bord étant l'indice. Une chose à savoir sur le conteneur : un élément de grille ou de flex ne rétrécit pas en dessous de son contenu sans qu'on le lui dise, donc sans une taille minimale nulle la liste élargit son parent au lieu de déborder.",
    },
    scrollButtons: {
      title: 'Boutons de défilement',
      text: "Un bouton à chaque extrémité de la barre, désactivé dès que cette extrémité est atteinte, pour un pointeur qui n'a pas de molette. Ils sont facultatifs parce que sur une barre qui ne déborde jamais ils seraient deux contrôles désactivés en permanence, et ils excluent <code>grow</code> pour la même raison.",
    },
    customArrows: {
      title: 'Flèches personnalisées',
      text: "Les icônes par défaut suivent l'orientation, chevrons en travers et carets en hauteur : il n'y a donc rien à poser sur l'un ou l'autre axe. Remplacez-les quand le design autour en demande un autre glyphe. Les libellés sont ce qu'un lecteur d'écran lit pour ces deux boutons, et ils retombent sur le dictionnaire du design system dans la langue courante.",
    },
    activation: {
      title: "Sélectionner à l'arrivée",
      text: "Manuel par défaut : une flèche déplace le focus, Entrée ou Espace sélectionne. En automatique, arriver sur un onglet le sélectionne, ce que recommandent les pratiques ARIA quand le panneau s'affiche instantanément, le lecteur entendant chaque panneau en parcourant la rangée au lieu de confirmer chacun. Restez en manuel quand afficher un panneau coûte une requête, sinon chaque onglet traversé en chemin en déclencherait une.",
    },
    disabled: {
      title: 'Onglets désactivés',
      text: "Un onglet désactivé est un bouton désactivé : il ne répond plus, se grise par les tokens de couleur plutôt que par une opacité, et les flèches l'enjambent comme s'il n'était pas dans la rangée. Son panneau n'est simplement jamais affiché. Prenez garde à ne pas laisser la valeur pointer dessus : une barre dont l'onglet sélectionné ne peut pas être activé n'a plus aucun arrêt de tabulation et devient inatteignable au clavier.",
    },
  },

  api: {
    VTabs: {
      props: {
        variant:
          "Comment la barre est encadrée. <code>flat</code> ne dessine qu'un filet sous les onglets, celui sélectionné étant souligné ; <code>outlined</code> place cette même barre et ses panneaux dans une carte ; <code>inset</code> transforme la rangée en contrôle segmenté posé dans une piste creuse.",
        tone: "La couleur que prend l'onglet sélectionné. Les autres restent neutres quoi que dise cette prop.",
        size: "La hauteur des onglets, tirée de l'échelle partagée par tous les contrôles.",
        compact: 'Retire 4px à la hauteur de chaque onglet.',
        orientation: 'Si les onglets courent en travers de la page ou le long de son côté.',
        align: 'Où se placent les onglets le long de la barre quand ils ne la remplissent pas.',
        grow: 'Fait partager toute la barre aux onglets, en parts égales.',
        scrollButtons:
          "Ajoute un bouton à chaque extrémité de la barre pour la faire défiler, chacun désactivé une fois cette extrémité atteinte. Cela n'a de sens que si les onglets peuvent déborder, donc c'est exclusif de <code>grow</code>.",
        prevIcon: "L'icône du bouton de défilement arrière. Elle suit l'orientation par défaut.",
        nextIcon: "L'icône du bouton de défilement avant. Elle suit l'orientation par défaut.",
        prevLabel:
          'Ce que fait le bouton de défilement arrière, en mots. Il retombe sur le dictionnaire.',
        nextLabel:
          'Ce que fait le bouton de défilement avant, en mots. Il retombe sur le dictionnaire.',
        activation:
          "Si se déplacer sur un onglet le sélectionne aussi. Sélectionner à l'arrivée est ce que recommandent les pratiques ARIA quand un panneau apparaît instantanément ; laissez en manuel quand afficher un panneau coûte une requête, sinon chaque onglet survolé en déclencherait une.",
        label:
          "Ce que les lecteurs d'écran annoncent pour la rangée d'onglets. Il retombe sur le dictionnaire du design system.",
        vModel:
          "La valeur de l'onglet sélectionné. Il n'y a délibérément aucune valeur par défaut : le composant ne peut pas savoir lequel des onglets que vous avez écrits doit s'ouvrir. Elle doit désigner un onglet qui existe et n'est pas désactivé, faute de quoi aucun onglet n'a d'arrêt de tabulation et la barre devient inatteignable au clavier.",
      },
      slots: {
        default: 'Les onglets eux-mêmes.',
        panels:
          "Les panneaux que montrent les onglets. L'omettre ne rend aucune zone de panneau, ce qui est la façon dont le même composant sert de simple barre ou de contrôle segmenté.",
      },
    },
    VTab: {
      props: {
        value:
          "Le nom de cet onglet dans le code. Le panneau portant la même valeur est celui qu'il montre, et c'est aussi ce que porte la valeur quand cet onglet est sélectionné.",
        label: 'Le libellé visible. Le slot par défaut le remplace.',
        iconStart: 'Une icône avant le libellé.',
        iconEnd: "Une icône après le libellé, pour un compteur ou un état que l'onglet porte.",
        disabled:
          "Rend l'onglet inutilisable : il ne répond plus, les flèches l'enjambent, et il se grise par les tokens de couleur.",
      },
      slots: {
        default: "Le contenu de l'onglet, qui remplace la prop <code>label</code>.",
      },
    },
    VTabPanel: {
      props: {
        value: "Quel onglet montre ce panneau : ce doit être la valeur de l'un d'eux.",
        lazy: "Retient le contenu jusqu'au premier affichage du panneau, et le conserve ensuite. C'est fait pour un panneau coûteux à construire ; l'état qu'il porte reste préservé par la suite.",
      },
      slots: {
        default: 'Ce que contient le panneau.',
      },
    },
  },
}
