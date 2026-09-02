export default {
  title: 'Sélecteur de fichiers',
  lead: "Le frère en zone de dépôt de VFileInput : une surface plutôt qu'un champ, avec les mêmes règles de filtrage et la même liste de fichiers en valeur.",

  api: {
    VFilePicker: {
      props: {
        title:
          "Ce qu'on demande au lecteur de déposer, en une ligne. C'est OBLIGATOIRE : une zone de dépôt sans consigne n'est qu'un rectangle. Elle masque l'attribut HTML du même nom, compromis accepté.",
        subtitle:
          'Une seconde ligne dessous, pour les contraintes en clair : genres, tailles, nombre.',
        icon: 'La grande icône en haut de la zone.',
        showBrowse:
          "Affiche le séparateur et le bouton de parcours sous la consigne. Les masquer change la NATURE de la zone : elle devient alors le contrôle elle-même, un vrai bouton, si bien qu'Entrée, Espace et le focus viennent de la plateforme plutôt que d'un conteneur qui se contente de réagir aux clics.",
        browseLabel:
          'Le libellé du bouton de parcours. Il retombe sur le dictionnaire du design system.',
        preview:
          "Où les fichiers pris sont listés : sous la zone, ou à côté, auquel cas la liste repasse dessous quand le COMPOSANT est étroit, en suivant la largeur qu'on lui a donnée et non celle de la fenêtre. Par défaut, rien n'est listé du tout.",
        thumbnails:
          "Affiche une vignette pour chaque image de cette liste. Chaque image reçoit une adresse temporaire, créée dans le navigateur seulement et libérée dès que le fichier quitte la liste ou que le composant disparaît. Le couper affiche l'icône de genre à la place, la porte de sortie quand une liste contient beaucoup d'images, ou de très grandes.",
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
