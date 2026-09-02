export default {
  title: 'Barre de confirmation',
  lead: "La confirmation d'une action qui vient d'être faite, avec un bouton pour revenir dessus. Seule la dernière vaut la peine d'être proposée : une nouvelle barre remplace donc celle affichée au lieu de s'empiler sous elle.",

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
