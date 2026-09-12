export default {
  title: 'Tableau de données',
  lead: "Des lignes avec recherche, tri, sélection et pagination. Il fait les quatre lui-même sur les lignes qu'on lui donne, ou les confie à un serveur en se contentant de rapporter ce qui est demandé.",

  examples: {
    sorting: {
      title: 'Tri',
      text: "Une colonne marquée <code>sortable</code> reçoit un en-tête cliquable, qui alterne croissant, décroissant, puis l'ordre dans lequel les lignes ont été données. <code>v-model:sort</code> lit et pose cet état.",
    },
    search: {
      title: 'Recherche',
      text: "<code>searchable</code> pose un champ dans la barre d'outils, qui cherche dans les colonnes déclarées sans tenir compte de la casse ni des accents. <code>v-model:search</code> pilote le terme depuis ailleurs dans la page.",
    },
    pagination: {
      title: 'Pagination',
      text: 'Toute valeur de <code>v-model:per-page</code> supérieure à zéro active la pagination. <code>showRange</code> ajoute le compte des lignes à côté de la navigation.',
    },
    rowsPerPage: {
      title: 'Lignes par page',
      text: '<code>perPageOptions</code> ajoute au pied un menu pour choisir le nombre de lignes par page. <code>v-model:per-page</code> rapporte ce qui a été choisi.',
    },
    selection: {
      title: 'Sélection',
      text: "<code>selectable</code> ajoute une case à chaque ligne et une à l'en-tête pour la page visible. <code>rowKey</code> est alors obligatoire, et <code>v-model:selected</code> contient les identités données par ce champ.",
    },
    toolbar: {
      title: "Barre d'outils",
      text: "Le slot <code>#header</code> remplace la prop <code>title</code> et occupe la gauche de la barre d'outils, le champ de recherche gardant la droite.",
    },
    customCells: {
      title: 'Cellules personnalisées',
      text: "Un slot nommé d'après la clé d'une colonne remplace le contenu de ses cellules, et reçoit la ligne, la valeur brute et la colonne. La recherche et le tri lisent toujours la valeur sous-jacente.",
    },
    customHeadings: {
      title: 'En-têtes personnalisés',
      text: "Un slot nommé <code>head-</code> suivi de la clé de la colonne remplace un en-tête. Sur une colonne triable, il est rendu à l'intérieur du bouton de tri : tenez-vous-en donc au texte et à la décoration.",
    },
    variants: {
      title: 'Variantes',
      text: "<code>variant</code> définit la décoration : <code>flat</code> n'en porte aucune, <code>outlined</code> ajoute un fond surélevé, une bordure, des coins arrondis et une gouttière autour de la barre d'outils, de la légende et du pied.",
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> resserre chaque cellule, et avec elles le champ de recherche, le menu de taille de page et la pagination.',
    },
    striped: {
      title: 'Lignes zébrées',
      text: '<code>striped</code> teinte une ligne sur deux.',
    },
    stickyHeader: {
      title: 'En-tête collant',
      text: '<code>stickyHeader</code> garde les en-têtes de colonnes en place pendant le défilement des lignes. Il demande une zone de défilement bornée, par la prop <code>height</code> ou par un parent qui a sa propre hauteur.',
    },
    fullHeight: {
      title: 'Pleine hauteur',
      text: "<code>height</code> borne tout le composant, barre d'outils et pied compris, un nombre étant lu en pixels. Sans elle, le tableau prend la hauteur de son parent dès que celui-ci en a une.",
    },
    responsive: {
      title: 'Conteneurs étroits',
      text: "<code>responsive</code> décide de ce que fait un conteneur trop étroit pour les colonnes : défiler latéralement, ou transformer chaque ligne en carte avec ses en-têtes de colonnes répétés à l'intérieur.",
    },
    serverSide: {
      title: 'Côté serveur',
      text: "<code>serverSide</code> délègue la recherche, le tri et la pagination : les lignes sont affichées telles qu'elles arrivent et <code>update:params</code> rapporte chaque changement. Passez <code>total</code> pour la pagination et la plage, et <code>searchDebounce</code> pour retarder la recherche.",
    },
    states: {
      title: 'Chargement et vide',
      text: "<code>loading</code> affiche un indicateur à la place des lignes, et passe avant le vide. <code>emptyText</code> est ce que dit le tableau quand il n'y a rien à montrer.",
    },
    fullTable: {
      title: 'Un tableau complet',
      text: 'Tout à la fois : un titre, une recherche, une sélection, quatre colonnes triables, des cellules personnalisées, et un pied portant le compte de la sélection, la taille de page, la plage et la pagination.',
    },
  },

  api: {
    VDataTable: {
      props: {
        columns: "Les colonnes à afficher, dans l'ordre.",
        rows: 'Les lignes à afficher.',
        rowKey:
          "Quel champ identifie une ligne. Sans lui, une ligne est identifiée par sa position, ce qui suffit à l'affichage mais pas à une sélection : il doit être donné dès que des lignes peuvent être sélectionnées, sinon la sélection suit les positions et non les lignes.",
        caption:
          "Une phrase décrivant ce que contient le tableau. Elle est annoncée avant le tableau lui-même, et c'est elle qui dit à un utilisateur de lecteur d'écran si cela vaut la peine d'explorer.",
        variant:
          'Comment le tableau est encadré : rien du tout, ou une carte avec fond surélevé, bordure et coins arrondis.',
        responsive:
          "Ce qui se passe quand le composant est trop étroit : le tableau défile latéralement, ou chaque ligne devient une carte avec ses en-têtes de colonne répétés à l'intérieur.",
        loading: 'Montre que les lignes sont en cours de chargement.',
        emptyText:
          "Ce qui est dit quand il n'y a aucune ligne à montrer. Il retombe sur le dictionnaire du design system.",
        title:
          "Un titre au-dessus du tableau, à gauche de sa barre d'outils. Il masque l'attribut HTML du même nom sur le composant lui-même, compromis accepté : une infobulle sur tout un tableau serait de peu d'usage.",
        searchable: "Ajoute un champ de recherche à la barre d'outils.",
        searchPlaceholder:
          'Ce que dit ce champ quand il est vide. Il retombe sur le dictionnaire du design system.',
        searchLabel:
          "Ce que les lecteurs d'écran annoncent pour le champ de recherche. Il retombe sur le dictionnaire du design system.",
        searchDebounce:
          'Quand un serveur fait la recherche, combien de temps attendre après une frappe avant de le solliciter, en millisecondes. Zéro le sollicite aussitôt.',
        striped:
          "Teinte une ligne sur deux, ce qui aide l'œil à suivre une longue ligne à travers le tableau.",
        stickyHeader:
          'Garde les en-têtes de colonne en place pendant que les lignes défilent dessous. Cela demande une zone de défilement bornée : soit la prop <code>height</code>, soit un parent ayant une hauteur propre.',
        compact: "Resserre les cellules d'un cran, et tout ce que le tableau rend avec elles.",
        height:
          "La hauteur de TOUT le composant, barre d'outils et pagination comprises : un nombre est lu en pixels, tout le reste comme une longueur CSS. Omise, le tableau prend la hauteur de son parent dès que celui-ci en a une.",
        sortIcon: "L'icône d'en-tête d'une colonne triable mais qui ne l'est pas actuellement.",
        sortAscIcon:
          "L'icône d'un tri croissant. Elle pointe vers le BAS par défaut, convention du tableur : trier de A à Z se lit vers le bas.",
        sortDescIcon: "L'icône d'un tri décroissant.",
        perPageOptions: 'Les choix proposés pour le nombre de lignes par page.',
        perPageLabel: 'Le nom de ce choix. Il retombe sur le dictionnaire du design system.',
        total:
          "Combien de lignes il y a en tout sur le serveur. C'est ce qui permet à la pagination et à la plage d'être justes quand le tableau ne détient jamais qu'une page.",
        showRange: 'Affiche quelles lignes sont consultées, « 1 à 10 sur 42 », dans le pied.',
        rangeLabel: 'Reformule cette plage. Elle retombe sur le dictionnaire du design system.',
        selectable:
          "Ajoute une case à cocher à chaque ligne, et une dans l'en-tête pour prendre toute la page.",
        selectAllLabel:
          "Ce comme quoi la case d'en-tête est annoncée. Elle retombe sur le dictionnaire du design system.",
        selectionLabel:
          "Comment la sélection est résumée dans le pied. Elle ne dit rien du tout quand rien n'est sélectionné, et retombe sur le dictionnaire du design system.",
        selectRowLabel:
          "Ce comme quoi la case d'une ligne est annoncée. « Sélectionner la ligne » ne dit rien à un utilisateur de lecteur d'écran sur QUELLE ligne : cela vaut donc la peine de fournir quelque chose venu de la ligne elle-même. Elle retombe sur le dictionnaire du design system.",
        serverSide:
          "Confie la recherche, le tri et la pagination à un serveur : les lignes sont affichées telles qu'elles arrivent, et chaque changement de ce qui est demandé est rapporté pour que le serveur puisse y répondre.",
        vModelSort:
          "Selon quelle colonne les lignes sont triées, et dans quel sens. Rien n'est trié au départ. Cela peut être piloté de l'extérieur ou simplement laissé au tableau, qui le pose au clic sur les en-têtes ; le changer ne renvoie pas le lecteur à la première page.",
        vModelPage:
          'La page affichée, comptée à partir de 1. Rechercher ou changer la taille de page y renvoie à la première. Elle est bornée par dérivation plutôt que réécrite : une page au-delà de la dernière affiche donc simplement la dernière.',
        vModelPerPage:
          "Combien de lignes une page contient. Toute valeur supérieure à zéro active la pagination : en passer une sans la lier suffit donc à l'activer.",
        vModelSelected:
          "Les lignes sélectionnées, sous les identités que <code>rowKey</code> leur donne, jamais les objets de ligne eux-mêmes. Rien n'est sélectionné au départ, et une sélection SURVIT à un changement de page : la case d'en-tête ne couvre que la page visible, et c'est pourquoi elle peut être indéterminée.",
        vModelSearch:
          "Ce qui est saisi dans le champ de recherche, vide au départ. Seules les colonnes déclarées sont cherchées, sans tenir compte des accents ni de la casse ; en mode serveur rien n'est filtré ici et le terme est rapporté à la place.",
      },
      events: {
        updateParams:
          'Ce qui est demandé au tableau, en mode serveur : la recherche, le tri, la page et la taille de page. Il part à chaque changement et jamais au montage.',
      },
      slots: {
        header: "Le côté gauche de la barre d'outils, qui remplace la prop <code>title</code>.",
      },
    },
  },
}
