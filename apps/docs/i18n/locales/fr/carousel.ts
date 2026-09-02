export default {
  title: 'Carrousel',
  lead: "Des diapositives parcourues au doigt, au pavé tactile, à la barre de défilement ou au clavier. C'est un seul conteneur natif à accroche de défilement : rien n'est cloné, et le nombre de diapositives qui tiennent est décidé par le CSS sans un seul point de rupture.",

  api: {
    VCarousel: {
      props: {
        itemsPerView:
          "Combien de diapositives peuvent être visibles à la fois. C'est un MAXIMUM et non une cible : le plancher ci-dessous décide combien tiennent réellement, ce qui rend l'ensemble adaptatif sans point de rupture.",
        itemMinSize:
          "Jusqu'où une diapositive peut rétrécir. Dès qu'une part égale passerait sous cette valeur, moins de diapositives tiennent et le carrousel défile plus loin à la place. Un nombre est lu en pixels ; tout le reste est utilisé tel quel, donc <code>'20vw'</code> fonctionne.",
        peek: "Quelle part de la diapositive SUIVANTE reste visible, pour indiquer qu'il y a une suite. Elle inclut l'écart qui la précède. Elle ne peut pas se combiner à l'effet de fondu, qui suppose qu'une diapositive remplit exactement la vue.",
        gap: "L'espace entre deux diapositives.",
        orientation: 'Si le carrousel défile en travers de la page ou de haut en bas.',
        effect:
          "Comment une diapositive cède la place à la suivante, piloté par le défilement lui-même. Le glissement ne signifie aucune animation. Le fondu exige UNE diapositive à la fois et aucun débord, puisqu'il maintient chaque diapositive en place pendant que le défilement passe dessous ; demandé autrement, il retombe sur le glissement plutôt que de se dégrader.",
        height:
          "La hauteur de la zone visible. DONNEZ-EN UNE quand le carrousel défile vers le bas : une diapositive dimensionnée en part de la hauteur a besoin d'une hauteur DONT prendre une part, et sans elle chaque diapositive s'effondre sur son propre contenu. En défilement horizontal, la hauteur vient des diapositives elles-mêmes.",
        loop: "Si le carrousel revient au début : après la dernière position il retourne à la première, et avant la première il va à la dernière. Rien n'est cloné pour cela, donc le lecteur voit la vraie piste rembobiner. Sans effet là où il n'y a qu'une seule position de repos, et les boutons y restent désactivés plutôt que de devenir deux contrôles qui ne font rien.",
        autoplay:
          "Combien de temps chaque diapositive est montrée avant la suivante, en millisecondes ; zéro signifie qu'il n'avance pas de lui-même. Il s'arrête à la dernière page sauf si le carrousel boucle, se met en pause tant que le pointeur y repose ou que le focus CLAVIER est à l'intérieur, et ne tourne jamais pour un lecteur ayant demandé moins de mouvement. Aucun bouton de pause n'est rendu : cette prop est réactive, donc la lier à zéro est un contrôle d'arrêt d'une ligne de votre côté, et il vaut la peine de l'ajouter, puisque le survol et le focus ne laissent rien à un utilisateur tactile. La boucle rend cette liaison nécessaire plutôt que recommandée, le mouvement ne s'arrêtant plus de lui-même.",
        controls:
          "Où vont les boutons précédent et suivant : par-dessus les diapositives, à côté, ou nulle part. Placés à côté, leur place est réservée en rembourrage, si bien que l'encombrement du composant est inchangé et que ce sont les diapositives qui rétrécissent. Dans les deux cas ils sont centrés sur les DIAPOSITIVES et jamais sur les diapositives plus les points.",
        indicators:
          'Où vont les points de position : par-dessus les diapositives, après elles, ou nulle part. Après elles signifie en dessous quand le carrousel défile horizontalement, et à côté quand il défile verticalement.',
        controlsVisibility:
          "Si ces boutons sont toujours visibles, ou n'apparaissent que quand le pointeur est sur le carrousel ou que le focus clavier est à l'intérieur. Là où il n'y a pas de pointeur pour survoler, ils restent visibles quoi que dise cette prop. Les points ne sont jamais masqués.",
        prevIcon: "L'icône du bouton précédent. Elle suit l'orientation par défaut.",
        nextIcon: "L'icône du bouton suivant. Elle suit l'orientation par défaut.",
        prevLabel: 'Ce que fait le bouton précédent, en mots. Il retombe sur le dictionnaire.',
        nextLabel: 'Ce que fait le bouton suivant, en mots. Il retombe sur le dictionnaire.',
        label:
          "Ce que les lecteurs d'écran annoncent pour le carrousel dans son ensemble. Donnez-en un DISTINCT à chaque carrousel d'une page : c'est un point de repère, et deux points de repère portant le même nom sont indiscernables pour qui navigue entre eux.",
        vModel:
          "Quelle diapositive est courante : la première entièrement visible quand plusieurs tiennent à la fois, ce qui est aussi la position où le carrousel s'est arrêté.",
      },
      slots: {
        default:
          'Les diapositives. Leur nombre est lu depuis ce que ce slot REND, donc un <code>v-for</code> convient parfaitement, mais le slot ne doit pas dépendre de quelque chose de vrai seulement dans un navigateur, sans quoi le serveur et le client compteraient différemment.',
        controls:
          "Remplace entièrement les boutons précédent et suivant, leur placement compris : un contenu personnalisé se positionne donc lui-même, et le réglage de visibilité ne s'y applique plus.",
        indicators:
          'Remplace toute la barre de points. Rendez un contrôle par POSITION et non par diapositive : une position au-delà de la dernière ne peut pas être atteinte, donc une barre bâtie sur le nombre de diapositives propose des points qui ne mènent nulle part. Le nombre de diapositives est passé aussi, pour une formulation comme « 3 sur 8 ».',
        indicator:
          "Remplace ce qui est dessiné À L'INTÉRIEUR d'un point. Le bouton lui-même, et tout ce qui le fait annoncer et se comporter correctement, reste celui du design system.",
      },
    },
    VCarouselItem: {
      props: {
        index:
          "Quelle diapositive est celle-ci parmi ses voisines. Le carrousel l'injecte en les rendant. Ne la passez JAMAIS à la main : c'est ce qui rend le « 3 sur 8 » annoncé par un lecteur d'écran identique sur le serveur et dans le navigateur.",
      },
      slots: {
        default: 'Le contenu de la diapositive : une image, une carte, du texte libre.',
      },
    },
  },
}
