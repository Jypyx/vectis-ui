export default {
  title: 'Squelette de chargement',
  lead: '<code>VSkeletonLoader</code> réserve la place du contenu en cours de chargement. Il est décoratif par défaut ; marquez la zone parente avec <code>aria-busy</code>.',
  examples: {
    shapes: {
      title: 'Formes',
      text: 'Choisissez une <code>shape</code> pour du texte, des contrôles, des capsules, des cercles ou des surfaces. Ajustez les dimensions avec <code>width</code> et <code>height</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> et <code>compact</code> s’appliquent aux formes de contrôle, de capsule et de cercle.',
    },
    paragraph: {
      title: 'Paragraphes de texte',
      text: '<code>lines</code> empile les espaces réservés. Avec la forme texte, la dernière ligne est plus courte.',
    },
    silhouettes: {
      title: "La silhouette d'un vrai composant",
      text: 'Assemblez les formes pour représenter le contenu qui les remplacera.',
    },
    animations: {
      title: 'Animations',
      text: 'Choisissez une vague, une pulsation ou aucune animation. La réduction des mouvements remplace la vague par une pulsation plus lente.',
    },
    colour: {
      title: 'Une couleur à vous',
      text: '<code>color</code> définit une couleur de fond personnalisée.',
    },
    replacing: {
      title: 'Remplacer le squelette',
      text: 'Remplacez le squelette avec <code>v-if</code> lorsque le contenu est prêt. Conservez <code>aria-busy</code> sur la zone parente pendant le chargement.',
    },
    announcing: {
      title: "Annoncer l'attente",
      text: 'Utilisez <code>announce</code> ou <code>label</code> pour annoncer un indicateur de chargement. Évitez d’annoncer chaque squelette d’une même zone.',
    },
  },
  api: {
    VSkeletonLoader: {
      props: {
        shape: 'Forme de l’espace réservé : texte, contrôle, capsule, cercle ou surface.',
        size: 'Taille des formes de contrôle, de capsule et de cercle.',
        compact: 'Réduit la hauteur des formes dimensionnées comme des contrôles.',
        width:
          'Largeur en pixels pour les nombres, sinon longueur CSS. Occupe la largeur disponible par défaut.',
        height:
          'Hauteur en pixels pour les nombres, sinon longueur CSS. Remplace celle de la forme et de la taille.',
        lines: 'Nombre d’espaces réservés empilés. La forme texte raccourcit la dernière ligne.',
        animation: 'Vague, pulsation ou aucune animation.',
        color: 'Couleur de fond personnalisée.',
        announce: 'Annonce le chargement aux technologies d’assistance. Désactivé par défaut.',
        label:
          'Texte de chargement accessible. Active aussi l’annonce ; utilise le dictionnaire de la bibliothèque par défaut.',
      },
    },
  },
}
