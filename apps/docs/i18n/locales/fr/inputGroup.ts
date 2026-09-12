export default {
  title: 'Groupe de champs',
  lead: 'Réunit deux contrôles de formulaire ou plus en un seul objet : un indicatif pays contre un numéro de téléphone, un champ de recherche contre son bouton. Les bordures partagées se fondent en un seul trait et seules les deux extrémités de la rangée restent arrondies.',

  examples: {
    multipleInputs: {
      title: 'Plusieurs champs dans une rang�e',
      text: 'Une rangée prend autant de segments que nécessaire. Chaque segment portant un champ prend une part égale de ce qui reste, les autres gardant leur largeur naturelle.',
    },
    naming: {
      title: 'Nommer la rangée et ses segments',
      text: "Le groupe rend un seul <code>label</code> et un seul <code>hint</code> pour toute la rangée. Chaque segment demande alors son propre <code>aria-label</code>, et celui qui apporte son <code>label</code> fait l'objet d'un avertissement en développement.",
    },
    widths: {
      title: 'Largeurs',
      text: "Les proportions se posent sur le segment lui-même, par une classe ou un <code>flex</code> en ligne. Une règle de votre application n'est pas en couche, elle l'emporte donc sur la part distribuée par le groupe.",
    },
    withButton: {
      title: 'Un champ et son bouton',
      text: 'Un bouton <code>solid</code> ou <code>soft</code> couvre le bord partagé avec son propre fond, et un bouton <code>outline</code> en <code>tone="neutral"</code> dessine la même couleur de bordure que les champs. Un bouton <code>ghost</code> n\'a aucun cadre : c\'est la seule variante à éviter ici.',
    },
    sizes: {
      title: 'Taille et densité',
      text: "<code>size</code> et <code>compact</code> se posent sur la rangée et atteignent chaque segment, en l'emportant sur ce qu'un segment demande pour lui-même.",
    },
    states: {
      title: 'États',
      text: "Un groupe sans aucune prop de forme laisse chaque segment exactement tel qu'il était. <code>disabled</code> s'ajoute au lieu de remplacer : un segment coupé de lui-même le reste sous une rangée qui ne dit rien.",
    },
    pickers: {
      title: 'Deux champs qui ouvrent un panneau',
      text: "Chaque panneau est ancré à la boîte de son propre champ, il s'ouvre donc sous le segment auquel il appartient et non sous le groupe. Les boutons que contient un panneau ne sont pas des segments de la rangée et gardent la taille que leur composant leur a donnée.",
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
