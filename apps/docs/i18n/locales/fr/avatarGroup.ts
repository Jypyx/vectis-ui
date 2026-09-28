export default {
  title: "Groupe d'avatars",
  lead: '<code>VAvatarGroup</code> superpose les avatars sur une ligne et peut regrouper les avatars excédentaires dans un compteur.',
  examples: {
    overflow: {
      title: 'Débordement',
      text: '<code>max</code> limite les avatars visibles. Le nombre restant apparaît sous la forme <code>+N</code>.',
    },
    size: {
      title: 'La taille sur le groupe',
      text: 'La prop <code>size</code> du groupe s’applique sauf si un avatar définit sa propre taille.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit le diamètre de tous les avatars.',
    },
    customOverflow: {
      title: 'Débordement personnalisé',
      text: 'Le slot <code>overflow</code> reçoit le <code>count</code> des avatars masqués.',
    },
    tooltips: {
      title: 'Avec des infobulles',
      text: 'Rendez les avatars avec infobulle accessibles au focus avec <code>clickable</code> ou un lien.',
    },
  },
  api: {
    VAvatarGroup: {
      props: {
        max: 'Nombre maximal d’avatars visibles avant le compteur. Absent ou égal à 0, affiche tous les avatars.',
        size: 'Taille des avatars par défaut ; chaque avatar peut la remplacer.',
        compact: 'Réduit le diamètre de tous les avatars ; les enfants ne peuvent pas l’annuler.',
        ringColor: 'Couleur de séparation entre avatars. Couleur de fond de page par défaut.',
        label:
          'Nom accessible du groupe. Les attributs <code>aria-label</code> ou <code>aria-labelledby</code> fournis sont prioritaires.',
      },
      slots: {
        default: 'Avatars à regrouper.',
        overflow: 'Contenu remplaçant le compteur. Reçoit <code>count</code>.',
      },
    },
  },
}
