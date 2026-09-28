export default {
  title: 'Avatar',
  lead: '<code>VAvatar</code> représente une personne ou une entité par une image, une icône ou des initiales.',
  examples: {
    image: {
      title: 'Avec une photo',
      text: '<code>src</code> affiche l’image. En cas d’échec de chargement, l’avatar utilise son icône ou ses initiales.',
    },
    icon: {
      title: 'Avec une icône',
      text: '<code>icon</code> remplace les initiales. Fournissez <code>name</code> ou <code>alt</code> pour le nom accessible.',
    },
    initials: {
      title: 'Initiales et couleur automatique',
      text: 'Sans image ni icône, <code>name</code> fournit les initiales et détermine la couleur de fond.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit le diamètre de l’avatar.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit le diamètre.',
    },
    color: {
      title: 'Couleur personnalisée',
      text: '<code>color</code> remplace le fond automatique. Vérifiez son contraste avec le contenu blanc.',
    },
    interactive: {
      title: 'Boutons et liens',
      text: '<code>clickable</code> crée un bouton ; <code>href</code> crée un lien et est prioritaire. <code>disabled</code> désactive le contrôle.',
    },
    tooltip: {
      title: 'Avec une infobulle',
      text: 'Pour <code>VTooltip</code>, rendez l’avatar accessible au focus avec <code>clickable</code> ou <code>href</code> et liez <code>triggerProps</code>.',
    },
  },
  api: {
    VAvatar: {
      props: {
        src: 'URL d’image. Utilise l’icône ou les initiales si le chargement échoue.',
        icon: 'Icône affichée sans image. Prioritaire sur les initiales.',
        name: 'Nom complet utilisé pour le nom accessible, les initiales et la couleur automatique.',
        alt: 'Nom accessible remplaçant <code>name</code>. L’attribut <code>aria-label</code> fourni est prioritaire.',
        color: 'Couleur CSS de fond personnalisée. Le contenu reste blanc.',
        size: 'Diamètre de l’avatar. Hérite de la taille du groupe ; sinon, <code>md</code> par défaut.',
        compact: 'Réduit le diamètre. S’applique aussi si le groupe est compact.',
        href: 'Destination du lien. Prioritaire sur <code>clickable</code> ; retirée si le contrôle est désactivé.',
        clickable: 'Affiche un bouton si <code>href</code> est absent.',
        disabled: 'Désactive les avatars interactifs et les retire de l’ordre de tabulation.',
      },
      slots: {
        default: 'Contenu remplaçant les initiales.',
      },
    },
  },
}
