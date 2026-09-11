export default {
  title: 'Popover',
  lead: "La plomberie sur laquelle repose chaque panneau flottant de la bibliothèque : l'élément popover natif, son ancrage et son état d'ouverture. Il ne porte ni rôle, ni clavier, ni politique de fermeture propre, qui restent à la charge de ce qui l'utilise.",

  examples: {
    placements: {
      title: 'Positions',
      text: "Douze positions relatives au déclencheur, sur l'un ou l'autre axe et alignées sur l'un ou l'autre bord. La valeur nomme une préférence et non une position : le navigateur bascule le panneau du côté opposé de lui-même quand la place manque du côté demandé, ce qui évite toute mesure et toute liste de repli à écrire soi-même.",
    },
    interactiveContent: {
      title: 'Contenu interactif',
      text: "Un panneau peut contenir de vrais contrôles. La fermeture légère ne part que sur un clic à l'EXTÉRIEUR : tout ce qui est dedans continue donc de fonctionner, et le focus n'est pas piégé, un popover n'étant pas une boîte de dialogue : le lecteur peut en sortir à la tabulation, ce qu'un panneau dismissible doit permettre. Ce que le composant ne fournit PAS, c'est un rôle, un clavier ou une politique de fermeture. Un panneau qui se comporte comme un menu, c'est VMenu ; un panneau qui décrit un élément, c'est VTooltip ; un panneau qui liste des options, c'est VCombobox, et les trois sont bâtis là-dessus.",
    },
    modes: {
      title: 'Modes',
      text: "<code>auto</code> confie la fermeture au navigateur : un clic à l'extérieur ou Escape referme le panneau, et plusieurs panneaux s'empilent de sorte qu'une seule fermeture referme la branche. <code>manual</code> vous la rend, ce dont a besoin un panneau ayant ses propres règles de focus et de fermeture, et cela implique que le panneau offre une sortie. L'état d'ouverture est un modèle alimenté depuis le DOM : un panneau que le navigateur a refermé le rapporte, au lieu de vous laisser remettre un drapeau à zéro. Poser ce modèle coûte un tick ; quand l'ouverture doit être synchrone, parce qu'un déplacement de focus ou un minuteur est armé en supposant le panneau déjà là, les <code>show</code> et <code>close</code> exposés sont la voie.",
    },
    matchTrigger: {
      title: 'Aligner sur le déclencheur',
      text: "Empêche le panneau d'être plus étroit que ce sur quoi il est ancré, ce que veut une liste courte sous un bouton large. C'est un PLANCHER et non une contrainte : un contenu qui a besoin de plus de place l'obtient quand même, si bien qu'une liste de longs libellés sous un champ court dépasse le champ au lieu d'être comprimée à sa largeur.",
    },
    anchor: {
      title: 'Ancrer sur son propre élément',
      text: "Quand on lui donne le nom d'une ancre qu'on a posée soi-même, VPopover ne rend aucun conteneur et place le panneau face à ce qui porte ce nom. C'est la voie obligatoire dès que le déclencheur est un champ texte, où l'attribut <code>popovertarget</code> du navigateur n'est pas autorisé du tout, et c'est ainsi que le combobox et les deux sélecteurs ancrent leurs panneaux. Deux règles vont avec. Le nom se pose sur l'élément sous lequel le panneau doit venir, la boîte du champ elle-même plutôt qu'un conteneur qui porte aussi un libellé, faute de quoi le panneau s'ouvre à une hauteur de libellé de là. Et un élément englobant doit CONFINER ce nom : un popover affiché passe dans la couche supérieure et se résout contre le document entier, donc sans ce confinement tous les panneaux de la page s'attacheraient au dernier élément ayant nommé l'ancre.",
    },
  },

  api: {
    VPopover: {
      props: {
        id: "L'identifiant du panneau, celui que la gâchette désigne. Un identifiant est généré quand aucun n'est donné : cette prop ne sert donc qu'à relier le panneau à quelque chose d'extérieur au composant.",
        placement:
          'Où le panneau se place par rapport à sa gâchette. Le navigateur le bascule de lui-même du côté opposé quand la place manque.',
        mode: "Comment le panneau se ferme. <code>auto</code> laisse le navigateur le fermer sur un clic à l'extérieur ou sur Échap, et l'empiler avec d'autres panneaux ; <code>manual</code> vous laisse tout, ce dont a besoin un panneau ayant ses propres règles de focus et de fermeture.",
        anchor:
          "Le nom d'une ancre que vous avez posée sur votre propre contrôle, écrit en identifiant CSS à tirets comme <code>--tooltip-anchor</code>. Le fournir remplace l'enveloppe interne, ce qui est la voie obligatoire dès que la gâchette est un champ de texte, où l'attribut <code>popovertarget</code> du navigateur n'est pas admis.",
        bare: "Retire au panneau la surface du design system : ni fond, ni bordure, ni ombre, ni coins arrondis. C'est ce que demande un panneau dont le contenu apporte les siens, comme le fait VDatePicker.",
        matchTrigger:
          "Empêche le panneau d'être plus étroit que ce à quoi il est ancré. C'est un plancher : un panneau qui a sa propre largeur la dépasse toujours au lieu d'être ramené à celle du déclencheur, ce que veut une liste de libellés longs sous un champ court.",
        vModelOpen:
          'Si le panneau est affiché. Il part fermé et il est bidirectionnel, alimenté depuis le DOM : en mode <code>auto</code>, la fermeture légère du navigateur y réécrit. Le poser ouvre et ferme le panneau ; quand le changement doit être synchrone, utilisez plutôt les <code>show</code> et <code>close</code> exposés, ce que font VTooltip et les sélecteurs.',
      },
      slots: {
        trigger:
          "L'élément qui ouvre le panneau. Liez les <code>triggerProps</code> qu'il reçoit sur un bouton à vous : c'est ce qui relie les deux.",
        default: 'Ce que contient le panneau.',
      },
    },
  },
}
