export default {
  title: "Fil d'Ariane",
  lead: "Le chemin de retour depuis la page consultée. Il est piloté par les données : une seule liste de segments, et le segment courant se déduit de l'adresse plutôt que d'être marqué à la main.",

  examples: {
    separator: {
      title: 'Séparateur personnalisé',
      text: "Le chevron entre deux segments est la prop <code>separator</code>, et elle accepte n'importe quelle valeur d'icône. Le premier fil ci-dessous passe une des icônes que la bibliothèque embarque ; le second passe une image via <code>{ src }</code>, la voie pour une marque qu'aucun jeu d'icônes ne fournit. Attention à la différence : une icône dessinée hérite de la couleur du texte et suit le thème, une image porte la sienne et doit donc rester lisible sur les deux fonds.",
    },
    icons: {
      title: 'Avec des icônes',
      text: "Chaque segment accepte un <code>iconStart</code>, aux mêmes conditions que partout ailleurs dans la bibliothèque : une des icônes de la bibliothèque, un nom auquel répond votre jeu d'icônes, ou un rendu explicite. Tenez-vous en à une marque qui dit ce que le libellé ne dit pas : c'est le libellé qu'un lecteur d'écran énonce, l'icône restant décorative.",
    },
    truncated: {
      title: 'Troncature',
      text: "Au-delà de <code>maxItems</code>, le fil garde son premier segment et ses deux derniers, et replie tout ce qui se trouve entre eux derrière des points de suspension, qui ouvrent un menu listant les seuls segments masqués. Trois est le plancher effectif : en dessous, il ne reste rien au milieu à replier. La page courante n'est jamais masquée, étant le dernier segment.",
    },
  },

  api: {
    VBreadcrumb: {
      props: {
        items: 'Les segments du fil, ordonnés du plus général au plus profond.',
        label:
          "Le nom que les lecteurs d'écran annoncent pour cette navigation. Il retombe sur le dictionnaire du design system, dans la langue courante.",
        currentPath:
          "L'adresse de la page affichée. Le segment dont le <code>href</code> lui correspond est le segment courant ; une barre oblique finale d'un côté ou de l'autre ne change rien.",
        separator: "L'icône dessinée entre deux segments.",
        maxItems:
          "La longueur au-delà de laquelle le fil se replie : il ne reste que le premier segment, un bouton de points de suspension et les deux derniers, le bouton ouvrant un menu qui liste les seuls segments masqués. En dessous de 3 il n'y aurait plus rien à replier : 3 est donc le minimum effectif.",
        ellipsisLabel:
          "Le nom que les lecteurs d'écran annoncent pour le bouton de points de suspension. Il retombe sur le dictionnaire du design system.",
      },
    },
  },
}
