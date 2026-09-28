export default {
  title: 'Badge',
  lead: '<code>VBadge</code> affiche un compteur, une icône ou un point de statut, seul ou associé à un autre élément.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> choisit <code>solid</code> ou <code>soft</code>. Les points utilisent toujours un fond plein.',
    },
    tones: {
      title: 'Tons',
      text: '<code>tone</code> définit la couleur sémantique.',
    },
    colors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton par une couleur CSS.',
    },
    counters: {
      title: 'Compteurs',
      text: 'Les valeurs supérieures à 99 apparaissent sous la forme <code>99+</code>.',
    },
    icon: {
      title: 'Avec une icône',
      text: '<code>icon</code> est prioritaire sur <code>count</code>.',
    },
    dot: {
      title: 'Point',
      text: '<code>dot</code> affiche un point de statut et ignore le compteur et l’icône.',
    },
    inline: {
      title: 'En ligne',
      text: 'Le slot par défaut fournit la cible. Incluez l’information du badge dans le nom accessible de cette cible.',
    },
    overlay: {
      title: 'En incrustation',
      text: '<code>overlay</code> place le badge dans un coin de la cible.',
    },
    overlayPosition: {
      title: "Position de l'incrustation",
      text: '<code>overlayPosition</code> choisit le coin supérieur ou inférieur. Le côté horizontal suit le sens de lecture.',
    },
    bordered: {
      title: 'Avec anneau',
      text: '<code>bordered</code> ajoute un contour. Adaptez <code>ringColor</code> à la surface de la cible.',
    },
  },
  api: {
    VBadge: {
      props: {
        variant: 'Style visuel.',
        tone: 'Ton de couleur.',
        color:
          'Couleur CSS personnalisée. Pour un badge plein, vérifiez le contraste dans les navigateurs sans prise en charge de <code>contrast-color()</code>.',
        count:
          'Compteur à afficher. Les valeurs supérieures à 99 apparaissent sous la forme <code>99+</code>.',
        icon: 'Icône remplaçant le compteur.',
        dot: 'Affiche un point de statut sans contenu.',
        overlay:
          'Place le badge dans un coin de la cible. Nécessite une cible dans le slot par défaut.',
        overlayPosition: 'Coin supérieur ou inférieur. Le côté horizontal suit le sens de lecture.',
        bordered: 'Ajoute un contour autour du badge.',
        ringColor: 'Couleur du contour. Couleur de fond de page par défaut.',
      },
      slots: {
        default:
          'Élément cible. Les badges associés sont masqués aux technologies d’assistance ; incluez leur information dans le nom accessible de la cible.',
      },
    },
  },
}
