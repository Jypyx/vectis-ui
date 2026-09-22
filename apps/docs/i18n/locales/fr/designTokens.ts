import type { DescribedToken, TextRole } from '~/content/designTokens'

/*
 * `descriptions` traduit les `$description` de la source de la bibliothèque, que le catalogue
 * anglais publie tels quels. Le type `Record<DescribedToken, string>` fait échouer
 * `nuxt typecheck` sur un token ajouté à la bibliothèque sans traduction, ou retiré sans que sa
 * ligne ne le soit ici.
 */
const descriptions: Record<DescribedToken, string> = {
  '--vectis-color-surface': 'Le fond de page par défaut',
  '--vectis-color-surface-muted': 'Un fond atténué, pour les zones secondaires',
  '--vectis-color-surface-raised': 'Les surfaces surélevées : cartes',
  '--vectis-color-surface-overlay': 'Les surfaces flottantes : dialogues, popovers, menus',
  '--vectis-color-surface-sunken': 'Les surfaces en creux : encarts, zones de code',
  '--vectis-color-surface-inverse': 'Les surfaces à contraste inversé : infobulles',
  '--vectis-color-surface-skeleton':
    'Le fond des silhouettes de VSkeletonLoader, dont son reflet est dérivé',
  '--vectis-color-text-on-inverse': 'Le texte posé sur une surface inversée',
  '--vectis-color-text': "Le texte courant de l'interface",
  '--vectis-color-text-muted':
    'Le texte secondaire : aides, légendes, descriptions, icônes de début',
  '--vectis-color-text-subtle': 'Placeholders, texte désactivé',
  '--vectis-color-text-on-accent': "Le texte posé sur un fond d'accent, de danger ou de succès",
  '--vectis-color-text-on-warning':
    "Le texte posé sur un fond d'avertissement plein (l'ambre est trop clair pour du blanc)",
  '--vectis-color-border': 'Les séparateurs, et le cadre des cartes, des tableaux et des panneaux',
  '--vectis-color-border-strong': 'La bordure des contrôles de formulaire',
  '--vectis-color-accent':
    "La couleur de marque : boutons pleins, contrôles cochés, l'élément sélectionné",
  '--vectis-color-accent-hover': "La couleur d'accent au survol",
  '--vectis-color-accent-active': "La couleur d'accent à l'appui",
  '--vectis-color-accent-surface': "Un fond teinté d'accent (badges, sélections)",
  '--vectis-color-accent-border':
    "La bordure d'un élément teinté d'accent, assortie à la surface d'accent",
  '--vectis-color-accent-text': "Le texte d'accent sur un fond neutre ou teinté",
  '--vectis-color-danger': 'Actions destructrices et erreurs : boutons pleins, états en erreur',
  '--vectis-color-danger-hover': 'La couleur de danger au survol',
  '--vectis-color-danger-active': "La couleur de danger à l'appui",
  '--vectis-color-danger-surface':
    'Un fond teinté de danger (boutons et chips soft, un élément de menu destructeur)',
  '--vectis-color-danger-border':
    "La bordure d'un élément teinté de danger, assortie à la surface de danger",
  '--vectis-color-danger-text':
    "Le texte de danger sur un fond neutre ou teinté : messages d'erreur, élément de menu destructeur",
  '--vectis-color-success': 'Une issue positive : chips pleins, badges, notifications',
  '--vectis-color-success-hover': 'La couleur de succès au survol',
  '--vectis-color-success-active': "La couleur de succès à l'appui",
  '--vectis-color-success-surface': 'Un fond teinté de succès (chips soft, badges, notifications)',
  '--vectis-color-success-border':
    "La bordure d'un élément teinté de succès, assortie à la surface de succès",
  '--vectis-color-success-text': 'Le texte de succès sur un fond neutre ou teinté',
  '--vectis-color-warning':
    "Une situation qui demande de l'attention : chips pleins, badges, notifications",
  '--vectis-color-warning-hover': "La couleur d'avertissement au survol",
  '--vectis-color-warning-active': "La couleur d'avertissement à l'appui",
  '--vectis-color-warning-surface':
    "Un fond teinté d'avertissement (chips soft, badges, notifications)",
  '--vectis-color-warning-border':
    "La bordure d'un élément teinté d'avertissement, assortie à la surface d'avertissement",
  '--vectis-color-warning-text': "Le texte d'avertissement sur un fond neutre ou teinté",
  '--vectis-color-backdrop': 'Le voile derrière les dialogues modaux',
  '--vectis-color-event-surface':
    "La face d'un événement de calendrier qui n'a pas de couleur propre",
  '--vectis-color-event-border':
    'Le contour de cet événement, et la barre qui marque son bord de début',
  '--vectis-color-event-text': 'Le titre de cet événement',
  '--vectis-text-family': 'La police courante de tous les composants',
  '--vectis-text-family-heading':
    "La police des rôles display et heading, celle du texte courant tant qu'elle n'est pas surchargée",
  '--vectis-text-family-code': 'La police du code (le rôle code, VInputOTP)',
  '--vectis-radius-interactive': 'Boutons, champs, contrôles',
  '--vectis-radius-surface': 'Cartes, alertes',
  '--vectis-radius-overlay': 'Dialogues, popovers, menus',
  '--vectis-radius-pill': 'Arrondi complet : interrupteurs, badges, chips en pilule',
  '--vectis-radius-chip': 'Les chips en shape="chip", qui suivent le rayon interactive par défaut',
  '--vectis-duration-fast': "Changements de couleur et de bordure au survol, au focus, à l'appui",
  '--vectis-duration-base': "La durée par défaut : un panneau qui s'ouvre, une valeur qui bouge",
  '--vectis-duration-slow': "Les mouvements assez amples pour être suivis de l'œil",
  '--vectis-focus-ring-color':
    "L'anneau de focus clavier, qui doit ressortir sur le fond de la page",
  '--vectis-focus-ring-width': "L'épaisseur de l'anneau de focus",
  '--vectis-focus-ring-offset': "L'écart entre un contrôle et son anneau de focus",
  '--vectis-control-height-xs':
    'La hauteur de tout contrôle en size="xs" (24px), 4px de moins en compact',
  '--vectis-control-height-sm':
    'La hauteur de tout contrôle en size="sm" (32px), 4px de moins en compact',
  '--vectis-control-height-md':
    'La hauteur de tout contrôle en size="md" (40px), 4px de moins en compact',
  '--vectis-control-height-lg':
    'La hauteur de tout contrôle en size="lg" (48px), 4px de moins en compact',
  '--vectis-control-height-xl':
    'La hauteur de tout contrôle en size="xl" (56px), 4px de moins en compact',
  '--vectis-control-border-width': 'La bordure des contrôles à cocher (VCheckbox, VRadio)',
  '--vectis-control-size-check': 'La boîte des contrôles à cocher (VCheckbox, VRadio)',
  '--vectis-control-size-check-mark': 'La coche dans la boîte de VCheckbox',
  '--vectis-control-size-check-dot': 'Le point dans le cercle de VRadio',
  '--vectis-control-size-switch-w': 'La largeur du rail de VSwitch',
  '--vectis-control-size-switch-h': 'La hauteur du rail de VSwitch',
  '--vectis-control-size-switch-pad': "L'écart entre le curseur de VSwitch et le bord de son rail",
  '--vectis-control-action-size-sm':
    'Les boutons internes des champs sm (effacement, icône cliquable)',
  '--vectis-control-action-size-md':
    'Les boutons internes des champs md (effacement, icône cliquable)',
  '--vectis-control-action-size-lg':
    'Les boutons internes des champs lg (effacement, icône cliquable)',
  '--vectis-control-size-slider-track': "L'épaisseur du rail de VSlider",
  '--vectis-control-size-slider-thumb': 'Le diamètre du curseur de VSlider',
  '--vectis-control-size-slider-length': "La longueur par défaut d'un VSlider vertical",
  '--vectis-control-size-slider-field': 'La largeur des champs numériques de VSlider',
  '--vectis-control-size-carousel-block':
    'La hauteur par défaut de la zone visible de VCarousel, nécessaire à un carrousel vertical pour disposer ses diapositives',
  '--vectis-control-size-carousel-indicator':
    "Le diamètre d'un point indicateur de VCarousel (sa zone cliquable vient de --vectis-control-height-xs)",
  '--vectis-control-size-carousel-indicator-active':
    "La longueur de l'indicateur actif de VCarousel, qui s'étire d'un point en pilule",
  '--vectis-control-size-combobox-list-max-block':
    'La hauteur maximale du panneau de liste de VCombobox (la zone qui défile)',
  '--vectis-control-size-menu-min': 'La largeur minimale du panneau de VMenu',
  '--vectis-control-size-menu-max': 'La largeur maximale du panneau de VMenu',
  '--vectis-control-size-progress-linear-thickness':
    "L'épaisseur par défaut de la barre de VProgressLinear (4px)",
  '--vectis-control-size-progress-linear-length':
    "La longueur par défaut d'un VProgressLinear vertical, que remplace une hauteur posée sur la barre",
  '--vectis-control-size-progress-circular-diameter': 'Le diamètre par défaut de VProgressCircular',
  '--vectis-control-size-progress-circular-thickness':
    "L'épaisseur de trait par défaut de VProgressCircular (4px)",
  '--vectis-control-size-skeleton-surface':
    "La hauteur par défaut d'un VSkeletonLoader de forme surface : une carte, une image (96px)",
  '--vectis-control-size-toast-width': "La largeur par défaut d'un toast",
  '--vectis-control-size-tooltip-max':
    "La largeur maximale d'une infobulle avant qu'elle ne passe à la ligne (288px)",
  '--vectis-control-size-dialog-width':
    "La largeur par défaut de VDialog et VDialogAlert (400px), en l'absence de `width`",
  '--vectis-control-size-snackbar-min': "La largeur minimale d'une snackbar (288px)",
  '--vectis-control-size-snackbar-max': "La largeur maximale d'une snackbar (576px)",
  '--vectis-control-size-badge-h': "La hauteur d'un VBadge en pilule",
  '--vectis-control-size-badge-dot': "Le diamètre d'un VBadge en mode point",
  '--vectis-control-size-badge-ring': "L'anneau qui détache un VBadge bordé",
  '--vectis-control-size-avatar-ring': "L'anneau qui sépare les avatars empilés (VAvatarGroup)",
  '--vectis-control-size-date-picker-cell': "Le côté d'une case de jour de VDatePicker",
  '--vectis-control-size-date-picker-day':
    'Le diamètre du disque sur lequel un jour de VDatePicker est dessiné ; la case grandit pour le contenir',
  '--vectis-control-size-date-picker-dot': "Le diamètre d'un point d'événement de VDatePicker",
  '--vectis-control-size-date-picker-nav-min':
    "La largeur minimale des boutons de choix du mois et de l'année de VDatePicker (environ 86px)",
  '--vectis-control-size-tab-indicator':
    "L'épaisseur de l'indicateur de l'onglet actif (VTabs, flat et outlined)",
  '--vectis-control-size-table-search': 'La largeur du champ de recherche de VDataTable',
  '--vectis-control-size-time-picker-dial': 'Le diamètre du cadran de VTimePicker',
  '--vectis-control-size-time-picker-number':
    "La case d'un chiffre sur le cadran de VTimePicker, et le disque de l'aiguille sur un repère",
  '--vectis-control-size-time-picker-center': 'Le point central du cadran de VTimePicker',
  '--vectis-control-size-time-picker-hand': "L'épaisseur de l'aiguille du cadran de VTimePicker",
  '--vectis-control-size-time-picker-hand-minor':
    "Le disque de l'aiguille de VTimePicker sur une minute hors des repères de 5 minutes",
  '--vectis-control-size-file-picker-min-block':
    'La hauteur minimale de la zone de dépôt de VFilePicker : icône, deux lignes, séparateur et bouton',
  '--vectis-control-size-file-picker-icon':
    'La grande icône en haut de la zone de dépôt de VFilePicker',
  '--vectis-control-size-file-picker-thumb':
    "La vignette carrée d'une ligne d'aperçu de VFilePicker (une image, ou l'icône de son type)",
  '--vectis-control-size-calendar-hour':
    "La hauteur d'une heure dans la grille horaire de VCalendar",
  '--vectis-control-size-calendar-gutter':
    "La colonne des heures à côté de la grille horaire de VCalendar, assez large pour « 12:00 AM » d'une horloge sur 12 heures sur une ligne",
  '--vectis-control-size-calendar-tick':
    "La longueur dont le trait d'une heure déborde dans la colonne des heures de VCalendar, pour relier le libellé à sa ligne",
  '--vectis-control-size-calendar-edge':
    "La bande sur le côté de VCalendar qui change de période quand un événement déplacé s'y arrête",
  '--vectis-control-size-calendar-day-min':
    "La largeur minimale d'une colonne de jour de VCalendar, en dessous de laquelle la grille défile",
  '--vectis-control-size-calendar-handle':
    "La bande le long du bord inférieur d'une carte de VCalendar, par laquelle on étire sa fin",
  '--vectis-control-size-calendar-allday-lane':
    'Une ligne du bandeau « toute la journée » de VCalendar',
  '--vectis-control-size-calendar-allday-max':
    'La hauteur au-delà de laquelle le bandeau « toute la journée » de VCalendar défile au lieu de grandir',
  '--vectis-control-size-calendar-now-dot':
    "Le point sur la ligne de l'heure actuelle de VCalendar",
  '--vectis-control-size-calendar-month-cell':
    "La hauteur minimale d'un jour dans la vue mois de VCalendar",
  '--vectis-control-size-calendar-year-cell':
    "Le côté d'une case de jour dans les mini-mois de la vue année de VCalendar",
  '--vectis-icon-size-sm': "La taille d'icône des contrôles xs (16px)",
  '--vectis-icon-size-md': "La taille d'icône des contrôles sm et md (20px)",
  '--vectis-icon-size-lg': "La taille d'icône des contrôles lg et xl (24px)",
}

