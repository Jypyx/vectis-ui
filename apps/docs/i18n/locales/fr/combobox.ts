export default {
  title: 'Liste déroulante',
  lead: "Un champ qui cherche dans une liste et retient ce qui est choisi, une valeur ou plusieurs. Les options peuvent être à plat, groupées ou séparées, et elles peuvent arriver d'un serveur à mesure que le lecteur saisit.",

  examples: {
    labelAndHint: {
      title: "Label et texte d'aide",
      text: "<code>label</code> affiche un texte descriptif au-dessus du champ, et <code>hint</code> affiche un texte d'aide en dessous.",
    },
    sizes: {
      title: 'Tailles',
      text: 'Définit la hauteur du champ à 32, 40 ou 48 pixels. La prop <code>compact</code> réduit cette hauteur de 4px.',
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> rend le champ inutilisable. <code>readonly</code> empêche la modification tout en gardant le champ focalisable. <code>invalid</code> marque le champ en erreur. <code>loading</code> affiche un indicateur de chargement. <code>emptyText</code> définit le message affiché quand il n'y a aucune option. <code>clearable</code> ajoute une icône pour vider la sélection.",
    },
    placement: {
      title: 'Positionnement',
      text: "Définit la direction d'ouverture préférée (au-dessus ou en dessous du champ) pour le panneau de la liste d'options.",
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: 'La prop <code>options</code> accepte une liste simple, ou peut être structurée avec des groupes nommés et des séparateurs.',
    },
    multiple: {
      title: 'Sélection multiple',
      text: "<code>multiple</code> permet de sélectionner plusieurs valeurs, qui s'affichent sous forme de puces (chips) supprimables à l'intérieur du champ.",
    },
    fieldIcon: {
      title: 'Icône du champ',
      text: "<code>iconStart</code> affiche une icône au début du champ. <code>iconStartLabel</code> fournit un label accessible si l'icône est rendue interactive au clic.",
    },
    icons: {
      title: 'Icônes des options',
      text: "La propriété <code>icon</code> d'une option permet d'afficher une icône à côté de son libellé dans la liste déroulante.",
    },
    asynchronous: {
      title: 'Recherche asynchrone',
      text: "Désactiver <code>filter</code> affiche les options exactement telles que fournies par la source. <code>searchDebounce</code> définit le délai en millisecondes avant d'émettre la recherche.",
    },
    infiniteScroll: {
      title: 'Défilement infini',
      text: "<code>hasMore</code> indique que d'autres pages sont disponibles, déclenchant un événement <code>load-more</code> lorsque la fin de la liste devient visible à l'écran.",
    },
    customOption: {
      title: 'Options personnalisées',
      text: "Le slot <code>#option</code> permet de personnaliser le contenu et la mise en page d'une ligne (ex: ajout d'un badge ou d'une deuxième ligne de texte).",
    },
    customChip: {
      title: 'Puces personnalisées',
      text: "Le slot <code>#chip</code> permet de personnaliser l'apparence des puces (chips) des valeurs sélectionnées.",
    },
  },

  api: {
    VCombobox: {
      props: {
        options:
          "Ce que la liste propose. Une entrée peut être une option, un bloc nommé d'options, ou un séparateur ; une simple liste d'options reste parfaitement valable.",
        multiple:
          'Permet de choisir plusieurs valeurs, ce qui fait de la valeur une liste et montre ce qui a été choisi en puces dans le champ.',
        label: "Le libellé au-dessus du champ, lié à lui pour qu'un clic dessus y place le focus.",
        hint: "Une ligne d'aide sous le champ, lue en même temps que le libellé.",
        size: 'La hauteur du champ : 32, 40 ou 48 pixels. Le panneau et ses lignes la suivent.',
        compact: 'Retire 4px à la hauteur, comme partout ailleurs dans le design system.',
        placeholder: "Ce que dit le champ tant que rien n'est choisi et que rien n'a été saisi.",
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        readonly:
          "Montre ce qui a été choisi sans permettre de le changer : rien ne se tape, la liste ne s'ouvre jamais, les chips perdent leur croix et aucune croix de vidage n'est proposée. Le champ garde le focus et reste copiable, ce qui le distingue de <code>disabled</code>.",
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        iconStart:
          "Une icône dans le champ, au début. Elle est rendue avant les chips et non à leur place. Décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> en fasse un bouton.",
        iconStartLabel: "Ce que fait l'icône de début, en mots, une fois cliquable.",
        expandIcon:
          "Le chevron à la fin du champ, qui pivote à l'ouverture de la liste. C'est une décoration : c'est le champ lui-même qui ouvre la liste, donc le chevron est masqué aux lecteurs d'écran et ne prend pas de libellé.",
        clearable: 'Propose une croix qui vide à la fois la sélection et la recherche.',
        clearLabel:
          'Ce que fait cette croix, en mots. Sa valeur par défaut vient du dictionnaire du design system.',
        emptyText: 'Ce que dit le panneau quand la recherche ne correspond à rien.',
        filter:
          'Comment la liste se resserre à la saisie. La couper signifie que les options arrivent déjà filtrées par leur source et sont montrées telles quelles. Une règle à vous reçoit la requête TELLE QUE SAISIE, simplement rognée, et non la forme insensible aux accents utilisée en interne.',
        searchDebounce:
          "Combien de temps attendre avant de dire à la source ce qui est cherché, en millisecondes. Zéro le lui dit aussitôt, ce qui convient à une source qui n'est pas une requête réseau.",
        loading:
          'Dit que quelque chose est en cours de chargement. Sans option encore, tout le panneau le dit ; avec des options déjà listées, un indicateur apparaît au pied de la liste, puisque ce qui charge est alors la page suivante. Dans les deux cas, le champ remplace son chevron par un indicateur.',
        loadingText:
          "Ce qui est dit pendant le chargement, et ce comme quoi l'indicateur est annoncé.",
        hasMore:
          "Dit qu'il reste des pages à venir, ce qui est ce qui pousse le composant à demander la suivante quand la fin de la liste entre dans le champ de vision.",
        placement:
          "Où la liste s'ouvre par rapport au champ. Le panneau est ancré en CSS, donc cette valeur nomme une préférence : un navigateur à court de place se rabat déjà tout seul.",
        vModel:
          "La valeur de l'option choisie, ou leur liste quand <code>multiple</code> est posé. Elle part sur une chaîne vide, et le tableau n'est jamais muté sur place.",
      },
      events: {
        search:
          "Ce qui est cherché, à envoyer à la source. C'est retardé de <code>searchDebounce</code> pendant la saisie, et émis aussitôt à l'ouverture du panneau pour qu'une première page puisse être chargée. Le même terme n'est jamais émis deux fois de suite.",
        loadMore:
          'La fin de la liste est entrée dans le champ de vision : envoyez la page suivante.',
        clear: 'La croix de vidage a vidé la sélection et la recherche.',
        clickIconStart:
          "L'icône de début a été cliquée. Attacher cet écouteur est ce qui en fait un vrai bouton, qui demande alors <code>iconStartLabel</code>.",
      },
      slots: {
        option:
          "Ce qu'une ligne de la liste montre, à la place du simple libellé : un sous-titre, un avatar, un badge. On lui dit si la ligne est celle mise en évidence et si elle est déjà choisie.",
        chip: "Remplace la puce qui représente une valeur choisie. Elle reçoit <code>remove</code>, sans quoi la valeur ne pourrait plus être retirée, ainsi que la taille et la densité calculées pour tenir dans le champ, qui ne se devinent pas de l'extérieur. L'option elle-même peut manquer, si cette valeur n'a jamais figuré parmi les options.",
        empty: 'Ce que le panneau montre quand rien ne correspond. Il reçoit le terme cherché.',
        loading: 'Ce que le panneau montre pendant le chargement de ses premières options.',
        valueEnd:
          "Des contrôles à vous à l'intérieur du champ, placés avant ceux que le champ possède : la croix d'effacement et l'icône qui ouvre le panneau. Ces deux-là sont l'affordance propre du composant, ce qui explique l'absence de slot <code>end</code> ici.",
        start:
          "Du contenu au début du champ, rendu après <code>iconStart</code> plutôt qu'à sa place.",
      },
    },
  },
}
