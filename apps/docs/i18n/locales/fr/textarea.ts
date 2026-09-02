export default {
  title: 'Zone de texte',
  lead: "Un champ de texte multiligne, avec le même décor que VInput : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur et bouton d'effacement. Il peut grandir à mesure que le texte est saisi.",

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
        start: 'Du contenu au début du champ, qui remplace <code>iconStart</code>.',
        end: "Du contenu à la fin du champ, qui remplace <code>iconEnd</code>. Il est masqué pendant le chargement, l'indicateur prenant cette place.",
      },
    },
  },
}
