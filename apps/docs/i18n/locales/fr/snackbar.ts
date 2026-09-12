export default {
  title: 'Barre de confirmation',
  lead: "La confirmation d'une action qui vient d'être faite, avec un bouton pour revenir dessus. Seule la dernière vaut la peine d'être proposée : une nouvelle barre remplace donc celle affichée au lieu de s'empiler sous elle.",

  examples: {
    tones: {
      title: 'Tonalités',
      text: '<code>tone</code> propose deux valeurs et pas plus : une confirmation dit soit que cela a marché, soit que non. Les deux sont peintes en solid.',
    },
    withoutAction: {
      title: 'Sans action',
      text: "Sans action, la barre ne porte aucun bouton. Quand il y en a un, l'exécuter retire toujours la barre.",
    },
    icon: {
      title: 'Avec une icône',
      text: "<code>icon</code> est optionnelle, et aucune n'est déduite du ton.",
    },
    placements: {
      title: 'Placements',
      text: "<code>placement</code> pose la barre le long du bord inférieur, au début, au centre ou à la fin. Posé sur le VSnackbar, il est la valeur par défaut de toutes les barres ; passé au moment d'en lever une, il n'appartient qu'à elle.",
    },
    replacement: {
      title: 'Une seule à la fois',
      text: "Il n'y a au plus qu'une barre : en lever une seconde remplace la première sur-le-champ, compte à rebours relancé.",
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: "<code>duration</code> est la durée d'affichage de la barre, quatre secondes par défaut. Le compte à rebours se suspend tant que le pointeur est sur la barre et tant que le clavier y est, et ne repart que lorsque les deux sont partis.",
    },
    persistent: {
      title: "La garder jusqu'à ce qu'on la retire",
      text: "Une <code>duration</code> de 0 désarme le compte à rebours : la barre reste jusqu'à ce que quelque chose la remplace ou la retire. <code>snackbar</code> rend un identifiant, et <code>dismissSnackbar</code> retire cette barre.",
    },
  },

  api: {
    VSnackbar: {
      props: {
        placement:
          "À quelle extrémité du bord inférieur les confirmations apparaissent, sauf si l'une d'elles en demande une autre.",
        duration:
          "Combien de temps une confirmation reste, en millisecondes, sauf si elle demande autre chose. Une confirmation à qui l'on donne 0 reste jusqu'à ce qu'elle soit remplacée ou retirée à la main.",
        actionLabel:
          "Le nom de l'unique action, quand la confirmation ne la nomme pas. Il retombe sur le dictionnaire du design system.",
        label:
          "Ce que les lecteurs d'écran annoncent pour la zone de confirmation elle-même, qui est un point de repère de la page. Il retombe sur le dictionnaire du design system.",
      },
    },
  },
}
