export default {
  title: 'Accordéon',
  lead: "Des sections qui se replient. Il est construit sur <code>&lt;details&gt;</code> et <code>&lt;summary&gt;</code>, si bien que l'état ouvert, le comportement clavier et la recherche dans la page viennent tous du navigateur.",

  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> définit la décoration du groupe : <code>flat</code> (par défaut) ne dessine rien, <code>outlined</code> ajoute un fond surélevé, une bordure et des coins arrondis.',
    },
    exclusive: {
      title: 'Une section à la fois',
      text: "Un groupe ne garde qu'une section ouverte par défaut. <code>multiple</code> permet d'en garder plusieurs ouvertes en même temps.",
    },
    subtitles: {
      title: 'Sous-titres et icônes',
      text: '<code>icon</code> place une icône avant le titre et <code>subtitle</code> ajoute une seconde ligne en dessous. Les slots <code>#start</code> et <code>#subtitle</code> acceptent du balisage plutôt que du texte simple.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit chaque rembourrage de 4px, le texte et les icônes gardant leur taille.',
    },
    icons: {
      title: "Icônes d'ouverture et de fermeture",
      text: "<code>expandIcon</code> remplace le chevron. Ajouter <code>collapseIcon</code> échange les deux icônes à l'ouverture, au lieu de faire pivoter la première.",
    },
    disabled: {
      title: 'Sections désactivées',
      text: "<code>disabled</code> empêche l'ouverture d'une section et la grise. Le clavier l'enjambe.",
    },
  },

  api: {
    VAccordion: {
      props: {
        multiple:
          'Laisse le lecteur garder plusieurs sections ouvertes à la fois. Sans lui, une seule reste ouverte et en ouvrir une referme la précédente, ce dont le navigateur se charge seul dès que tous les items partagent un même nom de <code>&lt;details&gt;</code>.',
        variant:
          "Comment le groupe est décoré. <code>flat</code> ne dessine rien et laisse l'accordéon poser sur la surface derrière lui ; <code>outlined</code> lui donne un fond surélevé, une bordure et des coins arrondis, si bien qu'il se lit comme une carte.",
        expandIcon:
          "L'icône affichée sur une section fermée. C'est un chevron, qui pivote de 180° quand la section s'ouvre.",
        collapseIcon:
          "L'icône affichée sur une section ouverte. Sans elle, l'icône d'ouverture est simplement pivotée ; avec elle, les deux sont échangées.",
        compact:
          'Densité réduite : chaque rembourrage perd 4px, tandis que le texte et les icônes gardent leur taille.',
      },
      slots: {
        default: 'Les <code>VAccordionItem</code> qui composent le groupe.',
      },
    },
    VAccordionItem: {
      props: {
        title:
          'Le titre de la section, la ligne qui reste visible quand elle est fermée. Utilisez le slot <code>#title</code> quand le titre demande du balisage plutôt que du texte simple.',
        subtitle:
          'Une seconde ligne sous le titre, pour une courte explication ou un statut. Le slot <code>#subtitle</code> la remplace quand du balisage est nécessaire.',
        icon: 'Une icône avant le titre. Le slot <code>#start</code> la remplace.',
        defaultOpen:
          "Rend la section déjà ouverte. Cela ne fixe que le premier rendu : le navigateur possède l'état ensuite, donc changer cette prop plus tard ne refermera pas une section que le lecteur a ouverte.",
        disabled:
          "Rend la section inerte. Elle ne peut plus être ouverte, le clavier l'enjambe, et elle se grise par les tokens de couleur.",
      },
      slots: {
        default: 'Le contenu révélé quand la section est ouverte.',
        title: 'Un titre fait de balisage, qui remplace la prop <code>title</code>.',
        subtitle: 'Un sous-titre fait de balisage, qui remplace la prop <code>subtitle</code>.',
        start: 'Du contenu libre avant le titre, qui prend la place de <code>icon</code>.',
      },
    },
  },
}
