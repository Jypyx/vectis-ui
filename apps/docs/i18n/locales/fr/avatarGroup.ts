export default {
  title: "Groupe d'avatars",
  lead: "Des avatars empilés en rangée, chacun séparé du suivant par un anneau de la couleur de la page. Au-delà d'une limite de votre choix, les autres sont résumés en un seul disque.",

  examples: {
    overflow: {
      title: 'Débordement',
      text: "<code>max</code> définit le nombre d'avatars dessinés avant que le reste soit résumé en <code>+N</code> sur un dernier disque.",
    },
    size: {
      title: 'La taille sur le groupe',
      text: "<code>size</code> posée sur le groupe s'applique à chaque avatar, disque de débordement compris. Un avatar qui fixe sa propre taille la garde.",
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> posée sur le groupe retire 4px à chaque avatar de la rangée.',
    },
    customOverflow: {
      title: 'Débordement personnalisé',
      text: "Le slot <code>#overflow</code> remplace le disque <code>+N</code> et reçoit <code>count</code>, le nombre d'avatars masqués.",
    },
    tooltips: {
      title: 'Avec des infobulles',
      text: "Chaque avatar peut être enveloppé dans une VTooltip. Le déclencheur doit être focalisable, d'où <code>clickable</code> ici.",
    },
  },

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
