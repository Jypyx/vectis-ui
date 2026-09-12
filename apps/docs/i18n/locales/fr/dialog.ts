export default {
  title: 'Boîte de dialogue',
  lead: 'Un <code>&lt;dialog&gt;</code> natif ouvert en modal : le piège à focus, la page inerte derrière et la couche supérieure viennent tous du navigateur. VDialogAlert est la même boîte, resserrée sur une question à laquelle il faut répondre.',

  examples: {
    width: {
      title: 'Largeur',
      text: "<code>width</code> accepte une longueur CSS dans n'importe quelle unité, 400px par défaut. La boîte ne dépasse jamais la fenêtre et garde une marge de chaque côté.",
    },
    longContent: {
      title: 'Contenu long',
      text: "Seul le corps défile, l'en-tête et le pied restant en place. Des filets apparaissent sous l'en-tête et au-dessus du pied tant que du contenu passe derrière eux.",
    },
    customHeader: {
      title: 'En-tête personnalisé',
      text: "Le slot <code>#header</code> remplace tout le bloc titre et sous-titre. La prop <code>title</code> est alors ignorée : nommez la boîte avec un <code>aria-label</code>. La croix de fermeture n'est pas touchée.",
    },
    headerActions: {
      title: "Actions d'en-tête",
      text: "Le slot <code>#header-actions</code> ajoute des contrôles à l'en-tête, rendus avant la croix de fermeture pour que celle-ci reste au bord.",
    },
    dismissal: {
      title: 'Fermeture',
      text: "<code>hideClose</code> retire la croix, <code>persistentBackdrop</code> ignore un clic à l'extérieur et <code>persistentEscape</code> ignore la touche. Fermer toutes les issues rend un pied obligatoire.",
    },
    alert: {
      title: "Boîte d'alerte",
      text: "VDialogAlert est cette même boîte aux options figées : elle est annoncée comme une alerte, et il n'y a ni croix, ni Échap, ni clic extérieur, si bien que son pied n'est pas optionnel.",
    },
  },

  api: {
    VDialog: {
      props: {
        title:
          "Le titre de la boîte, qui la nomme aussi pour les technologies d'assistance. Il est ignoré quand le slot <code>#header</code> remplace tout l'en-tête.",
        subtitle: 'Une ligne sous le titre, qui explique ce que la boîte demande.',
        width:
          "La largeur de la boîte, dans n'importe quelle unité CSS. Elle n'est jamais autorisée à dépasser la largeur de la fenêtre.",
        role: "Le genre de boîte. <code>alertdialog</code> est fait pour celle à laquelle il faut répondre explicitement, et il pousse les lecteurs d'écran à l'annoncer avec plus d'insistance.",
        hideClose:
          "Retire la croix de fermeture de l'en-tête, ne laissant au lecteur qu'Échap, l'arrière-plan et ce que le pied propose.",
        persistentBackdrop: 'Empêche un clic hors de la boîte de la fermer.',
        persistentEscape:
          "Empêche la touche Échap de fermer la boîte. Refuser Échap alors que l'arrière-plan ferme encore ne peut pas s'exprimer nativement : les deux voies restent alors ouvertes.",
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
