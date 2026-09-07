export default {
  title: 'Sélecteur de fichiers',
  lead: "Le frère en zone de dépôt de VFileInput : une surface plutôt qu'un champ, avec les mêmes règles de filtrage et la même liste de fichiers en valeur.",

  examples: {
    titleAndSubtitle: {
      title: 'Titre et sous-titre',
      text: "Le titre est obligatoire : une zone de dépôt sans consigne n'est qu'un rectangle dont personne ne sait quoi faire. Le sous-titre est l'endroit où les règles s'écrivent en toutes lettres, et c'est à vous de les écrire : le composant refuse un fichier, il n'annonce jamais d'avance ce qu'il acceptera. Les deux ont un slot, et ces deux slots n'admettent que du texte et des éléments en ligne : le bouton Parcourir masqué, la zone est elle-même un bouton, et rien d'interactif ne peut se trouver dans un bouton.",
    },
    preview: {
      title: 'La liste des fichiers',
      text: "Rien n'est listé tant que <code>preview</code> n'a pas dit où va la liste. Sous la zone, c'est ce que veut un formulaire étroit ; à côté d'elle, cela se lit mieux quand la place existe, et la liste se replie dessous d'elle-même dès que le composant devient étroit, largeur qu'il mesure sur lui et non sur la fenêtre. La valeur est la même liste dans les deux cas : ce que cette prop change, c'est la voir ou non, jamais ce qui est retenu.",
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: "<code>icon</code> est la grande icône en haut de la zone. <code>typeIcons</code> remplace le glyphe qu'une ligne affiche pour un type de fichier, et c'est une table partielle : ne nommez que les types que vous voulez changer, les huit valeurs par défaut couvrant le reste, ce qui laisse l'archive ci-dessous avec la sienne. <code>removeIcon</code> fait de même pour le bouton qui retire une ligne.",
    },
    thumbnails: {
      title: 'Vignettes',
      text: "Une image se présente comme elle-même. Le navigateur reçoit une adresse temporaire pour le fichier, fabriquée dans la page et libérée dès que le fichier quitte la liste ou que le composant disparaît : rien n'est donc jamais envoyé pour la dessiner. <code>hideThumbnails</code> est la porte de sortie quand une liste porte beaucoup d'images, ou de très grandes : chaque ligne montre alors l'icône de son type, comme le font déjà les autres fichiers.",
    },
    multiple: {
      title: 'Fichiers multiples',
      text: "Une zone prend un fichier sauf si <code>multiple</code> en décide autrement, et les fichiers en trop sont refusés plutôt que discrètement substitués. La valeur est une liste dans les deux cas : rien en aval ne change de forme avec la prop. À quoi ressemble un refus, c'est à vous de l'écrire : le composant émet <code>reject</code> une fois par fichier, avec la raison, et n'affiche rien de lui-même.",
    },
    accept: {
      title: 'Types acceptés',
      text: "La syntaxe du navigateur, extensions comme jokers. Elle est appliquée deux fois, et il le faut : une fois comme attribut, ce qui restreint la boîte de dialogue du système, et une seconde fois en code quand les fichiers arrivent, car l'attribut n'a strictement aucune prise sur ce qui est déposé. Un fichier qui n'y satisfait pas n'entre jamais dans la liste et revient par <code>reject</code> avec la raison <code>type</code>.",
    },
    maxSize: {
      title: 'Taille maximale',
      text: "La taille maximale d'un fichier, en octets. Chacun est pesé séparément : un fichier trop lourd est donc refusé et ceux qui l'accompagnent dans le même dépôt passent quand même. Les tailles s'écrivent en unités SI, où un kilo-octet vaut mille octets : ce que le composant affiche et ce que vous réglez sont alors le même nombre.",
    },
    totalSize: {
      title: 'Taille totale et nombre',
      text: "Les deux limites qui portent sur la sélection et non sur un fichier : ce qu'elle peut peser en tout, et combien de fichiers elle peut contenir. Toutes deux comptent ce qui est déjà dans la liste, elles mordent donc encore au second dépôt. Le filtrage se fait dans un ordre fixe, le type, puis la taille, puis le nombre, puis la taille totale, et c'est lui qui décide de la raison avec laquelle revient un fichier qui enfreint plusieurs règles à la fois.",
    },
    states: {
      title: 'États',
      text: 'Une zone en lecture seule montre ce qui a été pris et ne laisse rien y changer : pas de dialogue, pas de dépôt, et les boutons de retrait désactivés avec le reste. Une zone désactivée grise par les tokens de couleur et cesse de rien accepter, y compris en plein glissement, le garde étant relu au moment où le fichier se pose plutôt que lié une fois pour toutes au départ.',
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
