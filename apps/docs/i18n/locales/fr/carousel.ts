export default {
  title: 'Carrousel',
  lead: "Des diapositives parcourues au doigt, au pavé tactile, à la barre de défilement ou au clavier. C'est un seul conteneur natif à accroche de défilement : rien n'est cloné, et le nombre de diapositives qui tiennent est décidé par le CSS sans un seul point de rupture.",

  examples: {
    itemsPerView: {
      title: 'Diapositives par vue',
      text: "<code>itemsPerView</code> indique combien de diapositives peuvent être visibles à la fois, et <code>itemMinSize</code> jusqu'où chacune peut rétrécir. Entre les deux, aucun point de rupture : une part égale de la largeur est prise tant qu'elle reste au-dessus du plancher, et dès qu'elle passerait en dessous, moins de diapositives tiennent et la piste défile simplement plus loin. Réduisez cette page et les trois ci-dessous deviennent deux, puis une.",
    },
    peek: {
      title: 'Débord',
      text: "<code>peek</code> laisse voir une bande de la diapositive suivante, le gabarit de la liste de produits : il dit qu'il y a une suite sans demander au lecteur de se fier aux points. La bande inclut l'écart qui la précède, si bien qu'une diapositive reste une part égale de ce qui reste. Deux conséquences en découlent. La dernière position est la fin de la piste plutôt que le bord d'une diapositive, et aucun point ne porte le nom de la dernière, celle-ci ne pouvant jamais être en tête.",
    },
    effects: {
      title: 'Effets',
      text: "La façon dont une diapositive cède la place à la suivante. Les effets sont pilotés par le défilement lui-même : ils suivent donc le doigt et s'inversent avec lui au lieu de jouer une animation figée. <code>slide</code> est la valeur par défaut et n'anime rien ; <code>fade</code> fait fondre chaque diapositive sur place, ce qui exige une diapositive à la fois et aucun débord ; <code>scale</code> repousse les voisines sans les assombrir. Un lecteur ayant demandé moins de mouvement n'en reçoit aucun.",
    },
    orientation: {
      title: 'Orientation',
      text: "Passez <code>orientation</code> à <code>vertical</code> et tout le composant pivote : la molette et les flèches suivent l'axe de bloc, les boutons prennent les flèches haut et bas, et les points placés après les diapositives passent sur le côté. Donnez aussi une <code>height</code>. Une diapositive dimensionnée en part de la hauteur a besoin d'une hauteur dont prendre une part, et sans elle chacune s'effondre sur son propre contenu.",
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: "<code>prevIcon</code> et <code>nextIcon</code> acceptent un <code>IconSource</code>, comme toutes les props d'icône de la bibliothèque : une des icônes fournies, un nom transmis au résolveur installé par votre application, des données de tracé SVG, un composant ou une image. Les valeurs par défaut suivent l'orientation, donc une paire à vous doit le faire aussi. Les mots que ces boutons annoncent viennent de <code>prevLabel</code> et <code>nextLabel</code>, qui retombent sur le dictionnaire.",
    },
    placements: {
      title: 'Placements',
      text: 'Les flèches et les points se placent indépendamment. <code>inside</code> les pose par-dessus les diapositives, <code>outside</code> les met à côté, et <code>false</code> les retire. Placées à côté, les flèches voient leur place réservée en rembourrage sur le composant : son encombrement est inchangé et ce sont les diapositives qui rétrécissent. Dans les deux cas elles sont centrées sur les seules diapositives, jamais sur les diapositives plus la barre de points.',
    },
    jumps: {
      title: 'Sauts',
      text: "Cliquez sur le dernier point des deux carrousels ci-dessous. Le premier va directement à destination et joue l'effet une fois, sur la diapositive qui arrive ; le second conserve tout le trajet, si bien que les quatre diapositives intermédiaires traversent la vue en jouant chacune sa transition au passage. Aller directement est le comportement par défaut, et <code>noJump</code> est ce qui rétablit le trajet. Il couvre tous les chemins : les points, les touches Origine et Fin, et un carrousel en boucle qui revient au début.",
    },
    loop: {
      title: 'Boucle',
      text: "Avec <code>loop</code>, la dernière position ramène à la première et la première à la dernière : aucun des deux boutons n'est jamais désactivé. Rien n'est cloné pour cela, la vraie piste revient au début. Ce qui boucle est ce qui avance pas à pas, à savoir les deux boutons, les flèches du clavier et le défilement automatique. Un point nomme une position et y va toujours directement, et Fin sur la dernière page y reste.",
    },
    autoplay: {
      title: 'Défilement automatique',
      text: "<code>autoplay</code> est un intervalle en millisecondes, et zéro le désactive. Il s'arrête à la dernière page sauf si le carrousel boucle, se suspend tant que le pointeur repose sur le carrousel ou que le focus clavier est à l'intérieur, et ne tourne jamais pour un lecteur ayant demandé moins de mouvement. Le composant ne rend aucun bouton de pause : la prop est réactive, donc la lier à zéro annule le minuteur sur-le-champ. Ajoutez-en un, comme le fait l'exemple. Le survol et le focus ne laissent aucun moyen d'arrêter le mouvement à un utilisateur tactile.",
    },
  },

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
        loop: "Si le carrousel revient au début : après la dernière position il retourne à la première, et avant la première il va à la dernière. Rien n'est cloné pour cela : la vraie piste revient au début, d'un coup, en jouant la transition à l'arrivée plutôt qu'en passant devant chaque diapositive intermédiaire. Sans effet là où il n'y a qu'une seule position de repos, et les boutons y restent désactivés plutôt que de devenir deux contrôles qui ne font rien.",
        noJump:
          "Si un déplacement de plus d'une page conserve tout le défilement au lieu d'aller directement à destination. Désactivé par défaut : un point situé cinq pages plus loin arrive d'un coup et joue la transition une fois, à l'arrivée. Activez-le quand le trajet est le sujet, sur une poignée de diapositives où voir la piste défiler dit quelque chose de la distance parcourue. Il couvre tous les chemins, les points, les touches Origine et Fin et un carrousel en boucle qui revient au début, et il ne change rien pour un lecteur ayant demandé moins de mouvement, cette préférence rendant déjà tout défilement instantané.",
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
