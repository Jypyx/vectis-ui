export default {
  title: 'Carrousel',
  lead: '<code>VCarousel</code> affiche des diapositives dans une piste défilante avec contrôles, indicateurs et lecture automatique facultatifs.',
  examples: {
    itemsPerView: {
      title: 'Diapositives par vue',
      text: '<code>itemsPerView</code> définit le nombre maximal de diapositives visibles. <code>itemMinSize</code> réduit ce nombre si le conteneur rétrécit.',
    },
    peek: {
      title: 'Débord',
      text: '<code>peek</code> laisse une partie de la diapositive suivante visible, espacement compris.',
    },
    effects: {
      title: 'Effets',
      text: 'Choisissez un glissement, un fondu ou une mise à l’échelle. Le fondu exige une diapositive par vue sans aperçu ; sinon, le glissement est utilisé.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Les carrousels verticaux nécessitent une <code>height</code> explicite.',
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: 'Personnalisez les contrôles avec <code>prevIcon</code>, <code>nextIcon</code> et leurs noms accessibles.',
    },
    placements: {
      title: 'Placements',
      text: '<code>controls</code> et <code>indicators</code> acceptent chacun <code>inside</code>, <code>outside</code> ou <code>false</code>.',
    },
    jumps: {
      title: 'Sauts',
      text: 'Les déplacements de plusieurs pages sont directs par défaut. <code>noJump</code> fait défiler les diapositives intermédiaires.',
    },
    loop: {
      title: 'Boucle',
      text: '<code>loop</code> fait revenir la navigation de la dernière position à la première, et inversement.',
    },
    autoplay: {
      title: 'Défilement automatique',
      text: '<code>autoplay</code> définit un intervalle en millisecondes. Le survol et le focus le suspendent ; la réduction des mouvements le désactive. Ajoutez un bouton de pause qui règle l’intervalle sur 0.',
    },
  },
  api: {
    VCarousel: {
      props: {
        itemsPerView:
          'Nombre maximal de diapositives par vue. La largeur du conteneur et <code>itemMinSize</code> déterminent combien tiennent.',
        itemMinSize:
          'Taille minimale d’une diapositive. Les nombres utilisent des pixels ; les chaînes, des longueurs CSS.',
        peek: 'Partie visible de la diapositive suivante, espacement compris. Incompatible avec le fondu.',
        gap: 'Espacement entre les diapositives.',
        orientation: 'Défilement horizontal ou vertical.',
        effect:
          'Glissement, fondu ou mise à l’échelle. Le fondu utilise le glissement si la vue ne contient pas exactement une diapositive sans aperçu.',
        height: 'Hauteur de la zone visible. Requise pour le défilement vertical.',
        loop: 'Boucle entre les positions initiale et finale. Les contrôles restent désactivés s’il n’y a qu’une position.',
        noJump:
          'Fait défiler les diapositives intermédiaires lors d’un saut de plusieurs pages. Avec la réduction des mouvements, le saut reste instantané.',
        autoplay:
          'Intervalle de défilement en millisecondes ; 0 le désactive. Se suspend au survol/focus et respecte la réduction des mouvements. Fournissez un contrôle de pause, surtout en boucle.',
        controls:
          'Position des contrôles précédent/suivant : à l’intérieur, à l’extérieur ou masqués.',
        indicators: 'Position des indicateurs : à l’intérieur, à l’extérieur ou masqués.',
        controlsVisibility:
          'Toujours visibles ou visibles au survol/focus. Ils restent visibles au toucher.',
        prevIcon: 'Icône du contrôle précédent. Flèche adaptée à l’orientation par défaut.',
        nextIcon: 'Icône du contrôle suivant. Flèche adaptée à l’orientation par défaut.',
        prevLabel: 'Nom accessible du contrôle précédent. Utilise le dictionnaire par défaut.',
        nextLabel: 'Nom accessible du contrôle suivant. Utilise le dictionnaire par défaut.',
        label: 'Nom accessible du carrousel. Utilisez des noms distincts s’il y en a plusieurs.',
        vModel:
          'Position actuelle, à partir de 0. Désigne la première diapositive entièrement visible et est limitée aux positions accessibles.',
      },
      slots: {
        default: 'Diapositives. Conservez le même nombre au rendu serveur et client.',
        controls:
          'Remplace et positionne les contrôles. Reçoit <code>previous</code>, <code>next</code>, <code>atStart</code>, <code>atEnd</code>, <code>index</code>, <code>count</code>, <code>pageCount</code> et <code>orientation</code>.',
        indicators:
          'Remplace la barre d’indicateurs. Reçoit <code>index</code>, <code>count</code>, <code>pageCount</code>, <code>goTo</code> et <code>orientation</code>. Affichez un contrôle par page, plutôt que par diapositive.',
        indicator:
          'Contenu d’un bouton indicateur. Reçoit <code>index</code> et <code>active</code>.',
      },
    },
    VCarouselItem: {
      props: {
        index: 'Index attribué par le carrousel. Ne le définissez pas manuellement.',
      },
      slots: {
        default: 'Contenu de la diapositive.',
      },
    },
  },
}
