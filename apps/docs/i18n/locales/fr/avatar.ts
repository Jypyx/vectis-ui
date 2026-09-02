export default {
  title: 'Avatar',
  lead: 'Une personne ou une chose, en disque. Une photo quand il y en a une, une icône ou les initiales sinon, sur une couleur dérivée du nom pour que la même personne garde la même partout.',

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
