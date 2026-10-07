export default {
  title: 'Carte',
  lead: '<code>VCard</code> regroupe le contenu d’un même sujet : média, titre, corps et actions. Avec <code>href</code>, toute la carte devient un lien.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> choisit <code>flat</code>, <code>outline</code>, <code>elevated</code> ou <code>filled</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle les marges intérieures et les espacements entre les parties.',
    },
    media: {
      title: 'Média',
      text: 'Le slot <code>media</code> occupe toute la largeur au-dessus du contenu. Donnez aux images un texte <code>alt</code>, ou <code>alt=""</code> si elles sont décoratives.',
    },
    horizontal: {
      title: 'Horizontale',
      text: '<code>orientation="horizontal"</code> place le média au début. Dans une carte étroite, le média repasse au-dessus du contenu.',
    },
    linked: {
      title: 'Cartes liens',
      text: 'Avec <code>href</code>, le titre est un lien dont la zone cliquable couvre la carte. Les boutons de la carte restent des cibles distinctes. Les attributs autres que <code>class</code> et <code>style</code> vont au lien. <code>headingLevel</code> rend le titre sous forme de titre de section.',
    },
    disabled: {
      title: 'Désactivée',
      text: '<code>disabled</code> retire la destination du lien et atténue le titre et le média. Les contrôles des slots ne sont pas concernés.',
    },
    loading: {
      title: 'Chargement',
      text: '<code>loading</code> affiche des emplacements de chargement et masque le pied. Définissez <code>loadingText</code> pour annoncer le chargement aux lecteurs d’écran.',
    },
  },
  api: {
    VCard: {
      props: {
        variant: 'Style visuel.',
        orientation: 'Place le média au-dessus du contenu ou au début.',
        size: 'Taille des marges intérieures et des espacements.',
        title: 'Titre. Avec <code>href</code>, le texte du lien de la carte.',
        subtitle: 'Texte sous le titre.',
        headingLevel:
          'Rend le titre sous forme de titre de section de ce niveau. Sinon, le titre est un paragraphe.',
        href: 'Fait de la carte un lien. Nécessite <code>title</code>.',
        disabled: 'Désactive le lien de la carte et atténue le titre et le média.',
        loading: 'Affiche des emplacements de chargement à la place du contenu et masque le pied.',
        loadingText: 'Texte annoncé pendant le chargement. Sans lui, le chargement est silencieux.',
        as: 'Élément racine, par exemple <code>article</code> ou <code>li</code>.',
      },
      slots: {
        default: 'Corps de la carte.',
        media: 'Image, vidéo ou illustration, sur toute la largeur.',
        header: 'Remplace le titre et le sous-titre. Une carte lien perd son lien.',
        footer: 'Actions, alignées en bas de la carte.',
      },
    },
  },
}
