export default {
  title: 'État vide',
  lead: '<code>VEmptyState</code> indique qu’il n’y a encore rien à afficher et propose quoi faire.',
  examples: {
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste la pastille, les espacements et le titre : <code>sm</code> pour un panneau ou une liste, <code>lg</code> pour une page entière.',
    },
    content: {
      title: 'Contenu et niveau de titre',
      text: 'Le slot par défaut remplace <code>description</code> par un texte contenant des liens. <code>headingLevel</code> rend le titre en titre de section sans changer son apparence.',
    },
    components: {
      title: 'Dans les tableaux et les combobox',
      text: '<code>VDataTable</code> et <code>VCombobox</code> affichent un petit état vide titré par leur <code>emptyText</code>. Leur slot <code>empty</code> le remplace, par exemple par un état vide avec des actions.',
    },
  },
  api: {
    VEmptyState: {
      props: {
        title: 'Ce qui est vide, en quelques mots.',
        description: 'Pourquoi, ou que faire ensuite. Remplacée par le slot par défaut.',
        icon: 'Icône dessinée dans une pastille ronde. Remplacée par le slot <code>media</code>.',
        size: 'Échelle du bloc.',
        headingLevel:
          'Rend le titre en <code>h1</code> à <code>h6</code>. Sans elle, le titre est un paragraphe.',
      },
      slots: {
        default: 'Description avec mise en forme ou liens.',
        media: 'Illustration qui remplace la pastille d’icône.',
        actions: 'Boutons ou liens pour sortir de l’état vide.',
      },
    },
  },
}
