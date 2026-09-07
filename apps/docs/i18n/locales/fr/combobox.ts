export default {
  title: 'Liste déroulante',
  lead: "Un champ qui cherche dans une liste et retient ce qui est choisi, une valeur ou plusieurs. Les options peuvent être à plat, groupées ou séparées, et elles peuvent arriver d'un serveur à mesure que le lecteur saisit.",

  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: "Un <code>label</code> est rendu au-dessus du champ et un <code>hint</code> en dessous, tous deux liés à lui pour qu'un lecteur d'écran les lise avec. Le panneau est ancré au champ lui-même et non au composant, qui porte aussi ces deux-là : il s'ouvre contre le champ et recouvre l'aide tant qu'il est ouvert, au lieu de commencer une aide plus bas. La saisie réduit la liste sur le libellé en ignorant les accents, si bien que reunion trouve Réunion sans que le lecteur ait à savoir où est passé le diacritique.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs, 32, 40 et 48 pixels, chacune avec sa paire <code>compact</code> plus courte de 4px. Le panneau reprend la taille donnée au champ : les lignes, leurs icônes et leur rembourrage suivent sans rien d'autre à régler. Les puces d'un champ multiple se placent un cran en dessous du champ, et le champ force sa zone de saisie à leur hauteur, ce qui empêche la ligne de grandir au moment où elle prend le focus.",
    },
    states: {
      title: 'États',
      text: "Un champ désactivé est hors d'atteinte, et un champ invalide sert à une règle que le navigateur ne sait pas vérifier lui-même. <code>readonly</code> se place entre les deux : le choix est montré mais gelé, donc rien ne se tape, la liste ne s'ouvre jamais et les puces perdent leur croix, tandis que le champ garde son contraste normal, prend le focus et reste copiable. <code>loading</code> sans aucune option le dit sur tout le panneau, et le chevron devient une roue ; avec des options déjà listées, elle passe au pied de la liste, puisque ce qui charge est alors la page suivante. Un panneau qui n'a rien à montrer affiche <code>emptyText</code> au lieu de s'ouvrir vide, et <code>clearable</code> ajoute une croix qui vide la sélection et la recherche d'un coup.",
    },
    placement: {
      title: 'Placement',
      text: "Où la liste s'ouvre par rapport au champ. Le panneau est ancré en CSS : cette valeur nomme donc une préférence et non une position, puisqu'un navigateur à court de place en dessous bascule déjà le panneau au-dessus de lui-même, et qu'elle décide seulement du côté essayé en premier. Seul l'axe de bloc est proposé, une liste s'ouvrant à côté d'un champ de texte laissant le lecteur chercher au mauvais endroit. Les deux alignements se voient ci-dessous parce que les options sont plus larges que les champs, le panneau étant au moins aussi large que ce à quoi il est ancré et libre de prendre davantage.",
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: "Une entrée d'<code>options</code> est une option, un bloc nommé d'options ou un séparateur, et les trois se mélangent librement. Le filtrage garde cette structure honnête : un groupe dont aucune option ne survit disparaît avec son nom, et un séparateur laissé seul à une extrémité, ou contre un autre, est supprimé. La navigation au clavier reste plate malgré tout : les flèches parcourent les lignes dans l'ordre où elles se lisent et ne s'arrêtent jamais sur un intitulé.",
    },
    multiple: {
      title: 'Sélection multiple',
      text: "La valeur devient une liste et chaque option choisie apparaît en puce dans le champ, retirable une par une. Hors focus, la zone de recherche se replie pour ne laisser que les puces, sans bande vide à côté, et elle revient dès que le champ reprend le focus. Le tableau n'est jamais modifié sur place, donc un observateur posé sur le modèle se déclenche comme il doit.",
    },
    fieldIcon: {
      title: 'Icône du champ',
      text: "<code>iconStart</code> place une icône dans le champ, au début, et elle est rendue avant tout ce qui remplit cette zone. C'est ce qui lui permet de survivre aux puces d'un champ multiple au lieu d'être remplacée par elles. Elle est décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> lui soit attaché, ce qui en fait un vrai bouton et rend <code>iconStartLabel</code> nécessaire. La fin du champ appartient au composant : le chevron, la roue qui prend sa place pendant un chargement, et la croix de vidage à leur gauche.",
    },
    icons: {
      title: 'Icônes des options',
      text: "L'<code>icon</code> d'une option est dessinée dans l'emplacement que la ligne prévoit : elle est donc alignée et espacée comme celles de toutes les autres lignes, ce que ne serait pas une icône posée dans le slot d'option, dont le contenu est rendu à l'intérieur du libellé. Elle accepte les mêmes valeurs que toutes les props d'icône de la bibliothèque. Une ligne sans icône commence directement à son libellé au lieu de réserver une colonne vide.",
    },
    asynchronous: {
      title: 'Recherche asynchrone',
      text: "Désactivez <code>filter</code> et les options sont affichées exactement comme leur source les livre. <code>search</code> porte le terme, retardé par <code>searchDebounce</code> pendant la frappe et envoyé immédiatement à l'ouverture du panneau pour qu'une première page se charge. Le même terme n'est jamais émis deux fois de suite, donc rouvrir le panneau ne répète aucune requête. Les réponses peuvent tout de même arriver dans le désordre, et c'est à cela que sert le jeton ci-dessous : une réponse lente à une frappe ancienne ne doit pas écraser une réponse fraîche.",
    },
    infiniteScroll: {
      title: 'Défilement infini',
      text: "<code>hasMore</code> place une sentinelle au pied du panneau, et <code>load-more</code> se déclenche quand elle entre dans le champ de vision. La roue de la page suivante apparaît au même endroit, en laissant en place les options déjà chargées. Chaque page n'est demandée qu'une fois : la sentinelle ne peut pas revenir en vue tant que la page attendue n'a pas atterri et ne l'a pas repoussée vers le bas.",
    },
    customOption: {
      title: 'Options personnalisées',
      text: "Le slot <code>#option</code> remplace le libellé d'une ligne par un contenu à vous, une seconde ligne ou un badge, et reçoit l'option ainsi que l'information de savoir si la ligne est surlignée et si elle est déjà choisie. Il est rendu à l'intérieur du libellé, si bien que la ligne garde l'alignement, le rembourrage et la coche de sélection que le panneau lui donne. Pour une simple icône, le champ icon de l'option est la meilleure route.",
    },
    customChip: {
      title: 'Puces personnalisées',
      text: "Le slot <code>#chip</code> remplace la puce qui représente une valeur choisie. Trois des choses qu'il reçoit sont ce qui le rend utilisable : <code>remove</code>, sans quoi la valeur ne pourrait plus être retirée, et <code>size</code> et <code>compact</code>, le cran que le champ a calculé pour ses puces et que rien, hors du composant, ne peut deviner. L'option peut manquer, si cette valeur n'a jamais figuré parmi les options, d'où le chaînage optionnel sur l'icône ci-dessous.",
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
      },
    },
  },
}
