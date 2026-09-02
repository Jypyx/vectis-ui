export default {
  title: 'Groupe de boutons',
  lead: "Assemble des boutons en un seul contrôle segmenté : bordures fusionnées, coins arrondis aux extrémités seulement. C'est du CSS pur, donc chaque bouton garde ses propres props.",

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'Le sens dans lequel les boutons sont assemblés : une rangée par défaut, ou une colonne avec <code>vertical</code>.',
      },
      slots: {
        default: 'Les VButton et VIconButton à assembler.',
      },
    },
  },
}
