export default {
  title: 'Sélecteur de fichiers',
  lead: "Le frère en zone de dépôt de VFileInput : une surface plutôt qu'un champ, avec les mêmes règles de filtrage et la même liste de fichiers en valeur.",

  examples: {
    titleAndSubtitle: {
      title: 'Titre et sous-titre',
      text: "<code>title</code> est obligatoire et <code>subtitle</code> est l'endroit où écrire les règles en clair. Les deux ont un slot, qui n'accepte que du texte et des éléments en ligne.",
    },
    preview: {
      title: 'La liste des fichiers',
      text: '<code>preview</code> dit où va la liste des fichiers choisis, sous la zone ou à côté, ou la retire. À côté, elle repasse dessous dès que le composant est étroit.',
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: '<code>icon</code> est le grand glyphe en haut de la zone. <code>typeIcons</code> remplace le glyphe affiché par une ligne pour un type de fichier, en ne nommant que les types à changer, et <code>removeIcon</code> celui du bouton qui retire une ligne.',
    },
    thumbnails: {
      title: 'Vignettes',
      text: "Une image est affichée telle quelle, par une adresse temporaire créée dans la page. <code>hideThumbnails</code> affiche à la place l'icône de son type.",
    },
    multiple: {
      title: 'Fichiers multiples',
      text: '<code>multiple</code> permet à la zone de prendre plusieurs fichiers, les suivants étant écartés sinon. La valeur est une liste dans les deux cas, et <code>reject</code> est émis une fois par fichier refusé.',
    },
    accept: {
      title: 'Types acceptés',
      text: '<code>accept</code> accepte la syntaxe du navigateur et filtre la boîte de dialogue système comme un fichier déposé. Un fichier qui échoue revient par <code>reject</code> avec la raison <code>type</code>.',
    },
    maxSize: {
      title: 'Taille maximale',
      text: "<code>maxSize</code> est la taille maximale d'un fichier, en octets. Chacun est pesé séparément.",
    },
    totalSize: {
      title: 'Taille totale et nombre',
      text: '<code>maxTotalSize</code> et <code>maxFiles</code> bornent la sélection dans son ensemble, en comptant ce qui est déjà dans la liste. Le filtrage suit un ordre fixe : type, puis taille, puis nombre, puis taille totale.',
    },
    states: {
      title: 'États',
      text: "<code>readonly</code> montre ce qui a été pris sans rien laisser changer, boutons de retrait compris. <code>disabled</code> grise la zone et l'empêche d'accepter quoi que ce soit, y compris en cours de glisser.",
    },
  },

  api: {
    VFilePicker: {
      props: {
        title:
          "Ce qu'on demande au lecteur de déposer, en une ligne. C'est OBLIGATOIRE : une zone de dépôt sans consigne n'est qu'un rectangle. Elle masque l'attribut HTML du même nom, compromis accepté.",
        subtitle:
          'Une seconde ligne dessous, pour les contraintes en clair : genres, tailles, nombre.',
        icon: 'La grande icône en haut de la zone.',
        hideBrowse:
          "Masque le séparateur et le bouton de parcours sous la consigne. Cela change la NATURE de la zone : elle devient alors le contrôle elle-même, un vrai bouton, si bien qu'Entrée, Espace et le focus viennent de la plateforme plutôt que d'un conteneur qui se contente de réagir aux clics.",
        browseLabel:
          'Le libellé du bouton de parcours. Il retombe sur le dictionnaire du design system.',
        preview:
          "Où les fichiers pris sont listés : sous la zone, ou à côté, auquel cas la liste repasse dessous quand le COMPOSANT est étroit, en suivant la largeur qu'on lui a donnée et non celle de la fenêtre. Par défaut, rien n'est listé du tout.",
        hideThumbnails:
          "Affiche l'icône de genre pour chaque fichier de cette liste, images comprises : la porte de sortie quand une liste contient beaucoup d'images, ou de très grandes. Sans lui, une image est montrée en vignette : elle reçoit une adresse temporaire, créée dans le navigateur seulement et libérée dès que le fichier quitte la liste ou que le composant disparaît.",
        typeIcons: "Remplace l'icône d'un ou plusieurs genres de fichiers.",
        removeIcon: "L'icône du bouton qui retire un fichier de la liste.",
        multiple:
          'Permet de prendre plusieurs fichiers. Avec un seul, tout fichier supplémentaire est écarté.',
        accept:
          "Quels genres de fichiers sont acceptés, dans la syntaxe du navigateur. C'est appliqué deux fois : en attribut, ce qui filtre la boîte de dialogue du système, et de nouveau en code, seule chose capable de filtrer un fichier déposé.",
        maxSize: "La taille maximale d'UN fichier, en octets.",
        maxTotalSize: 'La taille maximale de toute la sélection, en octets.',
        maxFiles: 'Combien de fichiers peuvent être pris au plus.',
        disabled: 'Rend la zone inutilisable, grisée par les tokens de couleur.',
        readonly:
          'Montre ce qui a été pris sans permettre de le changer : ni boîte de dialogue, ni dépôt, ni retrait.',
        invalid:
          "Marque la zone comme invalide, ce qui colore son contour. C'est pour une règle à vous : rien ici n'est vérifié par le navigateur, le vrai champ étant masqué.",
        loading:
          "Affiche un indicateur à la place de l'icône de la zone, typiquement pendant un envoi. Il dit que quelque chose se passe et ne change rien d'autre : les fichiers peuvent toujours être déposés et la boîte de dialogue s'ouvre encore.",
        loadingLabel:
          "Ce que les lecteurs d'écran annoncent pendant que l'indicateur tourne. Sa valeur par défaut vient du dictionnaire du design system.",
        vModel:
          "Toujours une LISTE de fichiers, que plusieurs soient permis ou non, jamais un fichier seul. La forme ne dépend pas d'une prop : vous n'avez donc jamais à restreindre une union que TypeScript ne sait pas discriminer.",
      },
      events: {
        change: "La sélection a changé, avec toute la liste telle qu'elle est désormais.",
        reject: 'Un fichier a été écarté, avec lequel et pourquoi.',
        remove: 'Un fichier a été retiré de la liste, avec lequel et où il se trouvait.',
      },
      slots: {
        icon: "La grande icône, pour une illustration que la prop ne peut pas exprimer. Elle doit rester non interactive, et les deux suivantes aussi : avec le bouton de parcours masqué, la zone EST un bouton, et rien d'interactif ne peut se trouver dans un bouton.",
        title: 'La consigne. Texte et éléments en ligne seulement, pour la même raison.',
        subtitle: 'La seconde ligne. Même contrat que la consigne.',
        browse:
          "Le bouton de parcours. Appelez le <code>open</code> qu'il reçoit : sans lui, un bouton à vous ne pourrait plus ouvrir la boîte de dialogue du tout.",
        item: "TOUTE une ligne de la liste, la porte de sortie pour une ligne montrant sa propre progression d'envoi. Elle reçoit tout ce qu'avait la ligne standard.",
        thumbnail:
          "Le carré en début de ligne seulement : pour une vignette produite par votre serveur, l'image d'accroche d'une vidéo, ou un format que le navigateur ne sait pas décoder.",
        remove:
          'Le contrôle qui retire une ligne. <code>remove</code> est la seule chose qui peut sortir le fichier, et <code>label</code> est le nom tout prêt, celui du fichier compris, sans lequel le bouton ne serait annoncé comme rien du tout.',
      },
    },
  },
}
