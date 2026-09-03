export default {
  title: 'Raccourcis clavier',
  lead: "Un raccourci clavier, affiché. Il se rend en <code>&lt;kbd&gt;</code> imbriqués, écrit ses glyphes selon la plateforme, et peut écouter la combinaison qu'il montre si vous le lui demandez.",

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
