export default {
  title: 'Raccourcis clavier',
  lead: "Un raccourci clavier, affiché. Il se rend en <code>&lt;kbd&gt;</code> imbriqués, écrit ses glyphes selon la plateforme, et peut écouter la combinaison qu'il montre si vous le lui demandez.",

  examples: {
    keys: {
      title: "Ce qu'on peut écrire",
      written: 'Vous écrivez',
      elsewhere: 'Windows et Linux',
      text: "<code>keys</code> est une simple chaîne, séparée par des <code>+</code>, où ni la casse ni les espaces ne comptent. <code>mod</code> est le modificateur qui appartient au système, Command sur un Mac et Ctrl partout ailleurs, là où <code>meta</code> nomme cette touche physique au sens littéral. Un jeton que le design system ne connaît pas est dessiné exactement tel qu'il a été écrit, et la touche <code>+</code> s'écrit <code>plus</code>.",
    },
    variants: {
      title: 'Variantes',
      text: "<code>variant</code> dessine les touches teintées, contourées ou surélevées. Il n'y a ni prop de ton ni prop de couleur : toutes les peintures dérivent de la couleur héritée.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> accepte <code>xs</code> ou <code>sm</code>, et <code>compact</code> retire 4px à l'une comme à l'autre. Une touche d'un seul caractère est carrée.",
    },
    attached: {
      title: 'Attaché',
      text: "<code>attached</code> déplace la décoration de chaque touche vers le raccourci entier, si bien que la combinaison se lit comme une seule touche. C'est purement visuel : le balisage, les touches et le nom annoncé sont identiques.",
    },
    platform: {
      title: 'Plateforme',
      text: '<code>platform</code> impose le système au lieu de le lire une fois le composant dans la page, ce dont a besoin un tableau montrant tous les systèmes.',
    },
    separator: {
      title: 'Séparateur',
      text: "<code>separator</code> est ce qui s'écrit entre deux touches, <code>+</code> par défaut. Une chaîne vide laisse l'écart en place et donne la convention macOS.",
    },
    inText: {
      title: 'Dans le texte et dans les composants',
      text: "Une touche prend la taille du texte qui l'entoure. Ses places habituelles sont la fin d'une ligne de menu, une infobulle, et le contrôle dont le raccourci est un second chemin.",
    },
    listening: {
      title: 'Écoute',
      text: "<code>listen</code> fait guetter au composant la combinaison qu'il affiche et émettre <code>trigger</code>. Les modificateurs sont comparés exactement, si bien que <code>mod+k</code> et <code>mod+shift+k</code> peuvent coexister. <code>allowDefault</code> conserve le raccourci du navigateur, et <code>allowInInput</code> laisse le raccourci se déclencher pendant une saisie dans un champ.",
    },
  },

  api: {
    VHotkeys: {
      props: {
        keys: "La combinaison, séparée par <code>+</code> : <code>mod+k</code>, <code>ctrl+shift+p</code>, <code>alt+enter</code>. La casse et les espaces sont sans importance. <code>mod</code> est le modificateur multiplateforme, Commande sur macOS et Ctrl partout ailleurs, tandis que <code>meta</code> désigne la touche Commande ou Windows elle-même. Un jeton inconnu s'affiche tel qu'il a été déclaré, et la touche <code>+</code> s'écrit <code>plus</code>.",
        variant: 'Comment une touche est dessinée : teintée, contourée, ou soulevée de la page.',
        attached:
          "Dessine toute la combinaison comme une seule touche plutôt que plusieurs, ce qui place le séparateur à l'intérieur de la touche au lieu de le mettre entre deux. C'est purement visuel : le balisage et le nom annoncé sont identiques dans les deux cas.",
        size: "La taille des touches. Un raccourci est du décor à côté d'un autre texte, il part donc de la plus petite.",
        compact: 'Retire 4px à la hauteur, en laissant le rembourrage et le texte tels quels.',
        platform:
          "Force le système d'exploitation du clavier au lieu de le détecter, pour un rendu déterministe ou un hôte qui le sait déjà.",
        separator:
          'Ce qui est écrit entre deux touches. Une chaîne vide donne la convention macOS, où les symboles se suivent simplement.',
        listen:
          "Écoute réellement la combinaison et la rapporte. Désactivé par défaut : un composant dont le métier est d'afficher un raccourci ne doit pas capturer le clavier de la page sans qu'on le lui demande.",
        allowDefault:
          "Pendant l'écoute, laisse le navigateur continuer de faire ce que la combinaison fait normalement. Sans lui, le navigateur est arrêté, ce qui est tout l'intérêt de reprendre une combinaison.",
        allowInInput:
          "Pendant l'écoute, se déclenche même quand le lecteur est en train de saisir dans un champ. Désactivé par défaut, pour qu'un raccourci ne parte pas au milieu d'une phrase.",
        label:
          "Ce que les lecteurs d'écran annoncent. Il retombe sur le dictionnaire du design system, qui écrit les modificateurs en mots : le glyphe gagne à l'écran, le mot gagne dans le nom accessible.",
      },
      events: {
        trigger:
          "La combinaison a été pressée, avec l'événement clavier d'origine. Cet événement ne part que si <code>listen</code> est posé.",
      },
    },
  },
}
