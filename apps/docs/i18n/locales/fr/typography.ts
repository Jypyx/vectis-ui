export default {
  title: 'Typographie',
  lead: "Un élément de texte qui porte l'un des rôles typographiques. Chaque rôle est une recette complète de tokens, si bien qu'un titre, un libellé ou une légende se nomment au lieu de se décrire à la main.",

  examples: {
    variants: {
      title: 'Variantes',
      text: "Quatorze rôles, chacun une recette complète plutôt qu'une taille : la graisse, l'interligne et, quand le rôle le demande, l'interlettrage et une famille à chasse fixe viennent avec. C'est tout l'intérêt de les nommer. Un titre réglé à la main, ce sont quatre déclarations qui divergent d'un bout à l'autre d'une base de code, là où <code>heading-3</code> est un mot qui veut dire la même chose partout et qui suit un changement de tokens sans qu'on y touche.",
    },
    tones: {
      title: 'Tonalités',
      text: "La couleur du texte, dite comme une signification et non comme une valeur. <code>default</code> ne pose aucune couleur : le texte hérite alors de ce qui l'entoure, et c'est celle vers laquelle se tourner par défaut, puisque c'est ce qui permet au même composant de se placer dans un toast coloré ou sur une surface inversée sans qu'on lui dise laquelle. <code>on-inverse</code> est l'exception qui nomme son fond plutôt que son sens, pour un texte auquel la couleur héritée ne survivrait pas.",
    },
    tags: {
      title: 'La balise rendue',
      text: "Chaque variante rend déjà une balise sensée : h1 à h4 pour les titres, <code>p</code> pour les rôles de corps, <code>span</code> pour les petits. <code>as</code> sert aux cas où le sens et l'apparence divergent : une section qui est un <code>h2</code> dans le document mais doit se lire à la taille d'un <code>h4</code>. Le composant a une racine unique et ne déclare aucun attribut à lui : tout le reste passe donc jusqu'à cette balise, et c'est ce qui fait d'une variante <code>label</code> rendue en vrai <code>&lt;label for&gt;</code> une paire qui fonctionne plutôt qu'une ressemblance.",
    },
    truncate: {
      title: 'Tronquer sur une ligne',
      text: "Une seule ligne, terminée par des points de suspension. L'élément a besoin d'une largeur contre laquelle être coupé : en bloc ou en élément flex il prend celle de son parent, et sans rien à déborder il n'y a rien à couper, donc le texte reste entier. Cela vaut d'être su avant d'y recourir, l'échec étant silencieux : le texte continue, simplement.",
    },
    paragraph: {
      title: 'Un bloc de texte',
      text: "Plusieurs rôles composés en un bloc, ce qui est l'endroit où l'échelle se juge vraiment : est-ce qu'un chapô se tient bien un cran au-dessus du corps, est-ce qu'un rôle en ligne perturbe la ligne où il se trouve. Le composant ne porte aucune marge propre, et c'est délibéré plutôt qu'un oubli : l'espace entre deux morceaux de texte appartient à la mise en page qui les tient, donc une pile sans écart les laisse collés. Une grille ou une colonne flex avec un <code>gap</code> est la réponse habituelle, et c'est ce qui fait du rythme d'une page une décision unique plutôt que quatorze.",
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
