export default {
  title: 'Boîte de dialogue',
  lead: 'Un <code>&lt;dialog&gt;</code> natif ouvert en modal : le piège à focus, la page inerte derrière et la couche supérieure viennent tous du navigateur. VDialogAlert est la même boîte, resserrée sur une question à laquelle il faut répondre.',

  api: {
    VDialog: {
      props: {
        title:
          "Le titre de la boîte, qui la nomme aussi pour les technologies d'assistance. Il est ignoré quand le slot <code>#header</code> remplace tout l'en-tête.",
        subtitle: 'Une ligne sous le titre, qui explique ce que la boîte demande.',
        width:
          "La largeur de la boîte, dans n'importe quelle unité CSS. Elle n'est jamais autorisée à dépasser la largeur de la fenêtre.",
        role: "Le genre de boîte. <code>alertdialog</code> est fait pour celle à laquelle il faut répondre explicitement, et il pousse les lecteurs d'écran à l'annoncer avec plus d'insistance.",
        closable:
          "Affiche la croix de fermeture dans l'en-tête. La couper laisse au lecteur Échap, l'arrière-plan et ce que le pied propose.",
        closeOnBackdrop: 'Laisse un clic hors de la boîte la fermer.',
        closeOnEscape:
          "Laisse la touche Échap fermer la boîte. La couper tout en gardant <code>closeOnBackdrop</code> ne peut pas s'exprimer nativement, et les deux sont alors permis.",
        closeLabel:
          'Ce que fait la croix de fermeture, en mots. Elle retombe sur le dictionnaire du design system.',
        vModelOpen:
          "Si la boîte est affichée. Elle part fermée, et la liaison est bidirectionnelle : le navigateur y réécrit chaque fois que la boîte se ferme d'elle-même, par Échap ou par l'arrière-plan, si bien que vous n'avez jamais à la réinitialiser à la main.",
      },
      slots: {
        default: "Le corps de la boîte. C'est la partie qui défile quand il y en a trop.",
        header: 'Remplace le bloc titre et sous-titre par un contenu à vous.',
        headerActions:
          "Des contrôles supplémentaires dans l'en-tête, placés avant la croix de fermeture : un menu, une bascule plein écran.",
        footer: 'Les boutons au pied de la boîte.',
        trigger:
          "Le bouton qui ouvre la boîte. Liez les <code>triggerProps</code> qu'il reçoit dessus. Il reste rendu en permanence, contrairement à la boîte elle-même.",
      },
    },
    VDialogAlert: {
      props: {
        title:
          "La question posée, qui nomme aussi la boîte pour les technologies d'assistance. Elle est ignorée quand le slot <code>#header</code> remplace tout l'en-tête.",
        subtitle: 'Une ligne sous le titre, qui détaille les conséquences de la réponse.',
        width:
          "La largeur de la boîte, dans n'importe quelle unité CSS. Elle n'est jamais autorisée à dépasser la largeur de la fenêtre.",
        vModelOpen: "Si l'alerte est affichée. Elle part fermée, et la fermeture y réécrit.",
      },
      slots: {
        default: "Ce que dit l'alerte.",
        header: 'Remplace le bloc titre et sous-titre par un contenu à vous.',
        footer:
          "Les boutons qui répondent à l'alerte. Ils ne sont pas optionnels : rien d'autre ne peut fermer cette boîte.",
        trigger:
          "Le bouton qui ouvre l'alerte. Liez les <code>triggerProps</code> qu'il reçoit dessus.",
      },
    },
  },
}
