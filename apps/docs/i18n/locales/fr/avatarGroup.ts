export default {
  title: "Groupe d'avatars",
  lead: "Des avatars empilés en rangée, chacun séparé du suivant par un anneau de la couleur de la page. Au-delà d'une limite de votre choix, les autres sont résumés en un seul disque.",

  examples: {
    overflow: {
      title: 'Débordement',
      text: "<code>max</code> est le nombre de disques dessinés avant que le reste soit résumé en un seul. Le compte vient des avatars que vous avez passés, si bien que rien n'a à lui dire combien il y en a, et le dernier disque porte le reste sous la forme <code>+N</code>. Sans lui, tous les avatars sont affichés. Toutes les démos de cette page posent sur une carte surélevée, d'où le <code>ringColor</code> que chacune passe : sur le fond d'une page, la valeur par défaut est déjà la bonne.",
    },
    size: {
      title: 'La taille sur le groupe',
      text: "Le groupe donne sa <code>size</code> à chaque avatar qu'il contient, disque de débordement compris, et le chevauchement suit : chaque disque mord sur le précédent d'une fraction de sa propre hauteur, si bien qu'une rangée change d'échelle sans aucun nombre à ajuster. Un avatar qui fixe sa propre taille la garde, et son chevauchement suit cette taille.",
    },
    compact: {
      title: 'Compact',
      text: 'Aux mêmes conditions que la taille : <code>compact</code> atteint chaque avatar de la rangée et retire 4px à chacun. La seconde rangée ci-dessous est la première avec la prop posée.',
    },
    customOverflow: {
      title: 'Débordement personnalisé',
      text: "Le slot <code>#overflow</code> remplace le disque <code>+N</code> et reçoit <code>count</code>, le nombre d'avatars masqués. C'est ce qui permet au disque de porter une couleur à vous, de devenir un bouton qui ouvre la liste complète, ou de dire autre chose qu'un nombre. Donnez-lui un <code>alt</code> dès qu'il devient interactif : <code>+2</code> seul ne dit rien à un lecteur d'écran.",
    },
    tooltips: {
      title: 'Avec des infobulles',
      text: "Une VTooltip peut envelopper chaque avatar, disque de débordement compris. Deux choses en découlent. Le déclencheur doit pouvoir prendre le focus, d'où les avatars <code>clickable</code> ici ; et l'enveloppe que l'infobulle insère entre le groupe et l'avatar ne change rien à la rangée, le chevauchement étant écrit contre les enfants directs du groupe, quels qu'ils soient.",
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
