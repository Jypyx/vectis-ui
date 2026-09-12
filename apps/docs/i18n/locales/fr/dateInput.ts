export default {
  title: 'Champ de date',
  lead: "Un champ de texte saisissable, avec un VDatePicker dans un panneau à côté. Le masque suit la langue : l'ordre des champs, le séparateur et le gabarit sont tous dérivés de la locale.",

  examples: {
    labelAndHint: {
      title: 'Libellé, aide et icône',
      text: "<code>label</code> et <code>hint</code> se comportent comme sur n'importe quel champ. <code>pickerIcon</code> change le glyphe qui ouvre le calendrier, <code>iconStart</code> pose une icône au début du champ, et <code>loading</code> affiche un indicateur à la place de l'icône de calendrier. <code>pickerIconLabel</code>, <code>clearLabel</code>, <code>loadingLabel</code> et <code>iconStartLabel</code> renomment ce que chacun annonce.",
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la hauteur du champ à 32, 40 ou 48 pixels, et <code>compact</code> lui retire 4px. Le panneau garde ses propres mesures.',
    },
    modes: {
      title: 'Modes',
      text: "<code>mode</code> choisit la façon de renseigner la valeur : <code>input</code> masque le champ pour n'y saisir que des chiffres, le calendrier devenant alors optionnel via <code>showPicker</code> ; <code>picker</code> fait du calendrier la seule entrée. La saisie est réservée à une date unique.",
    },
    range: {
      title: 'Période',
      text: "<code>selection</code> à <code>range</code> fait de la valeur un début et une fin, le calendrier prenant le premier clic pour l'un et le second pour l'autre.",
    },
    multiple: {
      title: 'Dates multiples',
      text: '<code>selection</code> à <code>multiple</code> fait de la valeur une liste, un jour déjà présent en étant retiré par un nouveau clic.',
    },
    presets: {
      title: 'Raccourcis',
      text: "Le slot <code>#footer</code> est une bande au pied du panneau, pour des actions ou pour les dates les plus demandées. Il reçoit <code>close</code>, de sorte qu'un bouton peut poser la valeur et fermer le panneau d'un coup.",
    },
    bounds: {
      title: 'Bornes et jours fermés',
      text: '<code>min</code> et <code>max</code> bornent à la fois le choix et la navigation. <code>disabledDates</code> ferme des jours isolés, sous forme de liste ou de fonction répondant pour une date à la fois.',
    },
    events: {
      title: 'Pastilles',
      text: "<code>events</code> dessine jusqu'à trois points sous un jour. Chacun accepte n'importe quelle couleur CSS et un <code>label</code>, qui est ce que lisent les technologies d'assistance.",
    },
    customDay: {
      title: 'Cellules de jour personnalisées',
      text: "Le slot <code>#day</code> remplace le nombre à l'intérieur d'un jour et reçoit la date ISO ainsi que ce que la cellule sait d'elle-même : si elle appartient au mois affiché, si elle peut être choisie, si elle est sélectionnée, aujourd'hui, ou dans une période en cours de tracé.",
    },
    clearable: {
      title: 'Effacement',
      text: "<code>clearable</code> ajoute une croix qui vide la valeur, à gauche de l'icône de calendrier et non à sa place.",
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: '<code>showAdjacentDays</code> remplit les coins de la grille avec les mois voisins, grisés et inertes. <code>selectAdjacentDays</code> rend ces jours choisissables, et en choisir un déplace le calendrier vers son mois.',
    },
    states: {
      title: 'États',
      text: "<code>invalid</code> marque le champ en erreur. <code>disabled</code> le grise et empêche l'ouverture du panneau. <code>readonly</code> montre la valeur figée : rien ne se saisit et aucun calendrier n'est rendu, mais le champ garde son contraste et prend le focus.",
    },
    localization: {
      title: 'Localisation',
      text: "<code>locale</code> décide de l'ordre de saisie, du séparateur, des noms de mois et de jours et du premier jour de la semaine, et l'emporte sur la locale globale. <code>displayFormat</code> est un jeu d'options <code>Intl</code> pour écrire la date, et s'applique partout où rien n'est saisi.",
    },
    placement: {
      title: 'Placement',
      text: "<code>placement</code> nomme la direction d'ouverture préférée du panneau, au-dessus ou en dessous du champ.",
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
        pickerIconLabel:
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
      events: {
        clear: 'La croix de vidage a vidé le champ. La valeur est déjà remise à zéro.',
        clickIconStart:
          "L'icône de début a été cliquée. Attacher cet écouteur est ce qui en fait un vrai bouton, qui demande alors <code>iconStartLabel</code>.",
      },
      slots: {
        day: 'Ce que montre une cellule de jour, transmis tel quel au calendrier.',
        footer:
          "La bande au pied du panneau : des actions, ou des dates prédéfinies comme aujourd'hui. Elle reçoit <code>close</code>, ce qui permet à l'un de ces boutons de refermer le panneau.",
        valueEnd:
          "Des contrôles à vous à l'intérieur du champ, placés avant ceux que le champ possède : la croix d'effacement et l'icône qui ouvre le panneau. Ces deux-là sont l'affordance propre du composant, ce qui explique l'absence de slot <code>end</code> ici.",
        start:
          "Du contenu au début du champ, rendu après <code>iconStart</code> plutôt qu'à sa place.",
      },
    },
  },
}
