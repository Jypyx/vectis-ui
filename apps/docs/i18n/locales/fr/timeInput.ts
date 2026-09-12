export default {
  title: "Champ d'heure",
  lead: "Un champ d'heure sous l'une de trois formes : saisi avec un masque, rempli depuis une horloge, ou une liste d'heures à intervalle fixe. La valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures.",

  examples: {
    labelAndHint: {
      title: 'Libellé, indication et icône',
      text: "<code>label</code> et <code>hint</code> se comportent comme sur n'importe quel champ. <code>pickerIcon</code> change le glyphe qui ouvre l'horloge, <code>iconStart</code> pose une icône au début du champ, et <code>loading</code> affiche un indicateur à la place de l'icône d'horloge. <code>pickerIconLabel</code>, <code>clearLabel</code>, <code>loadingLabel</code> et <code>iconStartLabel</code> renomment ce que chacun annonce.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> définit la hauteur du champ à 32, 40 ou 48 pixels, et <code>compact</code> lui retire 4px. L'horloge garde ses propres mesures.",
    },
    modes: {
      title: 'Modes',
      text: "<code>mode</code> choisit la forme du champ : <code>input</code> le masque pour n'y saisir que des chiffres, l'horloge devenant alors optionnelle via <code>showPicker</code> ; <code>picker</code> fait de l'horloge la seule entrée, qui y est donc imposée ; <code>list</code> abandonne l'horloge au profit d'une liste d'heures que l'on filtre.",
    },
    steps: {
      title: 'Pas',
      text: "<code>minuteStep</code> est ce que propose le cadran, le pas des flèches du clavier et la découpe de la liste. Il laisse le masque tranquille, et mérite d'être posé sur une liste avant toute chose : la minute par défaut fait 1440 lignes.",
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: "<code>min</code>, <code>max</code>, <code>allowedHours</code> et <code>allowedMinutes</code> restreignent ce qui peut être choisi. La liste et l'horloge écartent ce qui ne peut pas l'être ; le champ saisi valide l'entrée et se déclare invalide par la validité du contrôle.",
    },
    clearable: {
      title: 'Effaçable',
      text: "<code>clearable</code> ajoute une croix qui vide la valeur, à gauche de l'icône d'horloge et non à sa place. La forme liste prend sa propre croix du combobox sur lequel elle est bâtie, formulation comprise.",
    },
    states: {
      title: 'États',
      text: "<code>invalid</code> sert à une règle que le navigateur ne peut pas vérifier lui-même. <code>disabled</code> grise le champ et empêche l'ouverture du panneau. <code>readonly</code> montre la valeur figée : rien ne se saisit, aucune horloge n'est rendue et le bouton AM/PM disparaît avec elle, tandis que le champ garde son contraste et prend le focus.",
    },
    twelveHour: {
      title: 'Horloge de douze heures',
      text: "La valeur est une chaîne sur 24 heures quoi qu'il y ait à l'écran. Là où se choisit la moitié de la journée dépend de la forme : un bouton dans le champ saisi, la paire de l'horloge à côté de ses chiffres, et rien dans une liste, chaque ligne énonçant la sienne.",
    },
    localization: {
      title: 'Localisation',
      text: "<code>locale</code> décide de l'horloge, du masque et de la façon d'écrire une heure, et l'emporte sur la locale globale. <code>format</code> passe au-dessus des deux, pour un champ qui doit se lire d'une seule façon quelle que soit la langue.",
    },
    placement: {
      title: 'Positionnement',
      text: "<code>placement</code> nomme la direction d'ouverture préférée du panneau, au-dessus ou en dessous du champ.",
    },
  },

  api: {
    VTimeInput: {
      props: {
        format:
          "Si les heures sont montrées sur une horloge de 12 ou de 24 heures. Omise, la langue du lecteur décide, ce qui est presque toujours ce que l'on veut.",
        mode: "La forme que prend le champ : saisissable, en mode <code>picker</code> où l'horloge est la seule voie d'entrée et se trouve donc forcée, ou une LISTE d'heures à intervalle fixe, où une horloge n'aurait aucun sens. C'est une autre question que <code>readonly</code>, qui gèle le champ par toutes les voies à la fois.",
        showPicker:
          "Propose le sélecteur à côté d'un champ saisissable : une icône en fin de champ, et un panneau qu'elle ouvre. Elle est laissée indéfinie plutôt que mise à faux, ce qui distingue « non fournie » d'un refus explicite.",
        minuteStep:
          "L'intervalle entre deux heures qui peuvent être choisies. Il s'applique au sélecteur, aux flèches et aux lignes de la liste.",
        min: "L'heure la plus tôt que l'on puisse choisir, incluse, en chaîne canonique sur 24 heures. Le sélecteur et la liste retirent tous deux ce qu'elle exclut, et une heure saisie en dehors rend le champ invalide.",
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
        readonly:
          "Montre l'heure sans permettre de la changer : rien ne se tape, il n'y a ni horloge ni croix de vidage, et les attributs qui annonçaient un panneau disparaissent avec eux. Le champ garde le focus et reste copiable, ce qui le distingue de <code>disabled</code>.",
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        iconStart:
          "Une icône dans le champ, au début. Décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> en fasse un bouton.",
        iconStartLabel: "Ce que fait l'icône de début, en mots, une fois cliquable.",
        pickerIconLabel:
          "Ce que fait l'icône de fin, en mots. Elle nomme le bouton qui ouvre l'horloge, et sa valeur par défaut vient du dictionnaire du design system.",
        loading:
          "Affiche une roue à la place de l'icône de l'horloge. Elle dit que quelque chose se charge et ne change rien d'autre : le champ reste saisissable et le panneau s'ouvre toujours.",
        loadingLabel:
          "Ce que les lecteurs d'écran annoncent pendant que la roue tourne. Sa valeur par défaut vient du dictionnaire du design system.",
        clearable: "Propose une croix qui vide la valeur, affichée avant l'icône de fin.",
        clearLabel:
          'Ce que fait cette croix, en mots. Sa valeur par défaut vient du dictionnaire du design system.',
        pickerIcon:
          "L'icône qui ouvre l'horloge, en fin de champ. Sans effet sur la forme liste, dont le chevron suit la convention de la liste déroulante. La croix d'effacement apparaît à sa gauche plutôt qu'à sa place.",
        placement: "Où le panneau s'ouvre par rapport au champ.",
        vModel:
          "L'heure, toujours en chaîne sur 24 heures quelle que soit l'horloge affichée : vous n'avez donc jamais à savoir laquelle la langue du lecteur utilise.",
      },
      events: {
        clear: 'La croix de vidage a vidé le champ. La valeur est déjà remise à zéro.',
        clickIconStart:
          "L'icône de début a été cliquée. Attacher cet écouteur est ce qui en fait un vrai bouton, qui demande alors <code>iconStartLabel</code>.",
      },
      slots: {
        footer:
          "La bande au pied de l'horloge, qui REMPLACE les boutons Annuler et OK au lieu de s'y ajouter. Elle reçoit les deux actions, et c'est ce qui la rend utilisable : l'horloge écrit un brouillon que seul <code>confirm</code> valide, donc un pied à vous sans lui laisserait la valeur inchangeable depuis le panneau. Elle n'est pas rendue en mode liste, qui n'a pas de panneau propre.",
        valueEnd:
          "Des contrôles à vous à l'intérieur du champ, placés avant ceux que le champ possède : la croix d'effacement et l'icône qui ouvre le panneau. Ces deux-là sont l'affordance propre du composant, ce qui explique l'absence de slot <code>end</code> ici.",
        start:
          "Du contenu au début du champ, rendu après <code>iconStart</code> plutôt qu'à sa place.",
      },
    },
  },
}
