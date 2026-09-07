export default {
  title: 'Zone de texte',
  lead: "Un champ de texte multiligne, avec le même décor que VInput : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur et bouton d'effacement. Il peut grandir à mesure que le texte est saisi.",

  examples: {
    labelAndHint: {
      title: 'Libellé et indication',
      text: "Le libellé est un vrai <code>&lt;label&gt;</code> lié au champ, donc cliquer les mots place le curseur dans la boîte. L'indication se place sous le champ et lui est liée elle aussi, par <code>aria-describedby</code>, ce qui la fait lire après le libellé au lieu de la laisser traîner sur la page comme un texte isolé. Les deux sont des props et non des slots : ce qu'elles portent est une phrase, et le champ en a besoin sous forme de chaîne pour la désigner.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois tailles, les trois mêmes que propose chaque champ de texte de la bibliothèque. Une taille fixe le rembourrage, l'échelle typographique et les icônes, jamais la hauteur : celle-là vient de <code>rows</code>. <code>compact</code> retire 4px de rembourrage à n'importe laquelle des trois, pour un formulaire dense, et laisse le nombre de lignes et la typographie où ils étaient.",
    },
    icons: {
      title: 'Icônes',
      text: "Une icône à l'une ou l'autre extrémité du champ, ou aux deux. Elles sont décoratives ici, donc le champ garde le nom que lui donne son libellé. Elles se posent sur la première ligne plutôt qu'au milieu de la boîte, ce qui les garde au niveau du début du texte dans un champ de plusieurs lignes. Le slot <code>#end</code> remplace l'icône de fin quand ce qui va là n'est pas une icône ; <code>#start</code> est rendu après l'icône de début plutôt qu'à sa place, comme dans <code>VInput</code>.",
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: "Une icône devient un vrai bouton dès qu'un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> est attaché, et il lui faut alors un libellé, seule chose qui nomme ce bouton. Oubliez-le et le champ le signale en développement. Chaque bouton est son propre arrêt de tabulation, avant ou après le texte selon le côté où il se trouve, et il reste en dehors de la zone de texte, donc la saisie n'est jamais interrompue par lui.",
    },
    clearable: {
      title: 'Effaçable',
      text: "La croix apparaît quand il y a quelque chose à effacer et que le champ est modifiable, elle est donc absente tant que le champ est vide, désactivé ou en lecture seule. L'appuyer vide la valeur et rend aussitôt le focus à la zone de texte : la croix s'en va avec le texte, et sans cela un utilisateur au clavier resterait posé sur rien. L'événement <code>clear</code> est émis après coup, le champ déjà vide.",
    },
    counters: {
      title: 'Compteurs',
      text: "Le compteur se place sous le champ, à côté de l'indication, là où plusieurs lignes de texte lui rentreraient dedans à l'intérieur de la boîte. Face à <code>maxlength</code>, il affiche 12/80 et le navigateur refuse tout ce qui dépasse la limite. <code>softLimit</code> transforme ce refus en erreur : le lecteur peut continuer à écrire, le compteur passe au rouge, et le champ se déclare invalide par la validité native, si bien que le formulaire ne peut pas être envoyé au-delà de la limite. Sans aucune limite, le compteur ne fait que compter.",
    },
    autoGrow: {
      title: 'Croissance automatique',
      text: "<code>rows</code> donne au champ sa hauteur de départ, et par défaut c'est sa hauteur tout court : au-delà, le texte défile. <code>autoGrow</code> laisse la boîte grandir à mesure que le texte est saisi. C'est du CSS pur, par <code>field-sizing</code>, donc rien n'est mesuré et aucun JavaScript ne tourne ; un navigateur qui ne l'a pas garde la hauteur fixe et sa barre de défilement, ce qui donne un champ plus petit et non un champ cassé.",
    },
    states: {
      title: 'États',
      text: "Invalide, désactivé, lecture seule, chargement. <code>invalid</code> sert à une règle que le navigateur ne sait pas vérifier seul, un nom déjà pris ou tout ce que seul le serveur connaît ; la validité native est prise en charge sans lui. Un champ désactivé se grise par les tokens de couleur plutôt que par une opacité, donc son texte garde son contraste. Un champ en lecture seule peut encore être focalisé et copié, c'est toute la différence, et il masque la croix d'effacement. Le chargement pose un spinner là où va l'icône de fin, et le champ reste utilisable pendant qu'il tourne.",
    },
  },

  api: {
    VTextarea: {
      props: {
        size: 'La taille du champ, qui fixe son rembourrage, son échelle typographique et ses icônes.',
        compact:
          'Retire 4px au champ en resserrant son rembourrage, en laissant le nombre de lignes, la typographie et les icônes tels quels.',
        rows: "Combien de lignes de texte le champ affiche, l'attribut natif <code>rows</code>, qui est ce qui donne sa hauteur au champ. Tout ce qui est sous 1 est ramené à 1, et à 1 le champ fait exactement la hauteur d'un VInput de même taille.",
        autoGrow:
          "Laisse le champ grandir à mesure que le texte est saisi, au lieu de défiler dans la hauteur que <code>rows</code> lui donne, qui reste sa hauteur de départ. C'est du CSS pur : là où le navigateur ne le prend pas en charge, le champ se comporte comme une zone de texte ordinaire.",
        invalid:
          "Marque le champ comme invalide quoi qu'en pense le navigateur, la voie pour une règle que seul le serveur peut vérifier.",
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        readonly:
          "Montre le texte sans permettre de le changer. Le champ peut toujours être focalisé et copié, et le bouton d'effacement est masqué.",
        label: "Le libellé au-dessus du champ, lié à lui pour qu'un clic dessus y place le focus.",
        hint: "Une ligne d'aide sous le champ, liée à la zone de texte pour les technologies d'assistance afin d'être lue avec le libellé.",
        iconStart:
          "Une icône dans le champ, au début. Elle est décorative jusqu'à ce qu'un écouteur <code>@click:icon-start</code> soit attaché : elle devient alors un vrai bouton et demande <code>iconStartLabel</code>.",
        iconEnd:
          "La même chose à la fin du champ. Le slot <code>#end</code> la remplace, et l'indicateur de chargement prend sa place pendant qu'il tourne.",
        iconStartLabel: "Ce que fait l'icône de début, en mots, une fois qu'elle est cliquable.",
        iconEndLabel: "Ce que fait l'icône de fin, en mots, une fois qu'elle est cliquable.",
        loading:
          "Affiche un indicateur à la fin du champ, à la place de l'icône ou du slot de fin.",
        loadingLabel:
          "Ce que les lecteurs d'écran annoncent pendant que l'indicateur tourne. Il retombe sur le dictionnaire du design system.",
        clearable:
          'Propose une croix qui vide le champ. Elle apparaît quand il y a quelque chose à effacer et que le champ est modifiable.',
        clearLabel:
          "Ce que fait le bouton d'effacement, en mots. Il retombe sur le dictionnaire du design system.",
        maxlength:
          "Le nombre maximum de caractères. Par défaut c'est la limite du navigateur lui-même, qui refuse simplement tout ce qui la dépasse.",
        softLimit:
          "Transforme cette limite en limite souple : le lecteur peut taper au-delà, et le champ passe en erreur au lieu de refuser les frappes en silence. C'est rapporté par la validité native, donc un formulaire ne peut pas être envoyé au-dessus de la limite.",
        counter:
          'Affiche ce qui a été saisi, sous le champ : 12/80 face à une limite, ou simplement 12 sans limite.',
        vModel: 'Le texte du champ, vide au départ.',
      },
      events: {
        clear: "Le bouton d'effacement a été pressé. La valeur est déjà vidée.",
        clickIconStart:
          "L'icône de début a été pressée. Attacher cet écouteur est ce qui en fait un bouton.",
        clickIconEnd:
          "L'icône de fin a été pressée. Attacher cet écouteur est ce qui en fait un bouton.",
      },
      slots: {
        start:
          "Du contenu au début du champ, rendu après <code>iconStart</code> plutôt qu'à sa place.",
        end: "Du contenu à la fin du champ, qui remplace <code>iconEnd</code>. Il est masqué pendant le chargement, l'indicateur prenant cette place.",
      },
    },
  },
}
