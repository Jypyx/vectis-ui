export default {
  title: 'Avatar',
  lead: 'Une personne ou une chose, en disque. Une photo quand il y en a une, une icône ou les initiales sinon, sur une couleur dérivée du nom pour que la même personne garde la même partout.',

  examples: {
    image: {
      title: 'Avec une photo',
      text: "<code>src</code> est ce que l'avatar préfère avant tout le reste. Donnez aussi <code>name</code> : il devient le texte alternatif de l'image, et c'est vers lui que le disque se rabat quand le fichier ne peut pas être chargé, si bien qu'une adresse cassée laisse des initiales et non un trou.",
    },
    icon: {
      title: 'Avec une icône',
      text: "Un avatar qui représente autre chose qu'une personne prend une <code>icon</code>, qui passe avant les initiales. Nommez-le avec <code>alt</code>, faute de personne dont le nom conviendrait : <code>name</code> servirait aussi de graine à la couleur et imprimerait ses initiales dessous.",
    },
    initials: {
      title: 'Initiales et couleur automatique',
      text: 'Sans photo ni icône, le disque affiche la première lettre de chacun des deux premiers mots de <code>name</code>, sur une couleur dérivée de ce même nom. La dérivation est un simple hachage, sans stockage ni réseau : la même personne reçoit la même couleur sur toutes les pages, dans les deux thèmes.',
    },
    sizes: {
      title: 'Tailles',
      text: "Le diamètre vient de l'échelle de tailles partagée par tous les contrôles : 24, 32, 40, 48 et 56 pixels. Tout ce qui est à l'intérieur suit, les initiales comme une icône.",
    },
    compact: {
      title: 'Compact',
      text: "Chaque paire ci-dessous est un palier de l'échelle, le second des deux étant <code>compact</code> : 4px partent du diamètre, le même écart que prend tout autre contrôle, si bien qu'un avatar posé dans une barre dense garde la ligne. L'icône à l'intérieur est une fraction du disque et rétrécit avec lui ; les initiales gardent la taille de texte de leur palier.",
    },
    color: {
      title: 'Couleur personnalisée',
      text: "Une <code>color</code> remplace la teinte dérivée du nom. L'hexadécimal, un nom de couleur CSS et <code>oklch()</code> sont tous acceptés, et le texte par-dessus est toujours blanc : vérifier qu'il se lit sur votre couleur vous revient.",
    },
    interactive: {
      title: 'Boutons et liens',
      text: "<code>clickable</code> rend un <code>&lt;button&gt;</code> et <code>href</code> un <code>&lt;a&gt;</code>, l'adresse l'emportant quand les deux sont donnés. Dans les deux cas le disque gagne un état de survol et un anneau de focus, et <code>disabled</code> le rend inerte : le troisième avatar ci-dessous est un lien dont l'adresse a été retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
    },
    tooltip: {
      title: 'Avec une infobulle',
      text: "Une VTooltip a besoin d'un déclencheur capable de prendre le focus, sans quoi un utilisateur au clavier ne la verrait jamais. Un avatar <code>clickable</code> ou un lien en est un ; un simple disque non. Donnez donc à l'infobulle la forme interactive et liez ses <code>triggerProps</code> sur l'avatar, qui les transmet à l'élément sous-jacent.",
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
        size: "Le diamètre du disque, tiré de l'échelle de tailles partagée par tous les contrôles. Omise dans un VAvatarGroup, elle prend celle du groupe, ce qui est tout l'intérêt de ne pas lui donner de valeur par défaut ici ; seul, l'avatar est en <code>md</code>.",
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
