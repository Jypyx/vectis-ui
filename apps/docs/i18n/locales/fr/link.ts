export default {
  title: 'Lien',
  lead: '<code>VLink</code> est un lien natif coloré selon un ton. Il prend la taille et la graisse du texte qui l’entoure, dans une phrase, un titre ou une légende.',
  examples: {
    tones: {
      title: 'Tons',
      text: '<code>tone</code> colore le lien. <code>neutral</code> prend la couleur du texte.',
    },
    inheritedColour: {
      title: 'Couleur héritée',
      text: '<code>tone="inherit"</code> prend la couleur du texte qui entoure le lien, comme une ligne de pied de page atténuée, et passe à la couleur d’accent au survol. Gardez le soulignement : c’est alors lui qui distingue le lien.',
    },
    underline: {
      title: 'Soulignement',
      text: 'Les liens sont toujours soulignés par défaut, pour que la couleur seule ne soit pas le seul moyen de les repérer dans un texte. <code>hover</code> et <code>none</code> conviennent aux menus, pieds de page et listes de liens.',
    },
    external: {
      title: 'Liens externes',
      text: '<code>external</code> ouvre un nouvel onglet avec <code>rel="noopener noreferrer"</code>, ajoute une icône et le signale aux lecteurs d’écran. L’icône est l’icône intégrée <code>open_in_new</code>, qu’un résolveur d’icônes peut remplacer partout. <code>externalIcon</code> la remplace pour un lien et <code>hideExternalIcon</code> la retire.',
    },
    disabled: {
      title: 'Désactivé',
      text: 'Un lien désactivé perd son adresse et ses écouteurs de clic, et porte <code>aria-disabled</code>.',
    },
    router: {
      title: 'Routeur',
      text: 'VLink rend toujours un vrai <code>&lt;a&gt;</code>. Avec Nuxt ou Vue Router, placez-le dans le lien du routeur en mode <code>custom</code> et transmettez <code>href</code> et <code>navigate</code>. Un clic avec une touche de modification ouvre toujours un nouvel onglet.',
    },
  },
  api: {
    VLink: {
      props: {
        href: 'Destination du lien.',
        tone: 'Couleur du lien. <code>inherit</code> prend la couleur du parent et passe à l’accent au survol.',
        underline: 'Quand le lien est souligné. Gardez <code>always</code> dans un texte courant.',
        external:
          'Ouvre un nouvel onglet avec <code>rel="noopener noreferrer"</code>, ajoute une icône et le signale aux lecteurs d’écran.',
        externalIcon: 'Icône d’un lien externe.',
        hideExternalIcon:
          'Retire l’icône d’un lien externe. Les lecteurs d’écran annoncent toujours le nouvel onglet.',
        disabled: 'Retire l’adresse et marque le lien <code>aria-disabled</code>.',
      },
      slots: {
        default: 'Texte du lien.',
      },
    },
  },
}
