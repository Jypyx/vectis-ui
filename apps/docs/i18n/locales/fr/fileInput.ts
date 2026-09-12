export default {
  title: 'Champ de fichiers',
  lead: 'La sélection de fichiers en champ de formulaire : un champ de texte en lecture seule par-dessus un champ fichier masqué, qui accepte aussi un dépôt. La valeur est toujours une liste de fichiers, que plusieurs soient permis ou non.',

  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: "<code>label</code>, <code>hint</code> et <code>placeholder</code> se comportent comme sur n'importe quel autre champ. <code>iconStart</code> pose une icône au début du champ, rendue avant les puces et non à leur place.",
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la hauteur du champ à 32, 40 ou 48 pixels, et <code>compact</code> lui retire 4px. Les puces des fichiers choisis se placent un palier en dessous du champ.',
    },
    multiple: {
      title: 'Fichiers multiples',
      text: '<code>multiple</code> permet au champ de prendre plusieurs fichiers. Le modèle est un tableau de <code>File</code> dans les deux cas.',
    },
    clearable: {
      title: 'Effacement',
      text: "<code>clearable</code> ajoute une croix qui vide toute la sélection d'un coup.",
    },
    display: {
      title: 'Affichage',
      text: '<code>display</code> liste les fichiers en noms séparés par des virgules, ou en une puce supprimable chacun. Le slot <code>#chip</code> remplace une puce et reçoit son libellé raccourci, <code>remove</code>, ainsi que la taille et la densité calculées par le champ.',
    },
    perFileLimits: {
      title: 'Limites par fichier',
      text: "<code>accept</code> accepte la syntaxe du navigateur et filtre la boîte de dialogue système comme un fichier déposé sur le champ. <code>maxSize</code> borne un fichier. Un fichier refusé n'entre jamais dans le modèle, et <code>reject</code> est émis une fois par fichier.",
    },
    selectionLimits: {
      title: 'Limites de sélection',
      text: '<code>maxFiles</code> et <code>maxTotalSize</code> bornent la sélection dans son ensemble. Le filtrage suit un ordre fixe : type, puis taille, puis nombre, puis taille totale.',
    },
    counter: {
      title: 'Compteur',
      text: '<code>counter</code> ajoute une ligne sous le champ indiquant ce qui a été choisi. Le slot <code>#counter</code> la remplace et reçoit le nombre, le total en octets et la phrase déjà construite.',
    },
    customIcon: {
      title: 'Icône personnalisée',
      text: "<code>attachIcon</code> est le glyphe en fin de champ qui ouvre la boîte de dialogue système, et il accepte toute valeur d'icône.",
    },
    states: {
      title: 'États',
      text: "<code>invalid</code> marque le champ en erreur. <code>readonly</code> garde la sélection visible et refuse toute façon de la changer. <code>disabled</code> grise le champ et le sort de l'ordre de tabulation. <code>noDrop</code> n'écarte que le dépôt, et <code>loading</code> est purement visuel, un indicateur remplaçant l'icône de pièce jointe. <code>attachIconLabel</code>, <code>clearLabel</code> et <code>loadingLabel</code> renomment ce que chacun annonce.",
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
        iconStart:
          "Une icône dans le champ, au début. Elle est rendue avant les chips et non à leur place. Décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> en fasse un bouton.",
        iconStartLabel: "Ce que fait l'icône de début, en mots, une fois cliquable.",
        attachIconLabel:
          "Ce que fait l'icône de fin, en mots. Elle nomme le bouton qui ouvre la boîte de dialogue de fichiers, et sa valeur par défaut vient du dictionnaire du design system.",
        loading:
          "Affiche une roue à la place de l'icône de trombone, pendant un envoi. Elle ne change rien d'autre : les fichiers se déposent toujours et la boîte de dialogue s'ouvre toujours.",
        loadingLabel:
          "Ce que les lecteurs d'écran annoncent pendant que la roue tourne. Sa valeur par défaut vient du dictionnaire du design system.",
        clearable:
          "Propose une croix qui vide la sélection. Elle vaut plus la peine ici que sur un champ ordinaire : ce que contient un sélecteur ne s'efface pas en tapant, la croix est donc le seul retour en arrière après un mauvais choix.",
        clearLabel:
          'Ce que fait cette croix, en mots. Sa valeur par défaut vient du dictionnaire du design system.',
        vModel:
          "Toujours une LISTE de fichiers, que plusieurs soient permis ou non, jamais un fichier seul. La forme ne dépend pas d'une prop : vous n'avez donc jamais à restreindre une union que TypeScript ne sait pas discriminer.",
      },
      events: {
        change: "La sélection a changé, avec toute la liste telle qu'elle est désormais.",
        reject:
          'Un fichier a été écarté, avec lequel et pourquoi : son genre, sa taille, ou combien il y en avait déjà.',
        clear: "La croix d'effacement a été pressée. La sélection est déjà vide.",
        remove:
          "UN fichier a été retiré par sa puce, avec le fichier et la position qu'il occupait. <code>change</code> suit avec toute la liste.",
        clickIconStart:
          "L'icône de début a été cliquée. Attacher cet écouteur est ce qui en fait un vrai bouton, qui demande alors <code>iconStartLabel</code>.",
      },
      slots: {
        chip: 'Remplace la puce qui représente un fichier. Elle reçoit le nom déjà raccourci AU MILIEU pour que son extension survive, <code>remove</code>, sans quoi le fichier ne pourrait plus être retiré, et la taille et la densité calculées pour tenir dans le champ.',
        counter:
          'Remplace le compteur sous le champ. <code>text</code> est la phrase déjà construite et traduite ; le nombre et la taille totale sont là pour une formulation à vous.',
        valueEnd:
          "Des contrôles à vous à l'intérieur du champ, placés avant ceux que le champ possède : la croix d'effacement et l'icône qui ouvre le panneau. Ces deux-là sont l'affordance propre du composant, ce qui explique l'absence de slot <code>end</code> ici.",
        start:
          "Du contenu au début du champ, rendu après <code>iconStart</code> plutôt qu'à sa place.",
      },
    },
  },
}
