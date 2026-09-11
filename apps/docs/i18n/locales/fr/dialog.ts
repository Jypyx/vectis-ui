export default {
  title: 'Boîte de dialogue',
  lead: 'Un <code>&lt;dialog&gt;</code> natif ouvert en modal : le piège à focus, la page inerte derrière et la couche supérieure viennent tous du navigateur. VDialogAlert est la même boîte, resserrée sur une question à laquelle il faut répondre.',

  examples: {
    width: {
      title: 'Largeur',
      text: "Une longueur CSS dans l'unité de votre choix, 400px à défaut. Quelle qu'elle soit, la boîte ne dépasse jamais la fenêtre et garde une marge de chaque côté : une largeur fixée en pixels n'a donc pas à être défendue contre un petit écran. La hauteur suit la même règle, ce qui fait d'une boîte trop haute une boîte qui défile plutôt qu'une boîte qui sort de l'écran.",
    },
    longContent: {
      title: 'Contenu long',
      text: "Seul le corps défile. L'en-tête et le pied restent en place, ce qui garde la barre de défilement hors d'eux et les boutons atteignables sans dérouler jusqu'au bout. Des filets apparaissent sous l'en-tête et au-dessus du pied exactement pendant qu'un contenu passe derrière eux, tracés par deux sentinelles placées dans la zone de défilement, qui lui demandent s'il reste quelque chose de caché. Cette question est récente : là où elle ne peut pas être posée, les filets restent simplement invisibles et rien d'autre ne change.",
    },
    customHeader: {
      title: 'En-tête personnalisé',
      text: "Le slot <code>#header</code> remplace tout le bloc titre et sous-titre, contrôles compris. La prop <code>title</code> est alors ignorée, et avec elle le nom accessible qu'elle fournissait : nommez donc la boîte par un <code>aria-label</code>. La croix de fermeture, elle, n'est pas touchée : elle appartient aux actions d'en-tête placées à côté du slot, pas à ce que le slot remplace.",
    },
    headerActions: {
      title: "Actions d'en-tête",
      text: "Le slot <code>#header-actions</code> ajoute des contrôles à l'en-tête, rendus avant la croix pour que celle-ci reste au bord où le lecteur la cherche. C'est la place de ce qui agit sur la boîte elle-même plutôt que sur la réponse qu'elle demande : un menu, un détail à déplier, un passage en plein écran. La réponse, elle, appartient au pied.",
    },
    dismissal: {
      title: 'Fermeture',
      text: "On sort d'une boîte de trois façons, et chacune peut être condamnée. <code>hideClose</code> retire la croix, <code>persistentBackdrop</code> ignore le clic à l'extérieur, et <code>persistentEscape</code> ignore la touche. Les deux dernières sont déclarées au navigateur plutôt que traitées en code, ce qui a une conséquence à connaître : refuser Escape en laissant le clic extérieur fermer est inexprimable nativement, si bien que le demander réautorise les deux. Condamnez toutes les routes et le pied devient la seule sortie, ce qui rend obligatoire d'en fournir un.",
    },
    alert: {
      title: "Boîte d'alerte",
      text: "VDialogAlert est cette même boîte aux options figées, et ce sont ces options figées qui changent sa nature : elle est annoncée comme une alerte plutôt que comme une boîte ordinaire, et il n'y a ni croix, ni Escape, ni clic extérieur. Le pied est la seule sortie du lecteur : il n'est donc pas facultatif. Réservez-la à ce qui exige une réponse explicite, une suppression ou un échec, et laissez tout le reste à VDialog.",
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
