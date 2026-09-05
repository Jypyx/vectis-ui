export default {
  title: 'Groupe de champs',
  lead: 'Réunit deux contrôles de formulaire ou plus en un seul objet : un indicatif pays contre un numéro de téléphone, un champ de recherche contre son bouton. Les bordures partagées se fondent en un seul trait et seules les deux extrémités de la rangée restent arrondies.',

  examples: {
    naming: {
      title: 'Nommer la rangée et ses segments',
      text: "Le groupe rend un seul libellé et une seule aide pour toute la rangée, et s'en sert comme nom accessible. Chaque segment a ensuite besoin d'un nom propre, ce à quoi sert <code>aria-label</code>. Un segment qui apporte son propre <code>label</code> se retrouve décalé d'une ligne hors de la rangée, ce que le composant signale en développement.",
    },
    widths: {
      title: 'Largeurs',
      text: "Chaque segment contenant un champ prend une part égale de la rangée, et tout le reste garde sa largeur naturelle : un bouton est mesuré par son libellé. Les proportions se règlent sur le segment lui-même, avec une classe ou un <code>flex</code> en ligne. Une règle du consommateur n'est pas dans une couche, elle l'emporte donc sur la part que le groupe distribue.",
    },
    search: {
      title: 'Un champ et son bouton',
      text: "Un bouton <code>solid</code> ou <code>soft</code> recouvre l'arête partagée de son propre fond, ce qui est exactement le rendu attendu d'une action rattachée. Un bouton <code>outline</code> en <code>tone=\"neutral\"</code> dessine la même couleur de bordure que les champs, si bien que le contour fait le tour de la rangée sans rupture. Un bouton <code>ghost</code> n'a aucun cadre et flotte hors de la boîte : c'est la seule variante à éviter ici. Une loupe à l'intérieur du champ est autre chose et n'est pas un segment : c'est <code>iconEnd</code> avec un écouteur <code>click:icon-end</code> sur le champ lui-même.",
    },
    sizes: {
      title: 'Taille et densité',
      text: "La hauteur et la densité se posent sur la rangée et atteignent chaque segment. Elles sont la forme du contrôle, donc la rangée l'emporte sur ce qu'un segment demande pour lui-même : un segment d'une autre hauteur cesse de s'aligner sur ses voisins et la bordure fondue ne se lit plus comme un seul objet.",
    },
    states: {
      title: 'États',
      text: "Un groupe qui ne pose aucune des trois props de forme laisse chaque segment exactement tel qu'il était, ce qui fait d'un groupe nu un simple habillage visuel. <code>disabled</code> s'ajoute au lieu de remplacer : un segment éteint de lui-même le reste sous une rangée qui ne dit rien. Un champ en erreur garde son arête rouge contre son voisin, et un champ focalisé passe au-dessus des deux pour que son anneau soit dessiné en entier.",
    },
    panels: {
      title: 'Les champs qui ouvrent un panneau',
      text: "Le panneau d'un combobox est mesuré sur son propre segment : un champ d'indicatif étroit ouvre donc une liste étroite. Un champ d'heure en format 12 heures porte un contrôle AM/PM à côté de lui, et dans un groupe les deux ne font qu'un segment. Les boutons que contient un panneau ne sont pas des segments de la rangée et gardent la taille que leur composant leur a donnée : la navigation d'un calendrier reste petite dans une grande rangée.",
    },
    scope: {
      title: "Ce qu'un groupe ne joint pas",
      text: "Une zone de texte n'est pas un segment. Sa boîte bordée est un autre élément, elle est donc laissée entièrement tranquille plutôt que peinte à moitié, et aucune rangée sensée ne joint une boîte multiligne à une boîte d'une seule ligne. Une rangée est une ligne de contrôles d'une seule ligne : un segment qui grandit, un combobox portant plusieurs valeurs par exemple, devient plus haut que ses voisins et la bordure fondue ne couvre alors que son sommet.",
    },
  },

  api: {
    VInputGroup: {
      props: {
        label:
          "Le libellé au-dessus de la rangée, rendu une seule fois pour tous ses segments et utilisé comme nom accessible du groupe. Un segment qui porte le sien se retrouve décalé, nommez donc chacun d'eux avec <code>aria-label</code>.",
        hint: "Une ligne d'aide sous la rangée, rattachée au groupe pour que les technologies d'assistance la lisent avec le libellé.",
        size: "La hauteur que prend chaque segment, quelle que soit celle qu'il nomme pour lui-même : une rangée de contrôles de deux hauteurs cesse de se lire comme un seul objet. Absente, chaque segment garde la sienne.",
        compact:
          'Retire 4px à la hauteur de chaque segment, comme <code>compact</code> le fait sur un champ isolé.',
        disabled:
          "Rend toute la rangée inutilisable. Cela s'ajoute à ce que dit chaque segment au lieu de le remplacer : un segment désactivé de lui-même le reste sous une rangée qui ne dit rien.",
      },
      slots: {
        default: 'Les champs et les boutons à joindre. Chacun est un segment de la rangée.',
      },
    },
  },
}
