export default {
  title: 'Typographie',
  lead: "Un élément de texte qui porte l'un des rôles typographiques. Chaque rôle est une recette complète de tokens, si bien qu'un titre, un libellé ou une légende se nomment au lieu de se décrire à la main.",

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
