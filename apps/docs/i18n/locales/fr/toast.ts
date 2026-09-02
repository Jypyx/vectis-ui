export default {
  title: 'Notification',
  lead: "Des notifications levées depuis n'importe où dans le code en appelant <code>toast()</code>, et affichées par un seul VToaster monté une fois. Plusieurs peuvent s'empiler, chacune avec son propre compte à rebours.",

  api: {
    VToaster: {
      props: {
        placement:
          "Dans quel coin les notifications apparaissent, sauf si l'une d'elles en demande un autre.",
        duration:
          "Combien de temps une notification reste, en millisecondes, sauf si elle demande autre chose. Une notification à qui l'on donne 0 reste jusqu'à ce qu'elle soit fermée.",
        closeLabel:
          'Ce que fait la croix de fermeture, en mots. Elle retombe sur le dictionnaire du design system.',
        label:
          "Ce que les lecteurs d'écran annoncent pour les zones de notification elles-mêmes, qui sont des points de repère de la page. Il retombe sur le dictionnaire du design system.",
      },
    },
  },
}
