export default {
  title: 'Liste déroulante',
  lead: '<code>VCombobox</code> recherche dans une liste et sélectionne une ou plusieurs valeurs. Les options peuvent être groupées, séparées ou chargées de façon asynchrone.',
  examples: {
    labelAndHint: {
      title: "Label et texte d'aide",
      text: 'Utilisez <code>label</code> pour nommer le champ et <code>hint</code> pour le texte d’aide.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste le champ et les options. <code>compact</code> réduit la hauteur du champ.',
    },
    states: {
      title: 'États',
      text: 'Utilisez <code>disabled</code>, <code>readonly</code> et <code>invalid</code> pour les états du champ, <code>loading</code> pendant les requêtes et <code>clearable</code> pour effacer la sélection.',
    },
    placement: {
      title: 'Positionnement',
      text: '<code>placement</code> définit la position préférée du panneau. Le navigateur peut l’adapter à l’espace disponible.',
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: '<code>options</code> accepte des options, des groupes nommés et des séparateurs.',
    },
    multiple: {
      title: 'Sélection multiple',
      text: '<code>multiple</code> utilise un tableau pour la sélection et affiche des puces supprimables.',
    },
    textDisplay: {
      title: 'Valeurs en texte',
      text: '<code>display="text"</code> réunit les libellés sélectionnés sur une ligne. Désélectionnez les options dans la liste, ou retirez la dernière valeur avec Retour arrière lorsque la recherche est vide.',
    },
    maxValues: {
      title: 'Limite des valeurs visibles',
      text: '<code>max</code> limite les valeurs visibles lorsque le champ n’a pas le focus. Le focus révèle toutes les valeurs. Personnalisez le nombre masqué avec <code>overflowText</code> ou <code>#overflow</code>.',
    },
    fieldIcon: {
      title: 'Icône du champ',
      text: '<code>iconStart</code> ajoute une icône de début. <code>hideExpandIcon</code> masque le chevron ; le focus ouvre toujours la liste.',
    },
    icons: {
      title: 'Icônes des options',
      text: 'Définissez l’<code>icon</code> d’une option pour l’afficher à côté du libellé.',
    },
    asynchronous: {
      title: 'Recherche asynchrone',
      text: 'Définissez <code>:filter="false"</code> pour des options filtrées par le serveur. <code>searchDebounce</code> retarde les événements de recherche.',
    },
    infiniteScroll: {
      title: 'Défilement infini',
      text: '<code>hasMore</code> active <code>load-more</code> lorsque la fin de liste devient visible. Ajoutez la page suivante à <code>options</code>.',
    },
    customOption: {
      title: 'Options personnalisées',
      text: 'Utilisez <code>#option</code> pour personnaliser le contenu des options.',
    },
    customChip: {
      title: 'Puces personnalisées',
      text: 'Utilisez <code>#chip</code> pour personnaliser les puces sélectionnées et leur action de suppression.',
    },
  },
  api: {
    VCombobox: {
      props: {
        options:
          'Options, groupes nommés ou séparateurs. Chaque option possède une valeur et un libellé.',
        multiple: 'Autorise plusieurs sélections. Utilisez un tableau pour <code>v-model</code>.',
        display:
          'Affichage de la sélection multiple : puces supprimables ou texte séparé par des virgules. La sélection simple utilise toujours du texte.',
        max: 'Nombre de valeurs visibles sans focus. Le focus affiche toutes les valeurs. Omis ou nul, affiche tout. S’applique uniquement avec <code>multiple</code>.',
        overflowText:
          'Formate le nombre de valeurs masquées par <code>max</code>. Reçoit ce nombre.',
        label:
          'Libellé visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        size: 'Taille du champ et des options. Le champ reprend la taille définie par <code>VInputGroup</code>.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        placeholder: 'Texte indicatif lorsque le champ est vide.',
        disabled: 'Désactive les interactions.',
        readonly:
          'Empêche la saisie et les changements de sélection. Conserve le focus et la copie ; masque les actions d’effacement et empêche l’ouverture de la liste.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        iconStart:
          'Icône avant les valeurs sélectionnées. Un écouteur <code>@click:icon-start</code> en fait un bouton nécessitant <code>iconStartLabel</code>.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        expandIcon:
          'Chevron décoratif. Un clic ferme la liste ouverte ; le focus sur le champ ouvre la liste.',
        hideExpandIcon:
          'Masque le chevron. Le focus ouvre toujours la liste et le chargement affiche toujours un indicateur.',
        clearable: 'Ajoute une action pour effacer la sélection et la recherche.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Utilise le dictionnaire de la bibliothèque par défaut.',
        emptyText:
          'Titre du <code>VEmptyState</code> par défaut, aussi annoncé lorsque la liste est vide. Gardez-le cohérent avec le contenu personnalisé de <code>#empty</code>.',
        filter:
          'Filtrage intégré insensible aux accents, filtrage désactivé ou fonction personnalisée recevant l’option et la recherche sans espaces aux extrémités.',
        searchDebounce:
          'Délai en millisecondes avant d’émettre une recherche saisie. Zéro émet immédiatement.',
        loading:
          'Affiche un indicateur dans le champ et un état de chargement : panneau entier sans options, ou pied de liste si des options existent.',
        loadingText:
          'Texte de chargement annoncé aux lecteurs d’écran. Gardez-le cohérent avec le contenu personnalisé de <code>#loading</code>.',
        hasMore: 'Active la demande d’une nouvelle page lorsque la fin de liste devient visible.',
        placement: 'Position préférée du panneau par rapport au champ.',
        vModel:
          'Chaîne ou nombre sélectionné, ou tableau avec <code>multiple</code>. Vaut une chaîne vide par défaut.',
      },
      events: {
        search:
          'Émet la recherche après <code>searchDebounce</code>, ou immédiatement à l’ouverture. Les recherches identiques consécutives sont ignorées.',
        loadMore: 'Demande la page suivante lorsque la fin de liste devient visible.',
        clear: 'Émis après l’effacement de la sélection et de la recherche.',
        clickIconStart: 'Émis à l’activation du bouton d’icône de début.',
      },
      slots: {
        option:
          'Contenu d’une option. Reçoit l’option, son index et ses états actif et sélectionné.',
        chip: 'Puce sélectionnée. Reçoit la valeur, le libellé, l’option éventuelle, <code>remove</code>, la taille et l’état compact. Reliez l’action de suppression.',
        overflow:
          'Nombre de valeurs masquées. Reçoit <code>count</code>, la taille des puces et l’état compact.',
        empty:
          'Contenu de l’état vide. Reçoit la recherche ; définissez aussi <code>emptyText</code>.',
        loading: 'Contenu du chargement initial. Définissez aussi <code>loadingText</code>.',
        valueEnd: 'Contenu avant l’action d’effacement et l’icône d’ouverture.',
        start: 'Contenu après <code>iconStart</code>, sans remplacer l’icône.',
      },
    },
  },
}
