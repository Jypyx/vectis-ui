export default {
  title: 'Navigation latérale',
  lead: "La navigation d'une barre latérale : un arbre de liens, montré sur place plutôt que dans un panneau flottant, dont les branches s'ouvrent et se referment. Il s'écrit niveau par niveau avec ses propres sous-composants, jamais décrit comme une liste de données.",

  examples: {
    links: {
      title: 'Liens et actions',
      text: "<code>href</code> rend une ligne sous forme de vrai lien ; sans lui, la ligne est un bouton qui rapporte son activation par <code>select</code>. <code>active</code> marque la ligne où se trouve le lecteur et l'annonce comme la page courante. Une ligne qui porte des sous-éléments ignore <code>href</code>.",
    },
    sublabels: {
      title: 'Sous-libellés',
      text: '<code>sublabel</code> ajoute une seconde ligne sous le libellé, pour un compte, un état de synchronisation ou une taille. Le slot <code>#sublabel</code> prend la même place quand cette ligne demande du balisage.',
    },
    endContent: {
      title: 'Du contenu en fin de ligne',
      text: 'Le slot <code>#end</code> place un compteur, un badge ou un petit contrôle après le libellé et avant le chevron. Sur une ligne de branche, il se retrouve dans le résumé natif de la section : tenez-vous-en donc à du contenu non interactif.',
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: "VSideNavigationGroup nomme un bloc de lignes et VSideNavigationSeparator trace un filet entre deux d'entre elles. Un titre n'est pas une ligne : rien ne se passe au clic et les flèches ne s'y arrêtent jamais. Un groupe n'est pas non plus un niveau de la hiérarchie, ses éléments ne sont donc pas indentés.",
    },
    depth: {
      title: 'Imbrication',
      text: "Une ligne à laquelle on donne un slot <code>#items</code> devient une branche, et une branche peut porter ses propres branches aussi loin que va l'arbre. Chaque niveau est indenté exactement de la place que prend une icône de début.",
    },
    chevrons: {
      title: 'Le chevron des sections',
      text: "<code>expandIcon</code> est le glyphe d'une branche fermée, pivoté de 180° à l'ouverture de la section. Nommer aussi <code>collapseIcon</code> échange plutôt un dessin pour l'autre. Les deux se posent sur la navigation entière.",
    },
    exclusive: {
      title: 'Une section à la fois',
      text: "<code>exclusive</code> ne garde qu'une section ouverte à la fois au sein de chaque niveau. Il est désactivé par défaut.",
    },
    openState: {
      title: 'Savoir si une section est ouverte',
      text: "<code>defaultOpen</code> décide de l'état initial d'une branche puis le confie au navigateur. <code>v-model:open</code> rapporte au contraire chaque pliage, et ouvre ou ferme la branche quand on y écrit.",
    },
    disabled: {
      title: 'Lignes désactivées',
      text: '<code>disabled</code> grise une ligne par les tokens de couleur et la sort du parcours clavier. Sur une branche, la section ne se déplie plus du tout.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la hauteur des lignes à 32 ou 40 pixels, et <code>compact</code> lui retire 4px. Elle se pose une fois sur la navigation, et chaque niveau la lit de là.',
    },
  },

  api: {
    VSideNavigation: {
      props: {
        label:
          "Ce que les lecteurs d'écran annoncent pour cette navigation. Une page en compte souvent plusieurs, une principale, une latérale, une de pied de page, et c'est ce qui les distingue. Il retombe sur le dictionnaire du design system.",
        size: 'La hauteur des lignes, 32 ou 40 pixels, héritée par tous les niveaux.',
        compact:
          "Retire 4px à la hauteur de chaque ligne. C'est un réglage de densité et non un rail replié en icônes seules, que ce composant ne propose pas.",
        exclusive:
          "Ne garde qu'une section ouverte à la fois au sein de chaque niveau, ce que le navigateur fait seul. Désactivé par défaut : une barre latérale laisse normalement plusieurs sections ouvertes.",
        expandIcon: "Le chevron d'une section fermée.",
        collapseIcon:
          "Le chevron d'une section ouverte. Sans lui, celui de la section fermée est simplement pivoté de 180°.",
      },
      slots: {
        default: "Le premier niveau de l'arbre : items, groupes et séparateurs.",
      },
    },
    VSideNavigationItem: {
      props: {
        label: 'Ce que dit la ligne, et où elle mène. Le slot par défaut la remplace.',
        sublabel: 'Une seconde ligne sous le libellé, pour un statut ou une courte explication.',
        icon: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        href: "Où mène cette ligne, ce qui en fait un lien. Elle est ignorée sur une ligne qui a des sous-items : une telle ligne s'ouvre et se referme plutôt que de naviguer.",
        active:
          'Marque cette ligne comme la page actuellement consultée. Elle est mise en évidence et annoncée comme la page courante.',
        disabled:
          'Rend la ligne inutilisable : elle se grise par les tokens de couleur et quitte le chemin du clavier.',
        defaultOpen:
          "Rend une branche déjà ouverte. Cela ne fixe que l'état initial ; le navigateur le possède ensuite.",
        vModelOpen:
          "Si la branche est ouverte, quand vous voulez la piloter ou l'observer. Non liée, le navigateur garde cet état pour lui et <code>defaultOpen</code> n'en donne que la valeur initiale.",
      },
      events: {
        select: 'La ligne a été activée. Une branche le rapporte comme un lien.',
      },
      slots: {
        default:
          'Le libellé de la ligne. Il est obligatoire : une ligne de navigation doit dire où elle mène.',
        sublabel:
          'Une seconde ligne faite de balisage, qui remplace la prop <code>sublabel</code>.',
        start: 'Du contenu libre avant le libellé, qui prend la place de <code>icon</code>.',
        end: 'Du contenu libre à la fin de la ligne, avant le chevron : un compteur, un badge. Sur une branche il ne doit pas être focalisable, la ligne étant déjà un contrôle.',
        items:
          "Les sous-items, qui font de cette ligne une branche. La profondeur n'est pas limitée.",
      },
    },
    VSideNavigationGroup: {
      props: {
        label:
          "Le nom de la section, que le slot <code>#label</code> remplace. L'un des deux est nécessaire : c'est lui qui nomme la sous-liste qu'il coiffe.",
      },
      slots: {
        default: 'Les items appartenant à cette section.',
        label: 'Un nom fait de balisage, qui remplace la prop <code>label</code>.',
      },
    },
  },
}
