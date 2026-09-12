export default {
  title: 'Avatar',
  lead: 'Une personne ou une chose, en disque. Une photo quand il y en a une, une icône ou les initiales sinon, sur une couleur dérivée du nom pour que la même personne garde la même partout.',

  examples: {
    image: {
      title: 'Avec une photo',
      text: '<code>src</code> affiche une photo. <code>name</code> fournit son texte alternatif et les initiales affichées quand le fichier ne peut pas être chargé.',
    },
    icon: {
      title: 'Avec une icône',
      text: "<code>icon</code> affiche une icône à la place des initiales. <code>alt</code> nomme l'avatar quand aucun <code>name</code> n'est donné.",
    },
    initials: {
      title: 'Initiales et couleur automatique',
      text: 'Sans photo ni icône, le disque affiche les initiales de <code>name</code> sur une couleur dérivée de celui-ci.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit le diamètre : 24, 32, 40, 48 ou 56 pixels. Le contenu suit.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit le diamètre de 4px.',
    },
    color: {
      title: 'Couleur personnalisée',
      text: "<code>color</code> remplace la couleur dérivée du nom. L'hexadécimal, un nom de couleur CSS et <code>oklch()</code> sont acceptés.",
    },
    interactive: {
      title: 'Boutons et liens',
      text: "<code>clickable</code> rend un <code>&lt;button&gt;</code> et <code>href</code> un <code>&lt;a&gt;</code>, l'adresse l'emportant quand les deux sont donnés. <code>disabled</code> rend l'avatar inerte.",
    },
    tooltip: {
      title: 'Avec une infobulle',
      text: "Une VTooltip a besoin d'un déclencheur focalisable : rendez l'avatar <code>clickable</code> ou lien, puis liez les <code>triggerProps</code> de l'infobulle dessus.",
    },
  },

  api: {
    VAvatar: {
      props: {
        src: "La photo à afficher. Elle est préférée à tout le reste, et une image qui échoue à se charger passe la main à l'icône ou aux initiales plutôt que de laisser un trou.",
        icon: "L'icône à afficher quand il n'y a pas de photo. Elle passe avant les initiales : un avatar à qui on donne une icône et un nom montre l'icône.",
        name: "Le nom complet. Il fait trois choses à la fois : il nomme l'avatar pour les technologies d'assistance, ses initiales sont ce qui s'affiche sans photo ni icône, et il est la graine dont la couleur automatique est dérivée.",
        alt: "Le nom accessible, quand il ne doit pas être simplement le nom : un avatar représentant une équipe plutôt qu'une personne, par exemple. Il l'emporte sur <code>name</code>.",
        color:
          'Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>. Elle remplace la teinte autrement dérivée de <code>name</code>, et le texte posé dessus est toujours blanc : une couleur claire reste donc à votre charge.',
        size: "Le diamètre du disque, tiré de l'échelle de tailles partagée par tous les contrôles. Omise dans un VAvatarGroup, elle prend celle du groupe ; seul, l'avatar est en <code>md</code>.",
        compact: 'Retire 4px au diamètre, comme sur tous les autres contrôles.',
        href: "Transforme l'avatar en <code>&lt;a&gt;</code> pointant vers cette adresse. Un lien désactivé devient inerte : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
        clickable:
          "Transforme l'avatar en <code>&lt;button&gt;</code>. Cette prop est ignorée dès que <code>href</code> en fait un lien.",
        disabled:
          "Rend un avatar interactif inutilisable : il cesse de répondre, quitte l'ordre de tabulation et se grise. Elle ne dit rien sur un avatar simple, qui n'a jamais été interactif.",
      },
      slots: {
        default: 'Du contenu qui remplace les initiales.',
      },
    },
  },
}
