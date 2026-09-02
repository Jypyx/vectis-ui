export default {
  title: "Groupe d'avatars",
  lead: "Des avatars empilés en rangée, chacun séparé du suivant par un anneau de la couleur de la page. Au-delà d'une limite de votre choix, les autres sont résumés en un seul disque.",

  api: {
    VAvatarGroup: {
      props: {
        max: "Combien d'avatars montrer avant que les restants ne soient résumés en un seul disque « +X ». Omise, ou mise à 0, tous les avatars sont montrés.",
        size: 'La taille donnée aux avatars du groupe. Un avatar qui fixe une taille à lui la garde.',
        compact:
          'Applique la densité réduite aux avatars du groupe, aux mêmes conditions que la taille.',
        ringColor:
          "La couleur de l'anneau dessiné autour de chaque disque. Elle vaut par défaut le fond de la page, et c'est ce qui fait lire l'anneau comme un écart entre deux avatars.",
      },
      slots: {
        default: 'Les VAvatar à empiler.',
        overflow:
          "Remplace le disque « +X » qui représente les avatars au-delà de <code>max</code>. Il reçoit <code>count</code>, le nombre d'avatars masqués.",
      },
    },
  },
}
