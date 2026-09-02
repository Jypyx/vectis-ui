export default {
  title: 'Champ de fichiers',
  lead: 'La sélection de fichiers en champ de formulaire : un champ de texte en lecture seule par-dessus un champ fichier masqué, qui accepte aussi un dépôt. La valeur est toujours une liste de fichiers, que plusieurs soient permis ou non.',

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
        droppable:
          'Accepte les fichiers déposés sur le composant, en plus de ceux choisis par la boîte de dialogue.',
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
        clearable: 'Propose une croix qui vide la sélection.',
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
