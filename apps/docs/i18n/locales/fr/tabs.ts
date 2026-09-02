export default {
  title: 'Onglets',
  lead: "Une barre d'onglets et les panneaux qu'ils montrent. Les panneaux sont un slot optionnel : le même composant sert donc de simple barre ou de contrôle segmenté quand il n'y a rien à révéler.",

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
        icon: 'Une icône avant le libellé.',
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
