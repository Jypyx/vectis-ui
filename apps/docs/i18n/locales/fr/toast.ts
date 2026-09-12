export default {
  title: 'Notification',
  lead: "Des notifications levées depuis n'importe où dans le code en appelant <code>toast()</code>, et affichées par un seul VToaster monté une fois. Plusieurs peuvent s'empiler, chacune avec son propre compte à rebours.",

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "<code>tone</code> dit ce que signifie la notification, en cinq valeurs, et décide de l'icône qu'elle prend quand aucune n'est donnée. <code>variant</code> est l'intensité avec laquelle ce ton est peint, teinté ou plein.",
    },
    contents: {
      title: 'Titre et message',
      text: "<code>message</code> porte la notification, et <code>title</code> l'encadre en quelques mots quand le message seul ne dirait pas de quoi il retourne.",
    },
    icons: {
      title: 'Icônes',
      text: 'Sans elle, <code>icon</code> vient du ton. En nommer une la remplace, et passer <code>false</code> la retire tout à fait.',
    },
    width: {
      title: 'Largeur',
      text: "<code>width</code> accepte n'importe quelle longueur CSS et remplace le plancher et le plafond de la carte. Elle ne dépasse jamais la largeur de la fenêtre.",
    },
    placements: {
      title: 'Placements',
      text: "<code>placement</code> pose la notification dans l'un des six coins, chacun ayant sa propre pile. Posé sur le VToaster, il est la valeur par défaut de toutes les notifications ; passé au moment d'en lever une, il n'appartient qu'à elle.",
    },
    stacking: {
      title: 'Empilement',
      text: "Les notifications s'empilent au lieu de se remplacer, chacune gardant son propre compte à rebours, si bien qu'elles partent au rythme de leur propre horloge.",
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: "<code>duration</code> est la durée d'affichage d'une notification, cinq secondes par défaut, et chacune peut demander la sienne. Le compte à rebours se suspend tant que le pointeur repose quelque part sur la pile.",
    },
    persistent: {
      title: 'Notifications persistantes',
      text: "Une <code>duration</code> de 0 désarme le compte à rebours et la notification reste jusqu'à ce qu'on la retire. Laissez la croix de fermeture pour qu'il y ait une sortie.",
    },
    dismissing: {
      title: 'Renvoyer une notification',
      text: "<code>closable</code> à false retire la croix de fermeture. <code>toast</code> rend un identifiant et <code>dismissToast</code> retire cette notification, ou toutes d'un coup lorsqu'il est appelé sans argument.",
    },
  },

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
