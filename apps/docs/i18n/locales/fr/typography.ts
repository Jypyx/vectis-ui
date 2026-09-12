export default {
  title: 'Typographie',
  lead: "Un élément de texte qui porte l'un des rôles typographiques. Chaque rôle est une recette complète de tokens, si bien qu'un titre, un libellé ou une légende se nomment au lieu de se décrire à la main.",

  examples: {
    variants: {
      title: 'Variantes',
      text: "<code>variant</code> propose quatorze rôles, chacun étant une recette complète plutôt qu'une taille : la graisse, la hauteur de ligne et, là où le rôle le demande, l'interlettrage et une famille à chasse fixe viennent avec.",
    },
    tones: {
      title: 'Tonalités',
      text: "<code>tone</code> est la couleur du texte, dite comme un sens. <code>default</code> ne pose aucune couleur, le texte hérite donc de ce qui l'entoure, et <code>on-inverse</code> nomme au contraire son fond, pour un texte auquel la couleur héritée ne survivrait pas.",
    },
    tags: {
      title: 'La balise rendue',
      text: "Chaque variante rend déjà une balise sensée, h1 à h4 pour les titres et <code>p</code> ou <code>span</code> pour le reste. <code>as</code> sert aux cas où le sens et l'apparence divergent, et tout le reste traverse jusqu'à cette balise.",
    },
    truncate: {
      title: 'Tronquer sur une ligne',
      text: "<code>truncate</code> tient le texte sur une ligne, terminée par des points de suspension. L'élément a besoin d'une largeur sur laquelle être coupé, et sans rien à déborder le texte reste simplement entier.",
    },
    paragraph: {
      title: 'Un bloc de texte',
      text: "Le composant ne porte aucune marge : l'espace entre deux morceaux de texte appartient à la mise en page qui les contient, en général une grille ou une colonne flex avec un écart.",
    },
  },

  api: {
    VTypography: {
      props: {
        variant:
          'Le rôle que joue le texte, qui sélectionne une recette complète de tokens typographiques : taille, graisse, interligne et, quand le rôle le demande, interlettrage et famille à chasse fixe.',
        as: "La balise HTML à rendre. Chaque variante a déjà une valeur par défaut sensée (h1 à h4, p, span, code) : cette prop sert aux cas où le sens et l'apparence divergent, un sous-titre qui est en réalité un <code>h2</code>, ou un libellé attaché à un champ.",
        tone: "La couleur du texte. <code>default</code> n'en pose aucune, si bien que le texte hérite de ce qui l'entoure : c'est ce qui permet au même composant de se poser sur une surface inversée ou dans une notification colorée.",
        truncate:
          "Coupe le texte à une ligne et le termine par des points de suspension. L'élément a besoin d'une largeur contre laquelle être coupé, en bloc ou en item flex ; sinon il n'y a rien à déborder et le texte reste entier.",
      },
      slots: {
        default: 'Le texte.',
      },
    },
  },
}
