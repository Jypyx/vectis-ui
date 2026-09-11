export default {
  title: 'Tableau de données',
  lead: "Des lignes avec recherche, tri, sélection et pagination. Il fait les quatre lui-même sur les lignes qu'on lui donne, ou les confie à un serveur en se contentant de rapporter ce qui est demandé.",

  examples: {
    sorting: {
      title: 'Tri',
      text: "Une colonne marquée <code>sortable</code> reçoit un en-tête cliquable, et le tableau ordonne les lignes lui-même : croissant, puis décroissant, puis retour à l'ordre reçu. L'icône du tri croissant pointe vers le bas, la convention des tableurs, puisqu'un tri de A à Z se lit vers le bas. Le tri est un modèle : le tableau peut donc s'ouvrir sur une colonne déjà triée, et ce que le lecteur clique se relit. En changer laisse le lecteur sur la page où il était.",
    },
    search: {
      title: 'Recherche',
      text: "<code>searchable</code> ajoute un champ à la barre d'outils. Seules les colonnes déclarées sont cherchées, sans tenir compte de la casse ni des accents : eclair trouve Éclair, et le lecteur n'a jamais à savoir où le diacritique est passé. Le terme est un modèle à part entière, <code>v-model:search</code>, ce qui permet de piloter la recherche depuis ailleurs dans la page. Chercher ramène à la première page : celle où le lecteur se trouvait ne dit rien des lignes qui restent.",
    },
    pagination: {
      title: 'Pagination',
      text: "Toute taille de page supérieure à zéro allume la pagination : il suffit donc de la passer, liée ou non. La page est bornée par dérivation plutôt que réécrite, si bien qu'une page au-delà de la dernière affiche simplement la dernière, et que des lignes disparaissant sous une recherche ne laissent jamais le lecteur devant rien. <code>showRange</code> ajoute le décompte à côté de la navigation, ce qui dit au lecteur ce qu'il reste quand les lignes, elles, ne le disent pas.",
    },
    rowsPerPage: {
      title: 'Lignes par page',
      text: '<code>perPageOptions</code> ajoute un menu au pied du tableau, où le lecteur choisit combien de lignes tient une page. Liez <code>v-model:per-page</code> pour savoir ce qui a été choisi, ou laissez le tableau le garder pour lui. En changer ramène à la première page, le seul numéro qui garde un sens une fois les pages recoupées.',
    },
    selection: {
      title: 'Sélection',
      text: "Une case sur chaque ligne, et une dans l'en-tête pour la page entière. <code>rowKey</code> devient obligatoire : ce qui revient, ce sont les identités que ce champ donne, jamais les objets de ligne, et sans lui une ligne est identifiée par sa position, que le tri, le filtrage et la pagination corrompent tous. Une sélection survit à un changement de page, alors que la case d'en-tête ne couvre que la page visible, ce qui explique qu'elle puisse être indéterminée. Nommer les cases depuis la ligne elle-même vaut la ligne de code : « Sélectionner la ligne » ne dit rien à un lecteur d'écran sur laquelle.",
    },
    toolbar: {
      title: "Barre d'outils",
      text: "Le slot <code>#header</code> remplace la prop <code>title</code> et occupe la gauche de la barre, le champ de recherche gardant la droite. Les filtres y ont leur place, et le filtrage reste le vôtre : le tableau affiche les lignes qu'on lui donne et les réduit encore avec sa propre recherche, les deux se superposant au lieu de se contrarier.",
    },
    customCells: {
      title: 'Cellules personnalisées',
      text: "Un slot nommé d'après la clé d'une colonne remplace ce que ses cellules affichent, et reçoit la ligne, la valeur brute et la colonne. La recherche et le tri lisent toujours la valeur sous-jacente : un nombre formaté se trie donc comme un nombre, et un statut dessiné en chip se trouve toujours par le mot qu'il porte.",
    },
    customHeadings: {
      title: 'En-têtes personnalisés',
      text: "Un slot nommé <code>head-</code> suivi de la clé de la colonne remplace un en-tête. Sur une colonne triable, il est rendu à l'intérieur du bouton de tri : tenez-vous-en donc au texte et à la décoration, un contrôle placé là étant un contrôle dans un contrôle, ce dont rien dans l'arbre d'accessibilité ne peut rendre compte. L'état du tri, lui, est déjà porté par l'en-tête.",
    },
    variants: {
      title: 'Variantes',
      text: "La variante plate ne porte aucune décoration et se pose sur la surface qui l'accueille. La variante encadrée en fait une carte, avec un fond surélevé, une bordure et des coins arrondis, et ouvre une gouttière pour que la barre d'outils, la légende et le pied ne touchent pas le cadre. L'en-tête prend le fond du cadre, ce qui évite la couture visible sous un en-tête collant.",
    },
    compact: {
      title: 'Compact',
      text: "Un cran plus serré sur chaque cellule, et sur tout ce que le tableau rend avec elles : le champ de recherche, le menu de taille de page et la pagination prennent le même cran, pour que l'ensemble reste un seul objet plutôt qu'un tableau dense entouré de mobilier au large.",
    },
    striped: {
      title: 'Lignes zébrées',
      text: "Teinte une ligne sur deux, ce qui aide l'œil à suivre une longue ligne d'un bout à l'autre. L'espace laissé sous la dernière ligne reste nu : les lignes n'ont pas de hauteur fixe, il n'y a donc rien sur quoi mesurer la suite du motif.",
    },
    stickyHeader: {
      title: 'En-tête collant',
      text: 'Garde les en-têtes de colonne en place pendant que les lignes défilent dessous. Il lui faut une zone de défilement bornée : soit la prop <code>height</code>, comme ci-dessous, soit un parent qui a sa propre hauteur. Les en-têtes sont peints sur la surface du tableau, si bien que les lignes passent derrière eux et non au travers.',
    },
    fullHeight: {
      title: 'Pleine hauteur',
      text: "<code>height</code> borne le composant entier, barre d'outils et pied compris, un nombre étant lu en pixels. Sans elle, le tableau prend la hauteur de son parent dès que celui-ci en a une : seules les lignes s'étirent et défilent, la barre d'outils et le pied gardant leur place quel que soit le contenu de la page. Un parent sans hauteur propre ne change rien, ce qui ne coûte donc rien là où ce n'est pas voulu.",
    },
    responsive: {
      title: 'Conteneurs étroits',
      text: "Trop étroit pour tenir ses colonnes, le tableau défile latéralement, ou transforme chaque ligne en carte avec ses en-têtes de colonne répétés à l'intérieur. Le seuil est la largeur du composant et non celle de la fenêtre, mesurée par une container query : un tableau logé dans un panneau étroit s'empile donc pendant que la page autour reste large.",
    },
    serverSide: {
      title: 'Côté serveur',
      text: "<code>serverSide</code> délègue la recherche, le tri et la pagination : les lignes sont affichées telles qu'elles arrivent, et <code>update:params</code> rapporte chaque changement de ce qui est demandé. Passez <code>total</code> pour que la pagination et le décompte disent juste sur des lignes que le tableau ne détient jamais. Rien n'est émis à l'apparition du tableau, la première page étant l'affaire de la page elle-même, ce qui évite que chaque tableau charge deux fois. La recherche est différée par <code>searchDebounce</code>, et le terme et le retour à la première page arrivent en une émission plutôt qu'en deux.",
    },
    states: {
      title: 'Chargement et vide',
      text: "<code>loading</code> affiche un spinner à la place des lignes, et il est traité avant le vide : un tableau qui attend ses lignes ne prétend donc jamais qu'il n'y en a pas. Sans rien à montrer et rien en cours, c'est <code>emptyText</code> qui est dit, dans les mots du design system à défaut des vôtres.",
    },
    fullTable: {
      title: 'Un tableau complet',
      text: "Tout à la fois : un titre, une recherche, une sélection, quatre colonnes triables, des cellules à soi, et un pied portant le décompte de la sélection, la taille de page, l'étendue et la pagination.",
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
