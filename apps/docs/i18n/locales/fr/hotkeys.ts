export default {
  title: 'Raccourcis clavier',
  lead: "Un raccourci clavier, affiché. Il se rend en <code>&lt;kbd&gt;</code> imbriqués, écrit ses glyphes selon la plateforme, et peut écouter la combinaison qu'il montre si vous le lui demandez.",

  examples: {
    keys: {
      title: "Ce qu'on peut écrire",
      written: 'Vous écrivez',
      elsewhere: 'Windows et Linux',
      text: "La combinaison est une simple chaîne, séparée par des <code>+</code>, où ni la casse ni les espaces ne comptent. Deux jetons désignent un modificateur et méritent d'être distingués : <code>mod</code> est celui qui appartient au système, Command sur un Mac et Ctrl partout ailleurs, et c'est presque toujours ce qu'un raccourci applicatif veut dire ; <code>meta</code> nomme cette touche physique au sens littéral, donc elle reste Command sur un Mac et devient la touche Windows, ou Super sous Linux. Un jeton que le design system ne connaît pas est dessiné exactement tel qu'il a été écrit, ce qui rend <code>k</code>, <code>f5</code> et <code>,</code> valides sans liste où les ajouter. La touche <code>+</code> est la seule exception, écrite <code>plus</code>, puisque <code>+</code> sert déjà de séparateur.",
    },
    variants: {
      title: 'Variantes',
      text: "Trois façons de dessiner une touche : teintée, contournée, ou soulevée de la page. Ce sont trois valeurs d'une même prop plutôt qu'une variante doublée d'un indicateur d'élévation, parce qu'une touche n'est pas interactive : il n'y a ni survol, ni état actif, ni focus avec quoi une élévation pourrait se combiner. Rien ici n'est une tonalité non plus. Un raccourci est du décor, jamais une donnée, donc le composant n'offre aucune couleur propre.",
    },
    sizes: {
      title: 'Tailles',
      text: "Deux tailles, <code>xs</code> par défaut parce qu'un raccourci se pose à côté d'un autre texte au lieu de lui disputer la place, et <code>compact</code> retire 4px à l'une ou l'autre en laissant le rembourrage et la typographie tranquilles. Une touche qui ne porte qu'un caractère est carrée, ce qui garde une rangée régulière.",
    },
    attached: {
      title: 'Attaché',
      text: "La décoration passe de chaque touche au raccourci entier : la combinaison se lit comme une seule touche et le séparateur se retrouve dedans plutôt qu'entre deux. Le rembourrage suit : attaché, le raccourci prend à ses extrémités le rythme de l'intérieur d'une touche, celui qui est dimensionné pour entourer un libellé court se lisant comme du jeu autour de trois suites de texte. C'est purement visuel : le balisage, les touches et le nom annoncé sont identiques dans les deux cas.",
    },
    platform: {
      title: 'Plateforme',
      text: "Laissé à lui-même, le composant lit le système une fois dans la page et jamais avant : un serveur n'a rien pour le lire, donc le premier rendu client doit correspondre à ce qu'il a envoyé, et un visiteur Mac paie une image de Ctrl avant que ça devienne Command. La prop force la réponse à la place, ce dont un tableau montrant tous les systèmes a besoin, et ce qu'un hôte déjà au courant peut fournir : Electron, Tauri, ou un serveur qui lit la requête.",
    },
    separator: {
      title: 'Séparateur',
      text: "Ce qui s'écrit entre deux touches, <code>+</code> par défaut. Les touches sont disposées avec leur propre écart : il s'agit donc du caractère et jamais de l'espace autour de lui. Une chaîne vide laisse l'écart et donne la convention macOS, où les symboles se suivent simplement.",
    },
    inText: {
      title: 'Dans le texte et dans les composants',
      text: "Une touche prend la taille du texte qui l'entoure : un raccourci écrit dans une phrase reste donc sur sa ligne au lieu de l'écarter. Ses places habituelles sont le bout d'une ligne de commande, où le slot de fin de l'élément de menu l'accueille, une infobulle, dont le slot de contenu existe exactement pour cela, et le contrôle dont le raccourci est la seconde route.",
    },
    listening: {
      title: 'Écoute',
      text: "Le composant peut aussi guetter la combinaison qu'il montre et la rapporter, ce qui reste éteint tant qu'on ne le demande pas : une chose dont le métier est d'afficher un raccourci ne doit pas capturer le clavier de la page d'elle-même. Les modificateurs sont comparés exactement plutôt qu'au minimum, si bien que <code>mod+k</code> et <code>mod+shift+k</code> peuvent coexister sans que le premier avale le second. Le comportement natif du navigateur est annulé sauf si <code>allowDefault</code> en décide autrement, et un raccourci se tait pendant que le lecteur écrit dans un champ sauf si <code>allowInInput</code> en décide autrement.",
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
