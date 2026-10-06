export default {
  title: 'Tableau de données',
  lead: '<code>VDataTable</code> affiche des lignes avec recherche, tri, sélection et pagination. Traitez les données localement ou utilisez le mode serveur pour demander chaque résultat.',
  examples: {
    sorting: {
      title: 'Tri',
      text: 'Marquez les colonnes <code>sortable</code>. Leurs en-têtes alternent entre ordre croissant, décroissant et initial. Observez ou définissez le tri avec <code>v-model:sort</code>.',
    },
    search: {
      title: 'Recherche',
      text: '<code>searchable</code> ajoute un champ qui recherche dans les colonnes déclarées sans distinction de casse ni d’accents. Pilotez la requête avec <code>v-model:search</code>.',
    },
    pagination: {
      title: 'Pagination',
      text: 'Définissez <code>v-model:per-page</code> au-dessus de 0 pour activer la pagination. <code>showRange</code> affiche la plage de lignes visible.',
    },
    rowsPerPage: {
      title: 'Lignes par page',
      text: '<code>perPageOptions</code> propose les tailles de page dans le pied du tableau.',
    },
    selection: {
      title: 'Sélection',
      text: '<code>selectable</code> ajoute des cases par ligne et une case pour la page. Fournissez un <code>rowKey</code> stable ; <code>v-model:selected</code> contient ces identifiants.',
    },
    toolbar: {
      title: "Barre d'outils",
      text: 'Le slot <code>title</code> remplace le titre de la barre d’outils ; la recherche reste de l’autre côté.',
    },
    customCells: {
      title: 'Cellules personnalisées',
      text: 'Un slot correspondant à une clé de colonne remplace ses cellules. Il reçoit la ligne, la valeur brute et la colonne ; le tri et la recherche utilisent toujours la valeur brute.',
    },
    customHeadings: {
      title: 'En-têtes personnalisés',
      text: 'Utilisez <code>head-</code> suivi d’une clé de colonne pour personnaliser son en-tête. Les en-têtes triables contiennent un bouton : gardez le slot non interactif.',
    },
    variants: {
      title: 'Variantes',
      text: '<code>flat</code> laisse le tableau sans cadre ; <code>outlined</code> ajoute un fond de carte et une bordure.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit les espacements des cellules et la hauteur des contrôles.',
    },
    striped: {
      title: 'Lignes zébrées',
      text: '<code>striped</code> colore une ligne sur deux.',
    },
    stickyHeader: {
      title: 'En-tête collant',
      text: '<code>stickyHeader</code> conserve les en-têtes visibles dans une zone défilante limitée. Définissez <code>height</code> ou limitez la hauteur du parent.',
    },
    fullHeight: {
      title: 'Pleine hauteur',
      text: '<code>height</code> limite tout le composant, barre d’outils et pied compris. Les nombres utilisent des pixels ; les chaînes, des longueurs CSS.',
    },
    serverSide: {
      title: 'Côté serveur',
      text: '<code>serverSide</code> affiche les lignes fournies sans recherche, tri ni pagination locale. Écoutez <code>update:params</code>, chargez les lignes et fournissez <code>total</code>. <code>searchDebounce</code> retarde les requêtes de recherche.',
    },
    virtual: {
      title: 'Longues tables',
      text: '<code>virtual</code> ne rend que les lignes proches de la partie visible de la table, pour des tables de plusieurs milliers de lignes. Comme <code>stickyHeader</code>, il demande une hauteur bornée. Les lignes sont mesurées à leur rendu, et la case d’en-tête prend toujours toutes les lignes.',
    },
    infiniteScroll: {
      title: 'Défilement infini',
      text: '<code>hasMore</code> émet <code>load-more</code> quand la fin des lignes approche. Ajoutez les lignes suivantes à <code>rows</code> ; pendant <code>loading</code>, les lignes déjà là restent affichées.',
    },
    states: {
      title: 'Chargement et vide',
      text: 'Le chargement est prioritaire sur les résultats vides. Personnalisez ces états avec <code>loadingText</code>, <code>emptyText</code> ou leurs slots.',
    },
    fullTable: {
      title: 'Un tableau complet',
      text: 'Combine recherche, tri, sélection, cellules personnalisées et pagination.',
    },
  },
  api: {
    VDataTable: {
      props: {
        columns: 'Colonnes dans l’ordre d’affichage.',
        rows: 'Lignes à afficher.',
        rowKey:
          'Champ d’identifiant stable des lignes. Requis pour la sélection ; sinon, la position est utilisée.',
        caption: 'Description du tableau annoncée par les technologies d’assistance.',
        variant: 'Tableau sans cadre ou avec bordure.',
        loading: 'Affiche le contenu de chargement à la place des lignes.',
        loadingText: 'Texte de chargement visible. Utilise le dictionnaire par défaut.',
        emptyText:
          'Titre du <code>VEmptyState</code> affiché pour les résultats vides. Utilise par défaut le dictionnaire, qui distingue l’absence de données d’une recherche sans résultat.',
        title:
          'Titre de la barre d’outils. Nomme aussi le tableau si aucune légende n’est fournie.',
        searchable: 'Ajoute un champ de recherche dans la barre d’outils.',
        searchPlaceholder: 'Texte indicatif de recherche. Utilise le dictionnaire par défaut.',
        searchLabel: 'Nom accessible du champ de recherche. Utilise le dictionnaire par défaut.',
        searchDebounce:
          'Délai de recherche serveur en millisecondes. 0 lance la requête immédiatement.',
        striped: 'Colore une ligne sur deux.',
        stickyHeader:
          'Conserve les en-têtes visibles au défilement. Nécessite une hauteur limitée.',
        compact: 'Réduit les espacements des cellules et la hauteur des contrôles.',
        height:
          'Hauteur totale. Les nombres utilisent des pixels ; les chaînes, des longueurs CSS. Sinon, hérite de la hauteur limitée du parent.',
        sortIcon: 'Icône d’une colonne triable non triée.',
        sortAscIcon: 'Icône de tri croissant.',
        sortDescIcon: 'Icône de tri décroissant.',
        perPageOptions: 'Tailles de page proposées dans le pied du tableau.',
        perPageText: 'Libellé du contrôle de taille de page. Utilise le dictionnaire par défaut.',
        total: 'Nombre total de lignes serveur pour la pagination et la plage affichée.',
        showRange: 'Affiche la plage de lignes visible dans le pied du tableau.',
        rangeText:
          'Fonction formatant <code>{ start, end, total }</code>. Utilise le dictionnaire par défaut.',
        selectable: 'Ajoute des cases par ligne et une case pour la page visible.',
        selectAllLabel:
          'Nom accessible de la sélection de page. Utilise le dictionnaire par défaut.',
        selectionText:
          'Fonction formatant le nombre sélectionné. Utilise le dictionnaire par défaut ; vide sans sélection.',
        selectRowLabel:
          'Fonction nommant chaque case à partir de sa ligne et de son index global commençant à 0. Numéro de ligne par défaut.',
        serverSide:
          'Délègue la recherche, le tri et la pagination au serveur via <code>update:params</code>.',
        virtual:
          'Ne rend que les lignes proches de la partie visible de la table. Demande une hauteur bornée ; les lignes portent alors <code>aria-rowindex</code>.',
        hasMore:
          'Émet <code>load-more</code> quand la fin des lignes approche. Les lignes restent affichées pendant le chargement.',
        vModelSort: 'Clé et sens du tri, ou <code>null</code>. Changer le tri conserve la page.',
        vModelPage:
          'Numéro de page à partir de 1. Changer la recherche ou la taille de page le remet à 1. Les valeurs hors limites affichent la page la plus proche sans réécrire le modèle.',
        vModelPerPage: 'Lignes par page. Une valeur supérieure à 0 active la pagination.',
        vModelSelected:
          'Identifiants <code>rowKey</code> sélectionnés, conservés entre les pages. La case d’en-tête couvre les lignes de la page affichée, rendues ou non.',
        vModelSearch:
          'Requête de recherche. La recherche locale ignore la casse et les accents ; le mode serveur la transmet sans filtrer.',
      },
      events: {
        loadMore:
          'La fin des lignes approche alors que <code>hasMore</code> est actif : ajoutez les lignes suivantes.',
        updateParams:
          'Changements de requête en mode serveur : recherche, tri, page et taille de page. Non émis au montage ni pour une valeur inchangée.',
      },
      slots: {
        title: 'Contenu remplaçant le titre de la barre d’outils.',
        loading: 'Contenu remplaçant l’indicateur et le texte de chargement.',
        empty:
          'Contenu des résultats vides, à la place du <code>VEmptyState</code> par défaut. Reçoit la <code>search</code> actuelle.',
      },
    },
  },
}
