export default {
  title: "Champ d'heure",
  lead: "Un champ d'heure sous l'une de trois formes : saisi avec un masque, en lecture seule avec une horloge, ou une liste d'heures à intervalle fixe. La valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures.",

  examples: {
    labelAndHint: {
      title: 'Libellé, indication et icône',
      text: "Le champ est un <code>VInput</code> : <code>label</code> et <code>hint</code> s'y comportent exactement comme partout ailleurs. <code>pickerIcon</code> change le glyphe qui ouvre l'horloge, au bout du champ. Aucune icône n'est rendue quand il n'y a pas de panneau à ouvrir, ce qui est le cas par défaut d'un champ dans lequel on peut taper, et la forme liste ignore la prop : son chevron relève de la convention des listes déroulantes.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs, 32, 40 et 48 pixels, chacune avec sa variante <code>compact</code> plus courte de 4px. L'horloge garde ses propres mesures : un cadran est une surface et non un contrôle, donc les chiffres ne rapetissent pas avec le champ auquel il s'accroche, et une minute reste aussi facile à viser quelle que soit la hauteur du formulaire.",
    },
    modes: {
      title: 'Modes',
      text: "Trois formes du même champ, et une quatrième configuration à l'intérieur de la première. <code>input</code>, le mode par défaut, masque le champ pour qu'on n'y tape que des chiffres et place le deux-points dès que l'heure est complète ; l'horloge devient alors optionnelle par <code>showPicker</code>, un panneau à chaque focus n'étant que du bruit dans un formulaire dense. <code>readonly</code> fait de l'horloge la seule voie d'entrée, elle y est donc forcée. <code>list</code> abandonne l'horloge au profit d'une liste d'heures que l'on cherche en tapant, laquelle est une liste déroulante jusqu'à son chevron et sa croix.",
    },
    steps: {
      title: 'Pas',
      text: "Un seul nombre pour trois choses : <code>minuteStep</code> est ce que le cadran propose, ce dont les flèches avancent, et ce à quoi la liste est découpée. Il laisse le masque tranquille, taper étant justement la façon dont un lecteur échappe à un pas qui ne lui convient pas. C'est la première chose à régler sur une liste : une minute par défaut, cela fait 1440 lignes, contre 48 pour la demi-heure.",
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: 'Les quatre props du sélecteur, <code>min</code>, <code>max</code>, <code>allowedHours</code> et <code>allowedMinutes</code>, arrivent dans les trois modes sous trois réponses différentes, parce qu’un mode est une façon différente de demander. Le champ saisi valide ce qui a été tapé et passe invalide : c’est la validité propre du contrôle qui le porte, donc le champ rougit dès que le lecteur y a touché et un formulaire refuse de partir avec, là où avaler la saisie ne lui laisserait rien à corriger. La liste retire les lignes que l’on ne peut pas choisir, une liste se lisant avant qu’on y choisisse, et garde la ligne de la valeur en cours même quand les restrictions l’ont dépassée. Le sélecteur désactive ce qu’il exclut, et sa propre page explique comment une borne coupe une heure en deux au lieu de la fermer.',
    },
    clearable: {
      title: 'Effaçable',
      text: "La croix vide la valeur, et elle apparaît à gauche de l'icône d'horloge plutôt qu'à sa place : les deux n'échangent donc jamais leurs positions à mesure que le champ se remplit et se vide. Elle est optionnelle sur tous les champs de la bibliothèque, un seul comportement par défaut pour un seul mot. La forme liste tient sa propre croix de la liste déroulante sur laquelle elle est bâtie, formulation comprise.",
    },
    states: {
      title: 'États',
      text: "Un champ invalide sert à une règle que le navigateur ne sait pas vérifier seul, le masque refusant déjà tout ce qui n'est pas une heure. Un champ désactivé grise par les tokens de couleur et ne peut plus ouvrir son panneau, ce qui tient en un seul garde plutôt qu'un par gestionnaire : le même point de coupure couvre le clic, le focus, la flèche et l'icône.",
    },
    twelveHour: {
      title: 'Horloge de douze heures',
      text: "La valeur, elle, ne bouge pas : c'est une chaîne sur 24 heures quoi qu'il y ait à l'écran, si bien que rien en aval n'a besoin de savoir quelle horloge le lecteur a vue. Ce qui change, c'est l'endroit où se choisit la moitié de la journée, et chaque forme y répond à sa manière. Un champ que l'on tape y place un bouton, le masque n'ayant pas la place de dire AM ou PM. L'horloge porte sa propre paire à côté de ses deux grands chiffres. Une liste n'a besoin ni de l'un ni de l'autre, chaque ligne énonçant la sienne.",
    },
    localization: {
      title: 'Localisation',
      text: "L'étiquette de langue décide de l'horloge, du masque et de la façon dont une heure s'écrit, le tout dérivé plutôt que tabulé : en-US et en-GB partagent tous leurs mots et ne diffèrent que par les heures sur lesquelles ils comptent. <code>locale</code> l'emporte sur la locale globale et retombe sur elle quand on l'omet, et <code>format</code> passe au-dessus des deux pour le champ qui doit se lire d'une seule façon quelle que soit la langue.",
    },
    placement: {
      title: 'Positionnement',
      text: "L'endroit où le panneau s'ouvre par rapport au champ. L'ancrage est en CSS : ceci nomme donc une préférence et non une position, et un navigateur à court de place en dessous bascule le panneau au-dessus de lui-même. Seul l'axe de bloc est proposé, une horloge qui s'ouvre à côté d'un champ étant à la fois large et difficile à suivre.",
    },
  },

  api: {
    VTimeInput: {
      props: {
        format:
          "Si les heures sont montrées sur une horloge de 12 ou de 24 heures. Omise, la langue du lecteur décide, ce qui est presque toujours ce que l'on veut.",
        mode: "La forme que prend le champ : saisissable, en lecture seule où le sélecteur est la seule voie d'entrée et se trouve donc forcé, ou une LISTE d'heures à intervalle fixe, où un sélecteur n'aurait aucun sens.",
        showPicker:
          "Propose le sélecteur à côté d'un champ saisissable : une icône en fin de champ, et un panneau qu'elle ouvre. Elle est laissée indéfinie plutôt que mise à faux, ce qui distingue « non fournie » d'un refus explicite.",
        minuteStep:
          "L'intervalle entre deux heures qui peuvent être choisies. Il s'applique au sélecteur, aux flèches et aux lignes de la liste.",
        min: "L'heure la plus tôt que l'on puisse choisir, incluse, en chaîne canonique sur 24 heures. Le sélecteur désactive ce qu'elle exclut, la liste le retire, et une heure saisie en dehors rend le champ invalide.",
        max: "L'heure la plus tard que l'on puisse choisir, incluse, écrite comme min.",
        allowedHours:
          "Les heures que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles. L'heure passée à une règle est toujours celle sur 24 heures, quelle que soit l'horloge affichée.",
        allowedMinutes:
          "Les minutes que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles.",
        locale:
          "Une locale BCP 47, qui décide de l'horloge et de la façon dont une heure est écrite. Elle l'emporte sur la locale globale du design system et retombe dessus.",
        label: 'Le libellé au-dessus du champ.',
        hint: "Une ligne d'aide sous le champ.",
        placeholder: 'Ce que dit le champ quand il est vide.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact: 'Retire 4px à la hauteur.',
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        clearable: "Propose une croix qui vide la valeur, affichée avant l'icône de fin.",
        pickerIcon:
          "L'icône qui ouvre l'horloge, en fin de champ. Sans effet sur la forme liste, dont le chevron suit la convention de la liste déroulante. La croix d'effacement apparaît à sa gauche plutôt qu'à sa place.",
        placement: "Où le panneau s'ouvre par rapport au champ.",
        vModel:
          "L'heure, toujours en chaîne sur 24 heures quelle que soit l'horloge affichée : vous n'avez donc jamais à savoir laquelle la langue du lecteur utilise.",
      },
    },
  },
}
