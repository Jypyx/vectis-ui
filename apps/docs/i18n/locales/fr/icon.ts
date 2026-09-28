export default {
  title: 'Icône',
  lead: '<code>VIcon</code> affiche les icônes intégrées, des SVG personnalisés, des images ou les icônes d’un résolveur.',
  examples: {
    size: {
      title: 'Taille',
      text: '<code>size</code> définit la taille carrée en pixels. Sans cette prop, l’icône utilise la taille du contexte ou <code>1em</code>.',
    },
    filled: {
      title: 'Pleine',
      text: '<code>filled</code> sélectionne le dessin plein lorsqu’il existe.',
    },
    mirrored: {
      title: 'En miroir',
      text: '<code>mirrored</code> retourne les icônes directionnelles dans les dispositions de droite à gauche. La direction suit le contexte <code>dir</code> le plus proche.',
    },
    rendering: {
      title: "D'où vient le dessin",
      text: 'La première source disponible est utilisée dans cet ordre :',
      order: [
        '<code>render</code> : tracés SVG, composant, image ou classe de police.',
        '<code>src</code> : URL d’image.',
        '<code>name</code> : résolveur, dessin intégré, puis police à ligatures.',
        'Slot par défaut : SVG en ligne si aucune prop de source n’est définie.',
      ],
      moreBefore:
        'Un résolveur peut ne rien renvoyer pour utiliser l’icône intégrée. Une chaîne simple désigne un nom d’icône. Pour la configuration et les icônes disponibles, consultez',
      moreAfter: '.',
    },
  },
  api: {
    VIcon: {
      props: {
        name: 'Nom d’icône ou icône intégrée importée depuis <code>vectis-ui/icons</code>. Le résolveur est prioritaire sur le dessin intégré ; les chaînes non résolues utilisent une police à ligatures.',
        render: 'Source d’icône explicite. Prioritaire sur les autres sources.',
        src: 'URL d’image. Prioritaire sur <code>name</code>.',
        size: 'Taille en pixels, nombre ou chaîne numérique. Utilise la taille du contexte ou <code>1em</code> par défaut.',
        label: 'Nom accessible. Omettez-le pour une icône décorative.',
        filled: 'Utilise une variante pleine si la source la prend en charge.',
        mirrored: 'Retourne l’icône horizontalement dans un contexte de droite à gauche.',
      },
      slots: {
        default: 'SVG en ligne utilisé si aucune prop de source n’est définie.',
      },
    },
  },
}
