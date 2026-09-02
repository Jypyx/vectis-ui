export default {
  title: 'Tableau de données',
  lead: "Des lignes avec recherche, tri, sélection et pagination. Il fait les quatre lui-même sur les lignes qu'on lui donne, ou les confie à un serveur en se contentant de rapporter ce qui est demandé.",

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