export default {
  title: 'Design tokens',
  lead: 'Les tokens sémantiques que Vectis UI expose sous forme de variables CSS, avec ce que chacun contrôle et sa valeur par défaut. Ce sont les noms à surcharger pour adapter la bibliothèque à votre propre design ou à votre charte graphique.',

  readingBody:
    "Quand une valeur pointe vers un autre token, le tableau l'affiche deux fois : la valeur à laquelle elle se résout, puis la référence telle que la feuille de styles l'écrit, par exemple <code>var(--vectis-color-gray-900)</code>. Surcharger le rôle garde cohérents tous les composants qui le lisent, alors que modifier la primitive derrière lui modifie aussi tous les autres rôles qui pointent vers elle.",
  readingOverrideBefore:
    "Les primitives (les cinq palettes et les échelles d'espacement, de typographie, de rayons, d'ombres et de durées) ne sont pas listées à part : elles apparaissent dans ces références. La façon de surcharger un token pour toute la page ou pour une partie seulement est expliquée sur la page",
  readingOverrideAfter: '.',
  readingSiteAccent:
    'Ce site redéfinit son propre accent en violet : les boutons et les liens autour de ces tableaux ne correspondent donc pas aux valeurs indigo par défaut qui y sont listées.',

  columnToken: 'Token',
  columnDescription: 'Description',
  columnDefault: 'Valeur par défaut',
  columnLight: 'Clair',
  columnDark: 'Sombre',
  columnRole: 'Rôle',
  columnSize: 'Taille',
  columnWeight: 'Graisse',
  columnLeading: 'Interlignage',
  columnTracking: 'Approche',
  sameAsLight: 'Identique au thème clair',
  noToken: 'aucun',

  colorsHeading: 'Couleurs',
  colorsBody:
    "Surfaces, texte, bordures et les quatre tons. Chaque ton est une famille de six rôles : la couleur pleine, ses états survolé et appuyé, une surface teintée, la bordure assortie à cette surface et une couleur de texte qui y reste lisible. Les trois couleurs d'événement du calendrier contiennent une variable de teinte que le calendrier pose sur chaque événement, d'où sa présence dans leur valeur.",

  focusHeading: 'Anneau de focus',
  focusBody:
    "L'anneau dessiné autour d'un contrôle qui reçoit le focus au clavier. Sa couleur est un rôle à part entière plutôt que l'accent : l'accent doit porter du texte blanc, l'anneau doit ressortir sur la page.",

  typographyHeading: 'Typographie',
  typographyBody:
    "Trois familles de polices, puis les rôles de texte. Un rôle est une recette complète : sa taille, sa graisse et son interlignage, plus une approche quand elle compte. Les composants demandent un rôle, donc surcharger l'une de ses valeurs modifie tous les endroits où ce rôle est utilisé.",
  typographyFontBefore:
    "Le chargement d'une police web et son affectation aux familles sont expliqués sur la page",
  typographyFontAfter: '.',
  familiesCaption: 'Familles de polices',
  rolesCaption: 'Rôles de texte',
  roles: {
    display: 'Le plus grand texte, pour un titre de une',
    'heading-1': "Le titre d'une page",
    'heading-2': 'Un titre de section',
    'heading-3': 'Un titre de sous-section',
    'heading-4': "Le plus petit titre : un groupe au sein d'une section, le titre d'une carte",
    subtitle: "La ligne sous un titre, dans un dialogue ou un élément d'accordéon",
    'body-xl': "Le paragraphe d'introduction qui ouvre une page ou une section",
    'body-lg': 'Le texte courant avec plus de place, pour une lecture plus longue',
    'body-md':
      'Le texte courant par défaut, aussi utilisé par les lignes de menu, les notifications et les champs',
    'body-sm': 'Le petit texte courant : détails secondaires, notes',
    label: "Le libellé au-dessus d'un champ de formulaire",
    caption: "Un court texte d'appoint : l'aide d'un champ, un compteur",
    overline:
      "Le titre d'un groupe de lignes dans un menu, la liste d'un combobox ou une navigation latérale, avec un espacement des lettres élargi",
    code: 'Le code en ligne et les contenus de code',
    control:
      "Le libellé d'un contrôle comme un bouton, un chip ou un onglet. Il n'a pas de taille propre : le texte suit la taille donnée au contrôle",
  } satisfies Record<TextRole, string>,

  radiusHeading: 'Rayons',
  radiusBody:
    "Les rayons d'angle par rôle. <code>--vectis-radius-chip</code> pointe vers <code>--vectis-radius-interactive</code> : les chips suivent donc les autres contrôles tant que vous ne leur donnez pas un rayon propre. La référence est résolue là où les tokens sont déclarés, sur la racine : une surcharge du rayon interactive sur un sélecteur plus étroit doit aussi redéfinir le rayon des chips.",

  motionHeading: 'Mouvement',
  motionBody:
    "Les trois durées qu'utilise une transition. Elles sont les mêmes dans les deux thèmes. Les animations en boucle, comme celle du spinner, utilisent directement l'échelle des durées et ne suivent pas ces rôles.",

  sizesHeading: 'Tailles',
  sizesBody:
    "La hauteur de chaque palier de l'échelle de taille des contrôles, et les trois tailles d'icône. Un contrôle en <code>compact</code> mesure 4px de moins que son palier.",

  componentsHeading: 'Dimensions des composants',
  componentsBody:
    "Les dimensions propres à un seul composant : un rail, un curseur, la largeur d'un panneau. Chaque groupe renvoie vers la page de son composant.",

  groups: {
    surfaces: 'Surfaces',
    text: 'Texte',
    borders: 'Bordures',
    accent: 'Accent',
    danger: 'Danger',
    success: 'Succès',
    warning: 'Avertissement',
    backdrop: 'Voile',
    events: 'Événements du calendrier',
    controlHeights: 'Hauteurs des contrôles',
    iconSizes: "Tailles d'icône",
  },

  descriptions,
}
