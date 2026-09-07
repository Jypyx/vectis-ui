export default {
  title: 'Champ de fichiers',
  lead: 'La sélection de fichiers en champ de formulaire : un champ de texte en lecture seule par-dessus un champ fichier masqué, qui accepte aussi un dépôt. La valeur est toujours une liste de fichiers, que plusieurs soient permis ou non.',

  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: "Le champ visible est un <code>VInput</code> en lecture seule : <code>label</code> et <code>hint</code> s'y comportent comme sur n'importe quel autre champ, et le libellé lui donne le focus au clic. <code>placeholder</code> est ce qu'il affiche tant que rien n'est choisi ; omis, il retombe sur le dictionnaire. Le trombone à la fin ouvre la boîte de dialogue du système, et le champ accepte aussi un fichier déposé n'importe où sur lui.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs, 32, 40 et 48 pixels, chacune avec sa paire <code>compact</code> plus courte de 4px. Les puces d'un fichier choisi se placent un cran sous le champ, et le champ force son texte à leur hauteur pour que la ligne ne grandisse pas au moment où quelque chose est ajouté.",
    },
    multiple: {
      title: 'Fichiers multiples',
      text: "Désactivé, un second fichier est refusé plutôt que de remplacer le premier. Activé, le champ en prend autant que les limites l'autorisent. Le modèle est un tableau de <code>File</code> dans les deux cas : la forme ne suit pas la prop, donc rien en aval n'a à deviner ce qu'il tient.",
    },
    clearable: {
      title: 'Effacement',
      text: "La croix vide toute la sélection d'un coup. Elle vaut plus la peine ici que sur un champ ordinaire : ce que contient un champ de fichiers ne peut pas s'effacer en tapant, donc sans elle un mauvais choix ne sort qu'une puce à la fois, et en affichage texte il ne sort pas du tout.",
    },
    display: {
      title: 'Affichage',
      text: "Les noms joints par des virgules sur une ligne, ou une puce supprimable pour chacun. Le libellé d'une puce est raccourci au MILIEU et non à la fin, si bien que l'extension survit et que deux fichiers du même dossier restent distinguables ; le nom complet reste sur l'infobulle et dans le bouton de retrait. Le slot <code>#chip</code> remplace la puce et reçoit ce libellé raccourci, <code>remove</code>, ainsi que la taille et la densité calculées par le champ, dont rien ne se devine de l'extérieur.",
    },
    perFileLimits: {
      title: 'Limites par fichier',
      text: "<code>accept</code> reprend la syntaxe du navigateur et s'applique deux fois, et il le faut : en attribut, ce qui filtre la boîte de dialogue du système, puis en code, seule chose capable de filtrer un fichier DÉPOSÉ sur le champ. Écrivez les extensions à côté des familles MIME, un fichier dont le système n'a pas deviné le type arrivant avec un type vide. <code>maxSize</code> borne un fichier. Ce sont des limites et non des avertissements : un fichier refusé n'entre jamais dans le modèle, et <code>reject</code> se déclenche une fois par fichier, si bien qu'un dépôt groupé est rapporté précisément.",
    },
    selectionLimits: {
      title: 'Limites de sélection',
      text: "<code>maxFiles</code> et <code>maxTotalSize</code> bornent la sélection dans son ensemble plutôt que chaque fichier. Le filtrage s'exécute dans un ordre fixe, le type puis la taille puis le nombre puis la taille totale : un fichier refusé pour son type n'est donc jamais rapporté aussi comme étant en trop. Le message est à vous : le composant refuse les fichiers et dit lesquels et pourquoi, sans jamais en afficher un mot.",
    },
    counter: {
      title: 'Compteur',
      text: "Une ligne sous le champ qui dit ce qui a été choisi, à droite de l'aide. La phrase est traduite et accordée, et la taille est écrite dans les unités qu'<code>Intl</code> désigne réellement, en base 1000. Le slot <code>#counter</code> la remplace et reçoit le nombre et le total en octets, avec la phrase déjà construite, pour qu'une formulation à vous n'ait pas à reconstruire ce qu'elle ne fait que reformuler.",
    },
    customIcon: {
      title: 'Icône personnalisée',
      text: "<code>attachIcon</code> est le glyphe qui, à la fin du champ, ouvre la boîte de dialogue, et il accepte les mêmes valeurs que toutes les props d'icône de la bibliothèque. Le nommer d'après ce que le champ accepte en dit plus qu'un trombone, ce qui vaut la peine partout où le libellé seul laisse un doute sur le type de fichier attendu.",
    },
    states: {
      title: 'États',
      text: "Invalide sert à une règle à vous, rien ici n'étant vérifié par le navigateur. La lecture seule laisse la sélection visible et refuse toutes les façons de la changer, la boîte de dialogue, le dépôt et le retrait. Désactivé grise le champ par les jetons de couleur et le sort de l'ordre de tabulation. <code>noDrop</code> est plus étroit que les deux : la boîte de dialogue s'ouvre toujours, et seul le dépôt est refusé.",
    },
  },

  api: {
    VFileInput: {
      props: {
        multiple:
          'Permet de choisir plusieurs fichiers. Avec un seul, tout fichier supplémentaire est écarté.',
        accept:
          "Quels genres de fichiers sont acceptés, dans la syntaxe du navigateur. C'est appliqué DEUX FOIS, et il le faut : en attribut, ce qui filtre la boîte de dialogue du système, et de nouveau en code, seule chose capable de filtrer un fichier DÉPOSÉ.",
        display:
          'Comment les fichiers choisis sont montrés : leurs noms joints par des virgules, ou une puce retirable chacun. Cela ne signifie quelque chose que si plusieurs fichiers sont permis ; un nom seul est toujours du texte.',
        maxSize: "La taille maximale d'UN fichier, en octets.",
        maxTotalSize: 'La taille maximale de toute la sélection, en octets.',
        maxFiles: 'Combien de fichiers peuvent être choisis au plus.',
        counter: 'Affiche ce qui a été choisi sous le champ, « 3 fichiers (1,2 Mo) ».',
        attachIcon: "L'icône en fin de champ, qui ouvre la boîte de dialogue de fichiers.",
        noDrop:
          'Refuse les fichiers déposés sur le composant : seule la boîte de dialogue en ajoute alors.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        readonly:
          'Montre ce qui a été choisi sans permettre de le changer : ni boîte de dialogue, ni dépôt, ni retrait.',
        invalid:
          "Marque le champ comme invalide, pour une règle à vous, puisque rien ici n'est vérifié par le navigateur.",
        label: "Le libellé au-dessus du champ, lié à lui pour qu'un clic dessus y place le focus.",
        hint: "Une ligne d'aide sous le champ, à gauche du compteur. Elle est liée au champ pour les technologies d'assistance.",
        placeholder:
          "Ce que dit le champ tant que rien n'est choisi. Il retombe sur le dictionnaire du design system.",
        clearable:
          "Propose une croix qui vide la sélection. Elle vaut plus la peine ici que sur un champ ordinaire : ce que contient un sélecteur ne s'efface pas en tapant, la croix est donc le seul retour en arrière après un mauvais choix.",
        vModel:
          "Toujours une LISTE de fichiers, que plusieurs soient permis ou non, jamais un fichier seul. La forme ne dépend pas d'une prop : vous n'avez donc jamais à restreindre une union que TypeScript ne sait pas discriminer.",
      },
      events: {
        change: "La sélection a changé, avec toute la liste telle qu'elle est désormais.",
        reject:
          'Un fichier a été écarté, avec lequel et pourquoi : son genre, sa taille, ou combien il y en avait déjà.',
        clear: "La croix d'effacement a été pressée. La sélection est déjà vide.",
      },
      slots: {
        chip: 'Remplace la puce qui représente un fichier. Elle reçoit le nom déjà raccourci AU MILIEU pour que son extension survive, <code>remove</code>, sans quoi le fichier ne pourrait plus être retiré, et la taille et la densité calculées pour tenir dans le champ.',
        counter:
          'Remplace le compteur sous le champ. <code>text</code> est la phrase déjà construite et traduite ; le nombre et la taille totale sont là pour une formulation à vous.',
      },
    },
  },
}
