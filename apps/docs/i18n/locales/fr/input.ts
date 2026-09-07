export default {
  title: 'Champ de saisie',
  lead: "Un champ de texte complet : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur de caractères, bouton d'effacement et état de chargement, le tout autour d'un vrai <code>&lt;input&gt;</code>.",

  examples: {
    labelAndHint: {
      title: 'Libellé et indication',
      text: "Le libellé est lié au champ : cliquer dessus place le curseur dans la saisie. L'indication se pose sous le champ et lui est liée elle aussi, par <code>aria-describedby</code>, ce qui fait qu'un lecteur d'écran l'énonce après le libellé au lieu de la laisser traîner à côté comme un texte quelconque. Les deux sont de simples props ; un <code>id</code> à vous l'emporte sur celui que le composant se génère.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs, 32, 40 et 48 pixels, moyenne par défaut. <code>compact</code> retire 4 pixels à n'importe laquelle et laisse le rembourrage, le texte et les icônes exactement où ils étaient : c'est ainsi qu'un formulaire se densifie sans rapetisser ce qui y est écrit. Les crans très petit et très grand de l'échelle ne sont volontairement pas proposés ici : 24 pixels sont trop courts pour un texte que l'on modifie, et 56 sortent de la forme d'un formulaire.",
    },
    icons: {
      title: 'Icônes',
      text: "Une icône dans le champ, à l'une ou l'autre extrémité. Les deux sont décoratives : pas de libellé, pas de focus, rien d'annoncé, ce qui est la bonne forme pour une loupe qui dit à quoi sert le champ ou une coche qui rapporte un état. Attacher un écouteur de clic est ce qui en fait un bouton, et c'est la section plus bas. Le slot <code>#end</code> remplace l'icône de fin quand ce qu'il y faut n'est pas une icône ; <code>#start</code> est rendu après l'icône de début plutôt qu'à sa place, ce qui permet à un champ bâti sur celui-ci de montrer les deux.",
    },
    clearable: {
      title: 'Effaçable',
      text: "Une croix qui vide le champ. Elle ne se montre que s'il y a quelque chose à effacer et que le champ est modifiable, et l'appuyer rend le focus à la saisie sur-le-champ : la croix disparaît dans le même instant, et le focus retomberait sinon sur la page. Elle est dessinée avant l'icône de fin, si bien qu'un champ peut être effaçable et porter tout de même un contrôle à lui. Pour les champs dont la valeur n'est pas leur texte, une liste déroulante qui porte des puces ou un sélecteur rempli par un panneau, c'est <code>clearVisible</code> qui répond à la question.",
    },
    states: {
      title: 'États',
      text: "Un champ désactivé grise par les tokens de couleur et quitte l'ordre de tabulation. Un champ en lecture seule reste focalisable et copiable, et cache sa croix d'effacement sauf mention contraire. <code>invalid</code> sert à une règle que le navigateur ne sait pas vérifier seul, un nom déjà pris par exemple : tout ce que la validation native voit colore déjà le champ sans elle, une fois que le lecteur en est sorti. <code>loading</code> pose un indicateur d'attente à la place de l'icône de fin et s'annonce.",
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: "Une icône devient un vrai bouton dès qu'un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> lui est attaché. Rien d'autre ne change, même prop et même place dans le champ. Ce qu'il lui faut à partir de là, c'est un libellé, un bouton qui ne porte qu'une icône n'ayant aucun texte pour le nommer, et le composant le signale en développement quand il manque.",
    },
    counters: {
      title: 'Compteurs',
      text: "Le compteur se tient au bout du champ : 12/20 face à une limite, ou simplement 12 sans limite. <code>maxlength</code> seul est la limite dure du navigateur, qui refuse purement et simplement la frappe au-delà. <code>softLimit</code> en fait une ligne que le lecteur a le droit de franchir : le texte n'est jamais coupé, le compteur passe au rouge, et le champ entre en erreur par la validité native, si bien que le formulaire refuse de s'envoyer au lieu de tronquer en silence ce qui a été écrit.",
    },
    pattern: {
      title: 'Motif',
      text: "Il n'y a pas de prop <code>pattern</code>. C'est l'attribut natif, et il atteint la saisie par la retransmission des attributs, avec <code>inputmode</code>, <code>title</code>, <code>name</code> et tout ce dont un formulaire a besoin : la vérification est donc celle du navigateur et ne coûte rien ici. Le champ rougit par <code>:user-invalid</code>, qui attend que le lecteur en soit sorti : un code postal n'est pas faux tant qu'on est en train de le taper.",
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
