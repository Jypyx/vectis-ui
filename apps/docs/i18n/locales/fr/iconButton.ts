export default {
  title: 'Bouton icône',
  lead: "Un bouton carré portant une icône et aucun libellé. C'est VButton en dessous, avec deux valeurs par défaut à lui et un nom obligatoire, puisque l'image est tout ce qu'un lecteur d'écran aurait sinon.",

  api: {
    VIconButton: {
      props: {
        label:
          "Ce que fait le bouton, en mots. Cela devient l'<code>aria-label</code> et c'est la seule chose dont dispose un lecteur d'écran : nommez donc l'action, « Fermer », « Mois suivant », plutôt que l'image.",
        variant: "Le poids visuel que porte le bouton, sur l'échelle de VButton.",
        tone: "Ce que l'action signifie, en couleur. Un bouton réduit à une icône relève le plus souvent du décor, et c'est pourquoi il part en neutre là où VButton part en accent.",
        elevated:
          'Soulève le bouton avec une ombre, et une surface surélevée sur ghost et outline.',
        size: "La taille du carré, tirée de l'échelle partagée par tous les contrôles.",
        compact: 'Retire 4px des deux côtés du carré, qui reste carré.',
        shape:
          'La silhouette : un carré portant le rayon de coin commun à tous les contrôles, ou un cercle. La boîte reste carrée dans les deux cas, seuls les coins changent.',
        type: 'Le type natif du bouton. Il est ignoré dès que <code>href</code> en fait un lien.',
        disabled: 'Rend le bouton inutilisable, grisé par les tokens de couleur.',
        loading: "Remplace l'icône par un indicateur et désactive le bouton pendant qu'il tourne.",
        icon: "L'icône à afficher. Le slot par défaut est la voie pour en fournir une que cette prop ne peut pas exprimer.",
        iconFilled: "Rend l'icône dans sa forme pleine, l'axe <code>FILL</code> de la police.",
      },
      slots: {
        default:
          "L'icône, quand la prop <code>icon</code> ne peut pas l'exprimer : un VIcon, ou un SVG en ligne marqué <code>aria-hidden</code>, le bouton étant déjà nommé par son libellé.",
      },
    },
  },
}
