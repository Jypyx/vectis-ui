export default {
  title: 'Puce',
  lead: "Une petite information : un statut, une étiquette, un filtre qui reste choisi. Elle partage mot pour mot sa table de variantes et de tons avec VButton, et ajoute les deux états qu'un bouton n'a pas.",

  api: {
    VChip: {
      props: {
        variant:
          "L'intensité avec laquelle la puce est peinte : un fond teinté, la couleur pleine, ou une bordure seule.",
        tone: "Ce que la puce signifie, exprimé en couleur. Une puce peut rapporter un état là où un bouton ne le peut pas, et c'est pourquoi elle en propose cinq plutôt que trois.",
        color:
          "Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>, qui remplace le ton. Toutes les nuances nécessaires sont dérivées de cette seule couleur, si bien qu'elle suit les deux thèmes sans rien à reconstruire. Seul le contraste du texte sur une puce en couleur pleine reste à votre charge.",
        shape: 'La silhouette : des coins doucement arrondis, ou une pilule complète.',
        size: 'La hauteur de la puce.',
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        clickable: "Fait de la puce un bouton qui réagit au clic, sans retenir d'état.",
        href: 'Où la puce mène, ce qui en fait un lien.',
        selectable:
          "Fait de la puce quelque chose qui reste choisi. Cela l'emporte sur <code>href</code> et <code>clickable</code>.",
        check:
          "Affiche une coche avant le libellé tant que la puce est sélectionnée. Elle remplace l'icône de début qui aurait été donnée, si bien que les deux ne sont jamais montrées ensemble.",
        iconStart: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        iconEnd: 'Une icône après le libellé. Le slot <code>#end</code> la remplace.',
        dismissible:
          "Ajoute un bouton qui demande le retrait de la puce. Il ne fait qu'émettre cette demande : retirer la puce est votre décision.",
        dismissIcon: "L'icône de ce bouton de retrait.",
        dismissLabel:
          'Ce que fait le bouton de retrait, en mots. Il retombe sur le dictionnaire du design system.',
        disabled: 'Rend la puce inutilisable, grisée par les tokens de couleur.',
        vModelSelected:
          "Si la puce est sélectionnée, ce qui est aussi ce qui la rend sélectionnable : la lier transforme la puce en bouton bascule et l'emporte sur <code>href</code> et <code>clickable</code>.",
      },
      events: {
        dismiss:
          "Le bouton de retrait a été pressé. La puce est toujours à l'écran : la retirer vous revient.",
      },
      slots: {
        default:
          "Le libellé. Il peut être omis entièrement, ce qui donne une puce faite d'icônes seules.",
        start: 'Du contenu avant le libellé, qui prend la place de <code>iconStart</code>.',
        end: 'Du contenu après le libellé, qui prend la place de <code>iconEnd</code>.',
      },
    },
  },
}
