export default {
  title: 'Accordéon',
  lead: '<code>VAccordion</code> regroupe des sections repliables fondées sur des éléments natifs <code>&lt;details&gt;</code>.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>flat</code> laisse le groupe sans cadre ; <code>outlined</code> ajoute un fond et une bordure.',
    },
    exclusive: {
      title: 'Une section à la fois',
      text: 'Une seule section reste ouverte par défaut. Activez <code>multiple</code> pour en conserver plusieurs ouvertes.',
    },
    subtitles: {
      title: 'Sous-titres et icônes',
      text: 'Ajoutez <code>icon</code> et <code>subtitle</code>, ou utilisez leurs slots pour du contenu personnalisé.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit les espacements internes sans modifier le texte ni les icônes.',
    },
    icons: {
      title: "Icônes d'ouverture et de fermeture",
      text: 'Sans <code>collapseIcon</code>, l’icône tourne à l’ouverture. Avec cette prop, les icônes s’échangent.',
    },
    disabled: {
      title: 'Sections désactivées',
      text: 'Les sections désactivées ne peuvent pas être ouvertes ou fermées et sont ignorées par la navigation au clavier.',
    },
  },
  api: {
    VAccordion: {
      props: {
        multiple: 'Permet de conserver plusieurs sections ouvertes.',
        variant: 'Groupe sans cadre ou avec bordure.',
        expandIcon:
          'Icône de section fermée. Tourne à l’ouverture sauf si <code>collapseIcon</code> est défini.',
        collapseIcon: 'Icône de section ouverte remplaçant l’icône tournée.',
        compact: 'Réduit les espacements internes des éléments.',
      },
      slots: {
        default: 'Enfants <code>VAccordionItem</code>.',
      },
    },
    VAccordionItem: {
      props: {
        title: 'Titre de section. Remplacé par le slot <code>title</code>.',
        subtitle: 'Seconde ligne sous le titre. Remplacée par son slot.',
        icon: 'Icône avant le titre. Remplacée par son slot.',
        defaultOpen:
          'État ouvert initial. Les modifications ultérieures ne pilotent pas la section.',
        vModelOpen: 'État ouvert à observer ou à piloter.',
        disabled: 'Désactive les interactions.',
      },
      slots: {
        default: 'Contenu déplié.',
        title: 'Contenu remplaçant le titre.',
        subtitle: 'Contenu remplaçant le sous-titre.',
        icon: 'Contenu remplaçant l’icône.',
      },
    },
  },
}
