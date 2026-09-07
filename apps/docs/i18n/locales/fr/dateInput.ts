export default {
  title: 'Champ de date',
  lead: "Un champ de texte saisissable, avec un VDatePicker dans un panneau à côté. Le masque suit la langue : l'ordre des champs, le séparateur et le gabarit sont tous dérivés de la locale.",

  examples: {
    labelAndHint: {
      title: 'Libellé, aide et icône',
      text: "Le champ est un <code>VInput</code>, donc <code>label</code> et <code>hint</code> se comportent exactement comme partout ailleurs. <code>pickerIcon</code> change le glyphe qui ouvre le calendrier, à la fin du champ. Aucune icône n'est rendue quand il n'y a pas de panneau à ouvrir, ce qui est le cas par défaut d'un champ où l'on peut taper. <code>iconStart</code> place une icône au début du champ, décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> en fasse un bouton, lequel réclame alors <code>iconStartLabel</code>. À l'autre bout, <code>loading</code> affiche une roue à la place de l'icône du calendrier pendant qu'une donnée se charge et ne change rien d'autre : le champ reste saisissable et le panneau s'ouvre toujours. <code>iconEndLabel</code>, <code>clearLabel</code> et <code>loadingLabel</code> renomment le bouton, la croix et la roue quand la formulation du dictionnaire ne convient pas.",
    },
    sizes: {
      title: 'Tailles',
      text: 'Trois hauteurs, 32, 40 et 48 pixels, chacune avec sa paire <code>compact</code> plus courte de 4px. Le panneau garde ses propres mesures : un calendrier est une surface et non un contrôle, donc la grille ne rétrécit pas avec le champ auquel elle est accrochée, et une date reste aussi facile à viser quelle que soit la hauteur sur laquelle le formulaire est bâti.',
    },
    modes: {
      title: 'Modes',
      text: 'Deux modes, et une troisième configuration entre les deux. <code>input</code>, la valeur par défaut, masque le champ pour que seuls des chiffres soient tapés et que les séparateurs se placent à mesure que chaque partie se remplit ; le calendrier y est alors facultatif, via <code>showPicker</code>, un panneau à chaque focus étant du bruit dans un formulaire dense. <code>picker</code> fait du calendrier la seule entrée possible. La saisie est réservée à une date unique : une période ou une liste retombe sur <code>picker</code>, faute de manière sensée de les taper.',
    },
    range: {
      title: 'Période',
      text: "La valeur devient un début et une fin, et le calendrier prend le premier clic pour l'un et le second pour l'autre, en prévisualisant l'intervalle sous le pointeur entre les deux. Le champ écrit les deux dates via <code>Intl</code>, qui met en facteur ce qu'elles ont en commun au lieu de le répéter.",
    },
    multiple: {
      title: 'Dates multiples',
      text: "La valeur devient une liste, et un jour déjà présent en ressort d'un second clic. Le tableau n'est jamais modifié sur place, donc un observateur posé sur le modèle se déclenche comme il doit. Le champ énumère ce qui a été choisi, ce qui mérite réflexion au-delà d'une poignée de dates : c'est une ligne de texte et non un jeu de puces.",
    },
    presets: {
      title: 'Raccourcis',
      text: "Le slot <code>#footer</code> est une bande au pied du panneau, pour des actions ou pour les dates qu'un lecteur choisit le plus souvent. Il reçoit <code>close</code>, ce qui permet à un bouton de poser la valeur et de refermer le panneau d'un seul geste. L'horloge est lue dans le gestionnaire et jamais au setup : le serveur ne peut pas savoir quel jour il est là où se trouve le lecteur, et une valeur prise là ne survivrait pas à l'hydratation.",
    },
    bounds: {
      title: 'Bornes et jours fermés',
      text: "<code>min</code> et <code>max</code> bornent à la fois le choix et la navigation : les flèches s'arrêtent au lieu de partir vers des mois qui ne contiennent rien de choisissable. <code>disabledDates</code> ferme des jours isolés, sous forme de liste ou de fonction répondant pour une date à la fois, ce qui fait d'une règle comme « pas de week-end » une ligne plutôt qu'une énumération. Un jour fermé est barré et reste atteignable au clavier : un lecteur qui parcourt la grille aux flèches n'est jamais sauté en silence.",
    },
    events: {
      title: 'Pastilles',
      text: "Jusqu'à trois pastilles sous un jour, pour dire qu'il s'y passe quelque chose. La couleur est n'importe quelle couleur CSS, donc un jeton la garde en phase avec les deux thèmes, et une pastille sans couleur prend l'accent. Le <code>label</code> est ce que lisent les technologies d'assistance, la pastille elle-même ne portant rien d'audible.",
    },
    customDay: {
      title: 'Cellules de jour personnalisées',
      text: "Le slot <code>#day</code> remplace le numéro à l'intérieur d'un jour, ce qu'il faut à un calendrier de réservation affichant un prix par nuit. Il reçoit la date ISO et tout ce que la cellule sait d'elle-même : si le jour appartient au mois affiché, s'il peut être choisi, s'il est sélectionné, s'il est aujourd'hui, ou s'il est dans une période en cours de tracé. La cellule elle-même reste celle du composant : sa taille, sa forme, son fond de sélection et son anneau de focus. Les pastilles d'évènement sont dessinées hors du slot, donc les deux se combinent. Ce que le slot rend doit être dérivé de la date et non tiré au hasard, sans quoi le serveur et le navigateur produisent deux calendriers différents.",
    },
    clearable: {
      title: 'Effacement',
      text: "La croix vide la valeur, et elle apparaît à gauche de l'icône du calendrier plutôt qu'à sa place : les deux n'échangent donc jamais leurs positions au gré du remplissage du champ. Elle est facultative sur tous les champs de la bibliothèque, une seule valeur par défaut pour un seul mot.",
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: 'Un mois commence rarement sur la première colonne, et les coins de la grille sont vides par défaut. <code>showAdjacentDays</code> les remplit avec les mois voisins, grisés et inertes, ce qui fait que les semaines se lisent comme des semaines. <code>selectAdjacentDays</code> rend ces jours choisissables en plus, et en choisir un déplace le calendrier sur son mois.',
    },
    states: {
      title: 'États',
      text: "Un champ invalide sert à une règle que le navigateur ne sait pas vérifier lui-même, le masque refusant déjà tout ce qui n'est pas une date. Un champ désactivé grise par les jetons de couleur et ne peut plus ouvrir son panneau, ce qui tient en un seul garde plutôt qu'un par gestionnaire : le même point de coupure couvre le clic, le focus, la flèche et l'icône. <code>readonly</code> se place entre les deux : la valeur est montrée mais gelée, donc rien ne se tape, il n'y a pas de calendrier et la croix de vidage disparaît avec lui, tout comme les attributs qui annonçaient un panneau. Le champ garde son contraste normal, prend le focus et reste copiable, ce qui le distingue de <code>disabled</code>. Il répond à une autre question que <code>mode</code>, qui dit comment se remplit un champ que l'on peut changer.",
    },
    localization: {
      title: 'Localisation',
      text: "L'étiquette de langue décide de l'ordre dans lequel le champ se tape, du séparateur qu'il place, des noms de mois et de jours et du premier jour de la semaine, le tout dérivé et non tabulé. <code>locale</code> prend le pas sur la locale globale et retombe dessus si on l'omet. <code>displayFormat</code> est un jeu d'options <code>Intl</code> pour écrire la date, et il s'applique là où rien n'est tapé : le mode <code>picker</code>, et les sélections de période et de liste qui y retombent.",
    },
    placement: {
      title: 'Placement',
      text: "Où le panneau s'ouvre par rapport au champ. Il est ancré en CSS : cette valeur nomme donc une préférence et non une position, puisqu'un navigateur à court de place en dessous bascule le calendrier au-dessus de lui-même. Seul l'axe de bloc est proposé, un calendrier s'ouvrant à côté d'un champ étant à la fois large et pénible à suivre.",
    },
  },

  api: {
    VDateInput: {
      props: {
        selection:
          'Ce qui est choisi : une date, une période entre deux, ou plusieurs dates séparées.',
        locale:
          "Une locale BCP 47, qui décide des noms de mois et de jours, du premier jour de la semaine et de l'ordre dans lequel le champ se saisit. Elle l'emporte sur la locale globale du design system et retombe dessus.",
        firstDayOfWeek:
          'Force le jour où commencent les semaines, de 0 pour dimanche à 6 pour samedi.',
        min: 'La première date qui peut être choisie, en chaîne ISO.',
        max: 'La dernière date qui peut être choisie, en chaîne ISO.',
        disabledDates: 'Les dates qui ne peuvent pas être choisies, en liste ou en fonction.',
        showAdjacentDays: 'Remplit les coins de la grille avec les jours grisés des mois voisins.',
        selectAdjacentDays: 'Permet de cliquer ces jours voisins, ce qui implique de les afficher.',
        events: 'Les événements à marquer sous les jours concernés.',
        mode: "Si le champ peut être SAISI, dans la forme numérique de la langue du lecteur, ou s'il se remplit depuis le seul calendrier, ce qui est <code>picker</code>. La saisie est réservée au choix d'une date UNIQUE : une période ou une liste retombe sur <code>picker</code>, faute de façon sensée de saisir l'une ou l'autre. C'est une autre question que <code>readonly</code>, qui gèle le champ par toutes les voies à la fois.",
        showPicker:
          "Propose le sélecteur de date à côté d'un champ saisissable : une icône en fin de champ, et un panneau qui s'ouvre au focus. Cela ne signifie rien en mode <code>picker</code>, où le calendrier est déjà la seule façon de choisir.",
        label: 'Le libellé au-dessus du champ.',
        hint: "Une ligne d'aide sous le champ.",
        placeholder: 'Ce que dit le champ quand il est vide.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact: 'Retire 4px à la hauteur.',
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        readonly:
          "Montre la date sans permettre de la changer : rien ne se tape, il n'y a ni calendrier ni croix de vidage, et les attributs qui annonçaient un panneau disparaissent avec eux. Le champ garde le focus et reste copiable, ce qui le distingue de <code>disabled</code>.",
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        iconStart:
          "Une icône dans le champ, au début. Décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> en fasse un bouton.",
        iconStartLabel: "Ce que fait l'icône de début, en mots, une fois cliquable.",
        iconEndLabel:
          "Ce que fait l'icône de fin, en mots. Elle nomme le bouton qui ouvre le calendrier, et sa valeur par défaut vient du dictionnaire du design system.",
        loading:
          "Affiche une roue à la place de l'icône du calendrier. Elle dit que quelque chose se charge et ne change rien d'autre : le champ reste saisissable et le panneau s'ouvre toujours.",
        loadingLabel:
          "Ce que les lecteurs d'écran annoncent pendant que la roue tourne. Sa valeur par défaut vient du dictionnaire du design system.",
        clearable: "Propose une croix qui vide la valeur, affichée avant l'icône de fin.",
        clearLabel:
          'Ce que fait cette croix, en mots. Sa valeur par défaut vient du dictionnaire du design system.',
        pickerIcon:
          "L'icône qui ouvre le sélecteur de date, en fin de champ. La croix d'effacement apparaît à sa gauche plutôt qu'à sa place, et aucune icône n'est rendue du tout quand il n'y a pas de panneau à ouvrir.",
        displayFormat:
          "Comment la date est ÉCRITE dans le champ. Sans effet sur un champ en cours de saisie, qui montre nécessairement la forme numérique que l'on tape : cette prop concerne donc le mode <code>picker</code>, ainsi que les sélections de période et de liste.",
        placement: "Où le panneau s'ouvre par rapport au champ.",
        vModel:
          "La ou les dates choisies, dans la forme que <code>selection</code> réclame. Pendant la saisie, la valeur n'est écrite qu'une fois que ce qui a été entré est une date complète et acceptable ; une entrée inachevée ou refusée la laisse intacte et est annulée quand le lecteur quitte le champ.",
      },
      slots: {
        day: 'Ce que montre une cellule de jour, transmis tel quel au calendrier.',
        footer:
          "La bande au pied du panneau : des actions, ou des dates prédéfinies comme aujourd'hui. Elle reçoit <code>close</code>, ce qui permet à l'un de ces boutons de refermer le panneau.",
      },
    },
  },
}
