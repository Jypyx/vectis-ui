import type { DescribedToken, TextRole } from '~/content/designTokens'

// Keep translations aligned with the library’s token descriptions and keys.
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
  '--vectis-color-border-on-fill':
    'Un voile bordant ou séparant un fond plein : jointures de VButtonGroup, pastilles de VColorPicker',
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
  '--vectis-control-size-select-list-max-block':
    'La hauteur maximale du panneau de liste de VSelect (la zone qui défile)',
  '--vectis-control-size-menu-min': 'La largeur minimale du panneau de VMenu',
  '--vectis-control-size-menu-max': 'La largeur maximale du panneau de VMenu',
  '--vectis-control-size-meter-thickness-sm': "L'épaisseur d'un VMeter petit (4px)",
  '--vectis-control-size-meter-thickness-md': "L'épaisseur d'un VMeter moyen (8px)",
  '--vectis-control-size-meter-thickness-lg': "L'épaisseur d'un VMeter grand (12px)",
  '--vectis-control-size-meter-segment-gap': "L'espace entre deux segments de VMeter (2px)",
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
  '--vectis-control-size-hover-card-max': "La largeur maximale d'un VHoverCard (320px)",
  '--vectis-control-size-dialog-width':
    "La largeur par défaut de VDialog et VDialogAlert (400px), en l'absence de `width`",
  '--vectis-control-size-command-palette-width':
    "La largeur par défaut de VCommandPalette (640px), en l'absence de `width`",
  '--vectis-control-size-command-palette-list-max-block':
    'La hauteur maximale de la liste de commandes de VCommandPalette avant qu’elle ne défile (320px)',
  '--vectis-control-size-command-palette-offset':
    'La distance entre le haut de la fenêtre et VCommandPalette, qui garde le champ de recherche immobile quand la liste change de hauteur (96px)',
  '--vectis-control-size-rating-sm': "L'icône d'un petit VRating (20px)",
  '--vectis-control-size-rating-md': "L'icône d'un VRating moyen (24px)",
  '--vectis-control-size-rating-lg': "L'icône d'un grand VRating (32px)",
  '--vectis-control-size-resizable-hit':
    'La largeur de la bande qui capte le pointeur autour d’une poignée de VResizable (12px)',
  '--vectis-control-size-resizable-grip-length':
    'La longueur de la pastille que VResizable dessine sur ses poignées avec `grip` (24px)',
  '--vectis-control-size-resizable-grip-thickness':
    'L’épaisseur de la pastille que VResizable dessine sur ses poignées avec `grip` (8px)',
  '--vectis-control-size-drawer-sm':
    "La largeur d'un petit VDrawer latéral, ou la hauteur d'un VDrawer en haut ou en bas (320px)",
  '--vectis-control-size-drawer-md':
    "La largeur d'un VDrawer latéral moyen, ou la hauteur d'un VDrawer en haut ou en bas (400px)",
  '--vectis-control-size-drawer-lg':
    "La largeur d'un grand VDrawer latéral, ou la hauteur d'un VDrawer en haut ou en bas (560px)",
  '--vectis-control-size-stepper-indicator':
    "Le diamètre du cercle qui porte le numéro d'une étape de VStepper (32px)",
  '--vectis-control-size-stepper-connector-min':
    "La longueur minimale d'un trait de liaison horizontal entre deux étapes de VStepper (24px)",
  '--vectis-control-size-timeline-dot-sm':
    "Le point qui marque un événement d'un petit VTimeline (8px)",
  '--vectis-control-size-timeline-dot-md': "Le point qui marque un événement d'un VTimeline (10px)",
  '--vectis-control-size-timeline-icon-sm':
    "La pastille ronde qui porte l'icône d'un événement d'un petit VTimeline (24px)",
  '--vectis-control-size-timeline-icon-md':
    "La pastille ronde qui porte l'icône d'un événement d'un VTimeline (32px)",
  '--vectis-control-size-timeline-item-min':
    "La largeur minimale d'un événement d'un VTimeline horizontal avant que la liste ne défile (192px)",
  '--vectis-control-size-snackbar-min': "La largeur minimale d'une snackbar (288px)",
  '--vectis-control-size-snackbar-max': "La largeur maximale d'une snackbar (576px)",
  '--vectis-control-size-card-media':
    "La largeur du média d'un VCard horizontal avant que le contenu passe dessous (192px)",
  '--vectis-control-size-card-body-min':
    "La largeur minimale du contenu d'un VCard horizontal : en dessous, le média passe au-dessus du contenu",
  '--vectis-control-size-empty-state-media-sm':
    "Le diamètre de la pastille d'icône d'un petit VEmptyState (40px)",
  '--vectis-control-size-empty-state-media-md':
    "Le diamètre de la pastille d'icône d'un VEmptyState moyen (48px)",
  '--vectis-control-size-empty-state-media-lg':
    "Le diamètre de la pastille d'icône d'un grand VEmptyState (64px)",
  '--vectis-control-size-empty-state-text-max':
    "La largeur maximale du titre et de la description d'un VEmptyState avant retour à la ligne (448px)",
  '--vectis-control-size-field-label':
    "La largeur du libellé d'un VField placé à côté de son contrôle, avant que le contrôle passe dessous (160px)",
  '--vectis-control-size-field-control-min':
    "La largeur minimale du contrôle d'un VField à libellé latéral : en dessous, le libellé passe au-dessus du contrôle",
  '--vectis-control-size-badge-h': "La hauteur d'un VBadge en pilule",
  '--vectis-control-size-badge-dot': "Le diamètre d'un VBadge en mode point",
  '--vectis-control-size-badge-ring': "L'anneau qui détache un VBadge bordé",
  '--vectis-control-size-avatar-ring': "L'anneau qui sépare les avatars empilés (VAvatarGroup)",
  '--vectis-control-size-color-picker-width': 'La largeur de VColorPicker (256px)',
  '--vectis-control-size-color-picker-area':
    'La hauteur de la zone saturation et luminosité de VColorPicker (160px)',
  '--vectis-control-size-color-picker-track':
    "L'épaisseur des pistes de teinte et d'opacité de VColorPicker (12px)",
  '--vectis-control-size-color-picker-thumb':
    'Le diamètre des curseurs de VColorPicker, sur la zone et les pistes (20px)',
  '--vectis-control-size-color-picker-preview':
    'Le disque montrant la couleur courante dans VColorPicker (32px)',
  '--vectis-control-size-color-picker-format':
    'La largeur du menu de format de VColorPicker, qui contient son nom le plus long (96px)',
  '--vectis-control-size-color-picker-swatch': "Le côté d'une pastille de VColorPicker (24px)",
  '--vectis-control-size-color-picker-checker':
    'Le côté du damier visible à travers une couleur translucide (8px)',
  '--vectis-control-size-date-picker-cell': "Le côté d'une case de jour de VDatePicker",
  '--vectis-control-size-date-picker-day':
    'Le diamètre du disque sur lequel un jour de VDatePicker est dessiné ; la case grandit pour le contenir',
  '--vectis-control-size-date-picker-dot': "Le diamètre d'un point d'événement de VDatePicker",
  '--vectis-control-size-date-picker-nav-min':
    "La largeur minimale des boutons de choix du mois et de l'année de VDatePicker (environ 86px)",
  '--vectis-control-size-tab-indicator':
    "L'épaisseur de l'indicateur de l'onglet actif (VTabs, toutes les variantes sauf inset)",
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
  '--vectis-control-size-calendar-event-edge':
    "La largeur du bord d'attaque coloré d'un événement de VCalendar",
  '--vectis-control-size-calendar-gap':
    "L'écart que VCalendar laisse entre deux événements, côte à côte dans un jour ou empilés dans un mois",
  '--vectis-control-size-calendar-grip':
    'La longueur de la poignée dessinée sur la bande de redimensionnement d’une carte de VCalendar',
  '--vectis-control-size-calendar-grip-thickness':
    'L’épaisseur de cette poignée, qui est aussi sa distance au bord inférieur de la carte',
  '--vectis-control-size-calendar-year-month':
    'La largeur sous laquelle un mini-mois de la vue année de VCalendar ne descend pas avant que l’année se réorganise',
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
  lead: 'Les variables CSS sémantiques pour personnaliser Vectis UI, avec leur usage et leurs valeurs par défaut.',
  readingBody:
    'Pour les références à un token, les tableaux affichent la valeur résolue et l’expression CSS, par exemple <code>var(--vectis-color-gray-900)</code>. Redéfinissez un token sémantique pour modifier son rôle ; changer une primitive affecte tous les rôles qui la référencent.',
  readingOverrideBefore:
    'Les primitives apparaissent dans les références, sans tableau distinct. Pour des exemples de surcharge, consultez la page',
  readingOverrideAfter: '.',
  readingSiteAccent:
    'Ce site utilise un accent violet. Les tableaux affichent les valeurs indigo par défaut de la bibliothèque.',
  columnToken: 'Token',
  columnDescription: 'Description',
  columnDefault: 'Valeur par défaut',
  columnLight: 'Clair',
  columnDark: 'Sombre',
  columnRole: 'Rôle',
  columnSize: 'Taille',
  columnWeight: 'Graisse',
  columnLeading: 'Interlignage',
  columnTracking: 'Espacement des lettres',
  sameAsLight: 'Identique au thème clair',
  noToken: 'aucun',
  colorsHeading: 'Couleurs',
  colorsBody:
    'Couleurs des surfaces, textes, bordures, tons et événements du calendrier. Chaque ton définit une couleur pleine, des états survolé et appuyé, une surface teintée, une bordure et du texte.',
  focusHeading: 'Contour de focus',
  focusBody:
    'Couleur, épaisseur et décalage du contour de focus clavier. Sa couleur est indépendante de l’accent pour permettre d’ajuster son contraste avec le fond.',
  typographyHeading: 'Typographie',
  typographyBody:
    'Familles de polices et rôles de texte. Chaque rôle regroupe la taille, la graisse, l’interlignage et, s’il est défini, l’espacement des lettres.',
  typographyFontBefore: 'Pour charger et configurer les polices, consultez la page',
  typographyFontAfter: '.',
  familiesCaption: 'Familles de polices',
  rolesCaption: 'Rôles de texte',
  roles: {
    display: 'Grand titre d’accueil',
    'heading-1': 'Titre de page',
    'heading-2': 'Titre de section',
    'heading-3': 'Titre de sous-section',
    'heading-4': 'Titre de groupe ou de carte',
    subtitle: 'Sous-titre de dialogue ou d’élément d’accordéon',
    'body-xl': 'Introduction de page ou de section',
    'body-lg': 'Grand texte courant pour une lecture prolongée',
    'body-md': 'Texte courant par défaut, éléments de menu, notifications et champs',
    'body-sm': 'Détails secondaires et notes',
    label: 'Libellé au-dessus d’un champ de formulaire',
    choice: 'Libellé à côté d’une case à cocher, d’un bouton radio ou d’un interrupteur',
    caption: 'Texte d’aide d’un champ ou compteur',
    overline:
      'Titre de groupe dans un menu, une combobox ou une navigation latérale, avec un espacement des lettres élargi',
    code: 'Code en ligne et blocs de code',
    control: 'Libellé de bouton, de chip ou d’onglet. La taille du texte suit celle du contrôle.',
  } satisfies Record<TextRole, string>,
  radiusHeading: 'Rayons des angles',
  radiusBody:
    '<code>--vectis-radius-chip</code> référence <code>--vectis-radius-interactive</code> à la racine. Si vous redéfinissez le rayon des contrôles sur un conteneur, définissez aussi celui des chips pour modifier les deux.',
  motionHeading: 'Animations',
  motionBody:
    'Durées des transitions, communes aux deux thèmes. Les animations en boucle, comme celle du spinner, utilisent plutôt les tokens de durée primitifs.',
  sizesHeading: 'Tailles',
  sizesBody:
    'Hauteurs des contrôles et tailles des icônes. <code>compact</code> réduit la hauteur d’un contrôle de 4px.',
  componentsHeading: 'Dimensions des composants',
  componentsBody:
    'Dimensions propres à chaque composant, comme l’épaisseur d’un rail ou la largeur d’un panneau. Les titres des groupes renvoient à la documentation du composant.',
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
    iconSizes: 'Tailles des icônes',
  },
  descriptions,
}
