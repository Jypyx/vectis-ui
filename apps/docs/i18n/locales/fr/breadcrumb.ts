export default {
  title: "Fil d'Ariane",
  lead: "Le chemin de retour depuis la page consultée. Il est piloté par les données : une seule liste de segments, et le segment courant se déduit de l'adresse plutôt que d'être marqué à la main.",

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
