export default {
  title: 'Zone de texte',
  lead: "Un champ de texte multiligne, avec le même décor que VInput : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur et bouton d'effacement. Il peut grandir à mesure que le texte est saisi.",

  examples: {
    labelAndHint: {
      title: 'Libellé et indication',
      text: '<code>label</code> est un vrai <code>&lt;label&gt;</code> lié au champ : cliquer les mots place le curseur dans la boîte. <code>hint</code> passe sous le champ et lui est lié par <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> pose les rembourrages, l'échelle typographique et les icônes, jamais la hauteur, qui vient de <code>rows</code>. <code>compact</code> retire 4px aux rembourrages à chacune des trois tailles.",
    },
    icons: {
      title: 'Icônes',
      text: "<code>iconStart</code> et <code>iconEnd</code> posent une icône décorative à chaque extrémité, sur la première ligne plutôt qu'au milieu de la boîte. Le slot <code>#end</code> remplace l'icône de fin, là où <code>#start</code> est rendu après l'icône de début plutôt qu'à sa place.",
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: "Un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> transforme l'icône en vrai bouton, qui demande alors son libellé. Chaque bouton est son propre arrêt de tabulation et reste hors de la zone de saisie.",
    },
    clearable: {
      title: 'Effaçable',
      text: "<code>clearable</code> ajoute une croix qui vide le champ, affichée tant qu'il y a quelque chose à vider et que le champ est modifiable. L'appuyer rend aussitôt le focus à la zone de saisie, et <code>clear</code> est émis après coup.",
    },
    counters: {
      title: 'Compteurs',
      text: "<code>counter</code> passe sous le champ, à côté du texte d'aide. Face à <code>maxlength</code>, le navigateur refuse tout ce qui dépasse la limite, là où <code>softLimit</code> laisse le lecteur continuer : le compteur passe au rouge et le champ se déclare invalide par la validité native.",
    },
    autoGrow: {
      title: 'Croissance automatique',
      text: '<code>rows</code> donne au champ sa hauteur de départ, et par défaut sa hauteur tout court. <code>autoGrow</code> laisse la boîte grandir à mesure que le texte est saisi, en CSS pur.',
    },
    states: {
      title: 'États',
      text: "<code>invalid</code> sert à une règle que le navigateur ne peut pas vérifier lui-même. <code>disabled</code> grise le champ par les tokens de couleur. <code>readonly</code> reste focalisable et copiable, et masque la croix. <code>loading</code> place un indicateur là où va l'icône de fin, le champ restant utilisable.",
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
        clearVisible:
          "Décide si la croix est affichée, au lieu de laisser le champ le déduire de son propre contenu, champ en lecture seule compris. C'est la même échappatoire que celle de VInput, pour les composants bâtis dessus qui tiennent ailleurs que dans le texte ce qu'il y a à effacer.",
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
        valueEnd:
          "Des contrôles à vous à l'intérieur du champ, placés avant ceux que le champ possède : la croix d'effacement et l'icône qui ouvre le panneau. Ces deux-là sont l'affordance propre du composant, ce qui explique l'absence de slot <code>end</code> ici.",
      },
    },
  },
}
