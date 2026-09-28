export default {
  title: 'Navigation latérale',
  lead: '<code>VSideNavigation</code> affiche une arborescence de liens et de branches repliables dans une barre latérale. Composez-la avec des éléments, des groupes et des séparateurs.',
  examples: {
    links: {
      title: 'Liens et actions',
      text: 'Les éléments avec <code>href</code> sont des liens ; les autres sont des boutons. <code>current</code> marque la page actuelle. Les branches ignorent <code>href</code>.',
    },
    sublabels: {
      title: 'Sous-libellés',
      text: 'Ajoutez une seconde ligne avec <code>sublabel</code> ou son slot.',
    },
    endContent: {
      title: 'Du contenu en fin de ligne',
      text: 'Utilisez <code>end</code> pour un badge ou un compteur avant le chevron. Gardez le contenu des branches non interactif.',
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: '<code>VSideNavigationGroup</code> nomme un ensemble sans ajouter de niveau d’imbrication. Séparez les ensembles avec <code>VSideNavigationSeparator</code>.',
    },
    depth: {
      title: 'Imbrication',
      text: 'Le slot <code>children</code> transforme un élément en branche. Les branches peuvent contenir d’autres branches.',
    },
    chevrons: {
      title: 'Le chevron des sections',
      text: 'Définissez <code>expandIcon</code> sur la navigation. L’icône tourne à l’ouverture sauf si <code>collapseIcon</code> la remplace.',
    },
    exclusive: {
      title: 'Une section à la fois',
      text: '<code>exclusive</code> conserve une seule branche ouverte par niveau. Plusieurs peuvent rester ouvertes par défaut.',
    },
    openState: {
      title: 'Savoir si une section est ouverte',
      text: '<code>defaultOpen</code> définit l’état initial. Utilisez <code>v-model:open</code> pour observer ou piloter les changements suivants.',
    },
    disabled: {
      title: 'Lignes désactivées',
      text: 'Les éléments désactivés quittent le parcours clavier ; les branches désactivées ne peuvent pas être ouvertes ou fermées.',
    },
    sizes: {
      title: 'Tailles',
      text: 'Définissez <code>size</code> et <code>compact</code> sur la navigation pour tous les niveaux.',
    },
  },
  api: {
    VSideNavigation: {
      props: {
        label: 'Nom accessible de la navigation. Utilise le dictionnaire par défaut.',
        size: 'Taille des lignes héritée par tous les niveaux.',
        compact: 'Réduit la hauteur des lignes.',
        exclusive: 'Conserve une seule branche ouverte par niveau.',
        expandIcon: 'Icône de branche fermée.',
        collapseIcon: 'Icône de branche ouverte. Sans cette prop, l’icône d’ouverture tourne.',
      },
      slots: {
        default: 'Éléments, groupes et séparateurs du premier niveau.',
      },
    },
    VSideNavigationItem: {
      props: {
        label: 'Libellé visible de la ligne, remplacé par le slot par défaut.',
        sublabel: 'Seconde ligne sous le libellé.',
        icon: 'Icône avant le libellé. Remplacée par son slot.',
        href: 'Destination du lien. Ignorée si l’élément a des enfants.',
        current: 'Met en évidence et annonce la page actuelle.',
        disabled: 'Désactive les interactions.',
        defaultOpen: 'État initial de la branche. Les changements ultérieurs ne la pilotent pas.',
        vModelOpen: 'État ouvert de la branche à observer ou à piloter.',
      },
      events: {
        select: 'L’élément a été activé, y compris les liens et les branches.',
      },
      slots: {
        default: 'Libellé de la ligne. Fournissez-le avec ce slot ou la prop.',
        sublabel: 'Contenu remplaçant la seconde ligne.',
        icon: 'Contenu remplaçant l’icône.',
        end: 'Contenu avant le chevron. Doit rester non interactif sur les branches.',
        children: 'Éléments imbriqués transformant cette ligne en branche.',
      },
    },
    VSideNavigationGroup: {
      props: {
        label: 'Nom de section. Fournissez cette prop ou son slot.',
      },
      slots: {
        default: 'Éléments de la section.',
        label: 'Contenu remplaçant le nom de section.',
      },
    },
  },
}
