export default {
  title: 'Barre de confirmation',
  lead: "La confirmation d'une action qui vient d'être faite, avec un bouton pour revenir dessus. Seule la dernière vaut la peine d'être proposée : une nouvelle barre remplace donc celle affichée au lieu de s'empiler sous elle.",

  examples: {
    tones: {
      title: 'Tonalités',
      text: "Deux, et volontairement pas plus : une confirmation dit soit « c'est fait », soit « cela n'a pas marché ». Les deux sont peintes en plein, <code>neutral</code> étant l'inversion canonique du design system, sombre sur un thème clair et claire sur un thème sombre. Le succès, l'avertissement et l'accent sont des états plutôt que des issues, et rapporter un état est le travail d'une notification : ils ne sont donc pas proposés ici.",
    },
    withoutAction: {
      title: 'Sans action',
      text: "Sans action, la barre ne porte aucun bouton : un simple constat de ce qui vient de se passer, qui s'efface tout seul. C'est la bonne forme chaque fois qu'il n'y a rien à reprendre, un réglage enregistré ou un message envoyé. Quand il y a quelque chose à reprendre, le bouton est tout l'intérêt du composant, et l'exécuter retire toujours la barre : rien n'est à refermer ensuite.",
    },
    icon: {
      title: 'Avec une icône',
      text: "Facultative, et aucune n'est déduite de la tonalité. Une confirmation se lit plutôt qu'elle ne se balaie du regard, contrairement à une notification qui arrive sans prévenir : ce sont les mots qui la portent, et une icône ne fait jamais que s'y ajouter.",
    },
    placements: {
      title: 'Placements',
      text: "Le long du bord bas et nulle part ailleurs : une confirmation se place hors du chemin du contenu et près de ce que le lecteur vient de faire, ce qui est l'autre raison pour laquelle ce n'est pas une notification. Posé sur le VSnackbar, le placement est celui de toutes les barres ; passé au moment d'en lever une, il n'appartient qu'à elle.",
    },
    replacement: {
      title: 'Une seule à la fois',
      text: "Il y a au plus une barre, et en lever une seconde remplace la première sur-le-champ, compte à rebours relancé. Tout le reste du composant en découle : aucune pile à gérer, pas de croix de fermeture puisqu'une barre qui se range seule ne doit pas le demander au lecteur, et une valeur unique plutôt qu'une file pour la tenir. Deux états peuvent être vrais en même temps, et c'est pourquoi les notifications s'empilent ; seule la dernière action du lecteur mérite qu'on propose de la défaire.",
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: "Quatre secondes par défaut, moins qu'une notification, parce que le lecteur sait déjà ce que dit la barre : il vient de le faire. Le compte à rebours est suspendu tant que le pointeur repose sur la barre et tant que le clavier s'y trouve, et il ne repart que lorsque les deux sont partis : une action vers laquelle on tend la main n'est jamais retirée en route. Posez la durée sur le VSnackbar pour toutes les barres, ou au moment d'en lever une pour celle-là seule.",
    },
    persistent: {
      title: "La garder jusqu'à ce qu'on la retire",
      text: "Une durée de 0 désarme le compte à rebours : la barre reste alors jusqu'à ce que quelque chose la remplace ou la retire. Réservez-le à une confirmation sur laquelle le lecteur doit agir, et donnez-lui une sortie : <code>snackbar</code> renvoie un identifiant, et <code>dismissSnackbar</code> retire cette barre-là. Passer l'identifiant n'est pas une formalité, il est vérifié contre la barre réellement à l'écran : un gestionnaire arrivé en retard ne peut donc pas fermer la confirmation qui vient de remplacer la sienne.",
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
