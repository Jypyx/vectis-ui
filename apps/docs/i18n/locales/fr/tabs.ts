export default {
  title: 'Onglets',
  lead: "Une barre d'onglets et les panneaux qu'ils montrent. Les panneaux sont un slot optionnel : le même composant sert donc de simple barre ou de contrôle segmenté quand il n'y a rien à révéler.",

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "<code>variant</code> pose d'un mot le rail et le cadre : <code>flat</code> trace un filet sous la rangée et souligne l'onglet choisi, <code>outlined</code> met cette même barre et ses panneaux dans une carte, <code>inset</code> pose la rangée dans un rail creux. <code>tone</code> colore l'onglet choisi et rien d'autre, avec les trois valeurs qu'offre un bouton.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> reprend l'échelle partagée par tous les contrôles, de 24 à 56 pixels, et <code>compact</code> lui retire 4px. Elle se pose une fois sur la barre.",
    },
    tabContent: {
      title: 'Ce que porte un onglet',
      text: "Un onglet accepte un libellé, une icône à chaque extrémité par <code>iconStart</code> et <code>iconEnd</code>, ou le slot par défaut pour ce qu'une chaîne ne peut pas porter. Un onglet réduit à son icône demande toujours un <code>label</code>, qui est alors son nom accessible.",
    },
    panels: {
      title: 'Panneaux',
      text: "Un panneau masqué est masqué et non détruit : son contenu garde son état et un champ qu'il contient est toujours soumis. <code>lazy</code> retient le contenu jusqu'à la première ouverture. Sans le slot <code>#panels</code>, aucune zone de panneaux n'est rendue, et ce slot doit être présent ou absent dès le départ.",
    },
    alignment: {
      title: 'Alignement',
      text: '<code>align</code> dit où se placent les onglets le long de la barre quand ils ne la remplissent pas. Il se pose sur la barre et non sur la liste des onglets.',
    },
    grow: {
      title: 'Remplir la barre',
      text: '<code>grow</code> partage toute la barre entre les onglets en parts égales, un libellé trop long pour sa part étant tronqué. Il est incompatible avec le défilement par construction.',
    },
    orientation: {
      title: 'Orientation',
      text: "<code>orientation</code> à <code>vertical</code> fait descendre les onglets sur le côté, les panneaux se plaçant à côté d'eux et les flèches suivant l'axe.",
    },
    scrolling: {
      title: 'Défilement',
      text: "Trop d'onglets pour la place et la barre défile, au doigt, au pavé tactile et au clavier. Le conteneur demande une taille minimale nulle, sans quoi la liste élargit son parent au lieu de déborder.",
    },
    scrollButtons: {
      title: 'Boutons de défilement',
      text: '<code>scrollButtons</code> ajoute un bouton à chaque extrémité de la barre, chacun désactivé une fois cette extrémité atteinte. Il est optionnel, et exclut <code>grow</code>.',
    },
    customArrows: {
      title: 'Flèches personnalisées',
      text: "<code>prevIcon</code> et <code>nextIcon</code> remplacent les flèches, dont les valeurs par défaut suivent l'orientation. <code>prevLabel</code> et <code>nextLabel</code> sont ce que lit un lecteur d'écran pour ces deux boutons, et se rabattent sur le dictionnaire.",
    },
    activation: {
      title: "Sélectionner à l'arrivée",
      text: "<code>activation</code> est manuelle par défaut : une flèche déplace le focus, et Entrée ou Espace choisit. En automatique, l'onglet atteint par le focus est choisi, ce qui convient à un panneau qui apparaît instantanément.",
    },
    disabled: {
      title: 'Onglets désactivés',
      text: "Un onglet <code>disabled</code> ne répond plus, se grise par les tokens de couleur et est enjambé par les flèches. Ne laissez pas la valeur pointer dessus, sinon la barre n'a plus aucun arrêt de tabulation.",
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
