export default {
  title: 'Groupe de boutons',
  lead: "Assemble des boutons en un seul contrôle segmenté : bordures fusionnées, coins arrondis aux extrémités seulement. La rangée est un objet unique, donc c'est le groupe qui décide de son dessin, depuis le fait même d'assembler les boutons jusqu'à la variante, le ton, la taille et la densité que chacun d'eux reprend.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: "Les deux se nomment une fois sur le groupe, et chaque rangée ci-dessous est un ton : <code>accent</code>, puis <code>neutral</code>, puis <code>danger</code>, sur les quatre variantes que propose VButton. Les deux ne circulent pas de la même façon. La variante l'emporte sur celle donnée à un bouton, un segment d'une autre silhouette ne se lisant plus comme un morceau de la rangée ; le ton n'est qu'un repli, ce sur quoi l'exemple suivant s'appuie.",
    },
    toneOverride: {
      title: 'Un segment, un autre ton',
      text: "Le ton est la seule prop d'apparence qu'un bouton garde face à son groupe : il relève du sens et non de la forme, et une rangée d'actions en contient souvent exactement une qui détruit quelque chose. Ici la rangée est neutre et le dernier segment est seul à dire <code>danger</code>. Tout le reste demeure celui du groupe : l'action destructrice garde la hauteur, la variante et la densité de ses voisines.",
    },
    orientation: {
      title: 'Orientation',
      text: "Une rangée par défaut, une colonne avec <code>vertical</code>. L'assemblage suit l'axe : les bordures fusionnées et les coutures passent sur les arêtes horizontales, et les coins arrondis sont conservés en haut du premier segment et en bas du dernier. Une colonne étire en plus chaque segment sur toute sa largeur, si bien que les boutons s'alignent quelle que soit la longueur de leurs libellés.",
    },
    detached: {
      title: 'Séparés',
      text: "<code>detached</code> laisse les boutons séparés au lieu de les assembler : un écart entre eux, et chacun conserve ses propres coins et ses propres bordures. Tout ce que le groupe transmet circule toujours, et c'est la raison d'y recourir plutôt que de supprimer le groupe. Cela convient à une rangée d'actions sans lien qui partagent une apparence, là où un contrôle segmenté laisserait croire à un même choix décliné en trois.",
    },
    seamless: {
      title: 'Sans traits',
      text: "Une rangée assemblée dessine un trait à chaque joint, si bien que les segments se lisent comme des choix distincts. <code>seamless</code> retire ces traits : aucune couture n'est dessinée, et les bordures des deux côtés de chaque arête partagée sont effacées, ce qui laisse un cadre unique dont les arêtes extérieures restent intactes. Les deux côtés partent, jamais un seul : les segments se chevauchent d'un pixel, et une bordure laissée sur l'un ou l'autre transparaîtrait partout où le segment du dessus n'a pas de fond propre.",
    },
    elevated: {
      title: 'Surélevé',
      text: "L'ombre appartient à la rangée plutôt qu'à chaque segment : trois ombres qui se chevauchent tomberaient chacune sur la voisine qu'elle recouvre et dessineraient une bande sombre à chaque joint. Le groupe porte donc une seule ombre et les boutons renoncent à la leur, si bien que la rangée se soulève d'un bloc dès qu'on en survole une partie. Séparée, dans la troisième rangée, ce raisonnement disparaît avec le chevauchement et chaque bouton porte de nouveau la sienne.",
    },
    sizes: {
      title: 'Tailles',
      text: "Les cinq hauteurs de l'échelle partagée par tous les contrôles, nommées une fois sur le groupe : 24, 32, 40, 48 et 56 pixels. La taille l'emporte sur celle donnée à un bouton, un segment d'une autre hauteur ne s'alignant plus sur ses voisins.",
    },
    compact: {
      title: 'Compact',
      text: "Chaque paire ci-dessous est un palier de l'échelle, le second des deux étant <code>compact</code> : 4px partent de la hauteur de chaque segment et rien d'autre ne bouge. Comme pour la taille, c'est le groupe qui décide : une barre d'outils dense tient en une prop et non en une par bouton.",
    },
    fullWidth: {
      title: 'Pleine largeur',
      text: "La rangée fait la largeur de ses libellés tant qu'on ne lui dit rien d'autre. <code>fullWidth</code> l'étire sur son parent et donne à chaque segment une part égale de cette largeur, quels que soient les mots qui s'y trouvent, ce que réclame en général un contrôle segmenté posé sur une ligne à lui. Les parts sont des pistes de grille et non des bases flex : les trois sortent à la même largeur, qu'un segment soit un simple bouton ou un bouton enveloppé dans une infobulle ou une pastille. Un segment ne descend jamais sous la largeur de son propre libellé : une rangée de libellés trop longs pour le parent le déborde au lieu d'écraser un texte que rien ne pourrait ensuite tronquer.",
    },
    icons: {
      title: 'Avec des icônes',
      text: 'Les segments portent des icônes comme tout bouton, par <code>iconStart</code> et <code>iconEnd</code>. Un VIconButton est un segment lui aussi, et la seconde rangée en est le cas usuel : une barre de contrôles réduits à leur icône, qui prend <code>role="toolbar"</code> par les attributs de repli, le rôle <code>group</code> par défaut en disant moins. Chacun réclame toujours un <code>label</code>, le nom accessible qu\'un glyphe ne peut pas fournir.',
    },
    link: {
      title: 'Lien',
      text: "Un segment doté d'un <code>href</code> rend un <code>&lt;a&gt;</code>, et une rangée de tels segments est un jeu de destinations plutôt qu'un jeu d'actions : le clic du milieu, l'ouverture dans un nouvel onglet et la barre d'état du navigateur reviennent tous. La rangée est dessinée exactement comme avant, l'assemblage étant affaire de boîtes et non de ce que chacune se révèle être. Un lien désactivé est rendu inerte et pas seulement grisé : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
    },
    states: {
      title: 'États',
      text: "La première rangée est éteinte par le groupe, la seconde par ses propres boutons. <code>disabled</code> est la seule prop qui s'ajoute au lieu de trancher : une rangée qui ne dit rien laisse désactivé un bouton qui s'est désactivé lui-même, et un segment ne peut pas se réactiver une fois la rangée éteinte. <code>loading</code> reste propre au bouton, lui seul sachant ce qu'il attend.",
    },
  },

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'Le sens dans lequel les boutons sont assemblés : une rangée par défaut, ou une colonne avec <code>vertical</code>.',
        detached:
          'Laisse les boutons séparés, avec un écart entre eux et chacun gardant ses propres coins, au lieu de les assembler en contrôle segmenté. Tout ce que le groupe transmet circule toujours, et une rangée surélevée laisse alors chaque bouton porter sa propre ombre.',
        seamless:
          "Retire les traits entre les boutons assemblés : aucune couture n'est dessinée, et les bordures des deux côtés de chaque arête partagée sont effacées, si bien que la rangée se lit comme un cadre unique plutôt que comme des segments. Les arêtes extérieures restent. Sans effet sous <code>detached</code>, où aucune arête n'est partagée.",
        fullWidth:
          "Étire la rangée sur toute la largeur de son parent, chaque segment prenant une part égale de cette largeur quel que soit son libellé. Un segment ne descend jamais sous la largeur de son propre libellé : une rangée de libellés trop longs pour le parent le déborde au lieu d'être écrasée. Sous <code>vertical</code>, il ne reste que la largeur, une colonne étirant déjà chaque segment.",
        variant:
          "Le poids visuel que porte chaque segment, sur les valeurs de VButton : <code>solid</code>, <code>outline</code>, <code>ghost</code> ou <code>soft</code>. Il l'emporte sur la variante donnée à un bouton, un segment d'une autre silhouette ne se lisant plus comme un morceau de la rangée. Omis, chaque bouton garde la sienne.",
        tone: 'La couleur des segments, parmi <code>accent</code>, <code>neutral</code> et <code>danger</code>. Celui-ci est un repli et non un ordre : un bouton qui nomme son propre ton le garde, ce qui permet à une seule action destructrice de se signaler dans la rangée.',
        size: "La hauteur des segments, tirée de l'échelle de tailles partagée par tous les contrôles : <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> ou <code>xl</code>. Elle l'emporte sur la taille donnée à un bouton. Omise, chaque bouton garde la sienne.",
        compact:
          "Retire 4px à la hauteur de chaque segment. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
        elevated:
          "Soulève la rangée avec l'échelle d'ombres, aux conditions de la prop de VButton. L'ombre est celle de la rangée et non celle de chaque segment, ce qui garde les joints nets : trois ombres qui se chevauchent y dessineraient une bande sombre. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
        disabled:
          "Rend chaque segment inutilisable. Celui-ci s'ajoute au lieu de trancher : un bouton qui se désactive lui-même le reste dans une rangée qui ne dit rien, et un segment ne peut pas se réactiver une fois la rangée éteinte.",
      },
      slots: {
        default: 'Les VButton et VIconButton à assembler.',
      },
    },
  },
}
