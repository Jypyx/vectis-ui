export default {
  title: 'Menu contextuel',
  lead: '<code>VContextMenu</code> ouvre un menu au pointeur sur un clic droit, un appui long sous Android, la touche Menu ou Maj+F10. Son slot <code>menu</code> reçoit <code>target</code>, l’élément sur lequel le menu a été ouvert : un seul menu sert toute une liste.',
  examples: {
    submenus: {
      title: 'Sous-menus',
      text: 'Les commandes sont des items de <code>VMenu</code> : groupes, séparateurs, sous-menus, <code>size</code> et <code>compact</code> fonctionnent de la même façon. Près d’un bord de l’écran, le menu se retourne pour rester visible.',
    },
    nativeMenu: {
      title: 'Le menu du navigateur',
      text: 'Maj avec un clic droit affiche le menu du navigateur. <code>disabled</code> lui rend toute la zone.',
    },
    open: {
      title: 'Savoir s’il est ouvert',
      text: '<code>v-model:open</code> suit chaque ouverture et fermeture. Ouvert par le code, le menu apparaît sous l’élément focalisé de la zone, ou sous la zone elle-même. Rendez aussi chaque commande accessible autrement, par un bouton visible par exemple : Safari sur iOS n’a pas de menu à l’appui long, et rien ne signale au lecteur que le menu existe.',
    },
  },
  api: {
    VContextMenu: {
      props: {
        as: 'Élément qui enveloppe la zone.',
        size: 'Taille des lignes, héritée par les sous-menus.',
        compact: 'Réduit la hauteur des lignes, sous-menus compris.',
        width:
          'Largeur du panneau. Un nombre est en pixels ; une chaîne, une longueur ou un mot-clé CSS.',
        disabled: 'Laisse la zone au menu du navigateur.',
        vModelOpen:
          'État d’ouverture, synchronisé avec les clics extérieurs, Échap et le choix d’une commande.',
      },
      slots: {
        default: 'Contenu de la zone.',
        menu: 'Enfants <code>VMenuItem</code>, <code>VMenuGroup</code> et <code>VMenuSeparator</code>. Reçoit <code>target</code>.',
      },
    },
  },
}
