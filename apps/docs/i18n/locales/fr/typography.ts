export default {
  title: 'Typographie',
  lead: '<code>VTypography</code> applique un style typographique à un élément de texte.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> définit la taille, la graisse, la hauteur de ligne et les autres réglages du style choisi.',
    },
    tones: {
      title: 'Tonalités',
      text: '<code>tone</code> définit une couleur de texte sémantique. <code>default</code> hérite de la couleur environnante.',
    },
    tags: {
      title: 'La balise rendue',
      text: 'Les variantes fournissent des balises HTML par défaut. Utilisez <code>as</code> si la structure du document en exige une autre.',
    },
    truncate: {
      title: 'Tronquer sur une ligne',
      text: '<code>truncate</code> tronque le texte sur une ligne avec des points de suspension. Limitez la largeur de l’élément.',
    },
    paragraph: {
      title: 'Un bloc de texte',
      text: 'Le composant n’ajoute aucune marge. Définissez l’espacement dans la disposition parente.',
    },
  },
  api: {
    VTypography: {
      props: {
        variant: 'Style typographique, avec taille, graisse et hauteur de ligne.',
        as: 'Balise HTML. Remplace celle de la variante.',
        tone: 'Couleur de texte sémantique. <code>default</code> hérite de la couleur environnante.',
        truncate: 'Troncature sur une ligne. Nécessite une largeur limitée.',
      },
      slots: {
        default: 'Contenu textuel.',
      },
    },
  },
}
