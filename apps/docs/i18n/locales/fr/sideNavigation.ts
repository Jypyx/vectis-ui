export default {
  title: 'Navigation latérale',
  lead: "La navigation d'une barre latérale : un arbre de liens, montré sur place plutôt que dans un panneau flottant, dont les branches s'ouvrent et se referment. Il s'écrit niveau par niveau avec ses propres sous-composants, jamais décrit comme une liste de données.",

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
        label: 'Le nom de la section. Le slot <code>#label</code> le remplace.',
      },
      slots: {
        default: 'Les items appartenant à cette section.',
        label: 'Un nom fait de balisage, qui remplace la prop <code>label</code>.',
      },
    },
  },
}
