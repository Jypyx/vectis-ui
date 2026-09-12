export default {
  title: 'Champ de saisie',
  lead: "Un champ de texte complet : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur de caractères, bouton d'effacement et état de chargement, le tout autour d'un vrai <code>&lt;input&gt;</code>.",

  examples: {
    labelAndHint: {
      title: 'Libellé et indication',
      text: "<code>label</code> s'affiche au-dessus du champ et y place le curseur au clic. <code>hint</code> s'affiche sous le champ et lui est lié par <code>aria-describedby</code>.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> définit la hauteur à 32, 40 ou 48 pixels, et <code>compact</code> retire 4px à l'une quelconque d'entre elles.",
    },
    icons: {
      title: 'Icônes',
      text: "<code>iconStart</code> et <code>iconEnd</code> posent une icône décorative à chaque extrémité du champ. Le slot <code>#end</code> remplace l'icône de fin, là où <code>#start</code> est rendu après l'icône de début plutôt qu'à sa place.",
    },
    clearable: {
      title: 'Effaçable',
      text: "<code>clearable</code> ajoute une croix qui vide le champ, affichée tant qu'il y a quelque chose à vider et que le champ est modifiable. <code>clearVisible</code> répond vous-même à cette question, pour un champ dont la valeur n'est pas son texte.",
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> grise le champ et le sort de l'ordre de tabulation. <code>readonly</code> le garde focalisable et copiable, et masque la croix sauf indication contraire. <code>invalid</code> sert à une règle que le navigateur ne peut pas vérifier lui-même, et <code>loading</code> place un indicateur là où va l'icône de fin.",
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: "Un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> transforme l'icône en vrai bouton, qui demande alors <code>iconStartLabel</code> ou <code>iconEndLabel</code>.",
    },
    counters: {
      title: 'Compteurs',
      text: "<code>counter</code> affiche la longueur au bout du champ. <code>maxlength</code> est la limite dure du navigateur, là où <code>softLimit</code> est une ligne que le lecteur peut franchir : le texte n'est jamais coupé, le compteur passe au rouge et le champ tombe en erreur par la validité native.",
    },
    pattern: {
      title: 'Motif',
      text: "Il n'y a pas de prop <code>pattern</code> : l'attribut natif atteint l'input par fallthrough, avec <code>inputmode</code>, <code>name</code> et tout ce dont un formulaire a besoin. Le champ passe au rouge par <code>:user-invalid</code>, une fois que le lecteur l'a quitté.",
    },
  },

  api: {
    VInput: {
      props: {
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        type: 'Le type natif du champ, qui est aussi ce qui indique à un téléphone quel clavier proposer : un pavé numérique pour <code>number</code>, une touche @ pour <code>email</code>.',
        invalid:
          "Marque le champ comme invalide quoi qu'en pense le navigateur. C'est la voie pour une règle que seul le serveur peut vérifier ; tout ce que le navigateur sait valider seul colore déjà le champ sans elle.",
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        readonly:
          "Montre la valeur sans permettre de la changer. Le champ peut toujours être focalisé et copié, et il masque le bouton d'effacement à moins que <code>clearVisible</code> ne réponde explicitement à cette question.",
        label: "Le libellé au-dessus du champ, lié à lui pour qu'un clic dessus y place le focus.",
        hint: "Une ligne d'aide sous le champ. Elle est liée au champ pour les technologies d'assistance, donc elle est lue avec le libellé.",
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
          "Décide si la croix est affichée, au lieu de laisser le champ le déduire de son propre contenu. Cette prop existe pour les composants bâtis sur celui-ci, où ce qu'il y a à effacer n'est pas le texte : VCombobox tient sa sélection en puces à côté du champ, et un sélecteur de date ou d'heure en lecture seule change sa valeur par un panneau plutôt qu'à la frappe.",
        clearLabel:
          "Ce que fait le bouton d'effacement, en mots. Il retombe sur le dictionnaire du design system.",
        maxlength:
          "Le nombre maximum de caractères. Par défaut c'est la limite du navigateur lui-même, qui refuse simplement tout ce qui la dépasse.",
        softLimit:
          "Transforme cette limite en limite souple : le lecteur peut taper au-delà, et le champ passe en erreur au lieu de refuser les frappes en silence. C'est rapporté par la validité native, donc un formulaire ne peut pas être envoyé au-dessus de la limite.",
        counter:
          'Affiche ce qui a été saisi, à la fin du champ : 12/80 face à une limite, ou simplement 12 sans limite.',
        vModel:
          'La valeur, typée en texte ou en nombre plutôt qu\'en texte seul. Sur un <code>&lt;input type="number"&gt;</code>, Vue convertit la valeur en nombre de lui-même : un modèle limité aux chaînes rendrait donc un nombre à qui lui a passé une chaîne.',
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
        valueEnd:
          "Vos propres contrôles dans le champ, placés avant ceux du champ lui-même : la croix d'effacement et l'icône de fin. C'est la place de ce qui agit sur la valeur, pour que l'ordre de lecture et l'ordre de tabulation coïncident.",
        end: "Du contenu à la fin du champ, qui remplace <code>iconEnd</code>. Il est masqué pendant le chargement, l'indicateur prenant cette place.",
      },
    },
  },
}
