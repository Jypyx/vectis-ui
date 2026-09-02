export default {
  title: 'Popover',
  lead: "La plomberie sur laquelle repose chaque panneau flottant de la bibliothèque : l'élément popover natif, son ancrage et son état d'ouverture. Il ne porte ni rôle, ni clavier, ni politique de fermeture propre, qui restent à la charge de ce qui l'utilise.",

  api: {
    VPopover: {
      props: {
        id: "L'identifiant du panneau, celui que la gâchette désigne. Un identifiant est généré quand aucun n'est donné : cette prop ne sert donc qu'à relier le panneau à quelque chose d'extérieur au composant.",
        placement:
          'Où le panneau se place par rapport à sa gâchette. Le navigateur le bascule de lui-même du côté opposé quand la place manque.',
        mode: "Comment le panneau se ferme. <code>auto</code> laisse le navigateur le fermer sur un clic à l'extérieur ou sur Échap, et l'empiler avec d'autres panneaux ; <code>manual</code> vous laisse tout, ce dont a besoin un panneau ayant ses propres règles de focus et de fermeture.",
        anchor:
          "Le nom d'une ancre que vous avez posée sur votre propre contrôle, écrit en identifiant CSS à tirets comme <code>--tooltip-anchor</code>. Le fournir remplace l'enveloppe interne, ce qui est la voie obligatoire dès que la gâchette est un champ de texte, où l'attribut <code>popovertarget</code> du navigateur n'est pas admis.",
        surface:
          "Donne au panneau l'allure d'une surface : fond, bordure, ombre et coins arrondis. À couper pour un panneau qui apporte les siens, comme le fait VDatePicker.",
        vModelOpen:
          'Si le panneau est affiché. Il part fermé et il est bidirectionnel, alimenté depuis le DOM : en mode <code>auto</code>, la fermeture légère du navigateur y réécrit. Le poser ouvre et ferme le panneau ; quand le changement doit être synchrone, utilisez plutôt les <code>show</code> et <code>hide</code> exposés, ce que font VTooltip et les sélecteurs.',
      },
      slots: {
        trigger:
          "L'élément qui ouvre le panneau. Liez les <code>triggerProps</code> qu'il reçoit sur un bouton à vous : c'est ce qui relie les deux.",
        default: 'Ce que contient le panneau.',
      },
    },
  },
}
