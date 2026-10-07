export default {
  title: 'Popover',
  lead: '<code>VPopover</code> ancre un panneau popover natif à un déclencheur. Ajoutez le rôle et le comportement clavier requis par votre contenu.',
  examples: {
    placements: {
      title: 'Positions',
      text: '<code>placement</code> définit la position souhaitée. Le panneau change de côté si l’espace manque.',
    },
    interactiveContent: {
      title: 'Contenu interactif',
      text: 'Les panneaux peuvent contenir des contrôles. Le focus n’est pas piégé ; fournissez un comportement clavier adapté au contenu.',
    },
    modes: {
      title: 'Modes',
      text: '<code>auto</code> ferme au clic extérieur ou avec Échap. En mode <code>manual</code>, gérez vous-même la fermeture. Pilotez la visibilité avec <code>v-model:open</code> ou les méthodes exposées <code>show</code> et <code>close</code>.',
    },
    matchTrigger: {
      title: 'Aligner sur le déclencheur',
      text: '<code>matchTrigger</code> utilise la largeur du déclencheur comme largeur minimale du panneau.',
    },
    anchor: {
      title: 'Ancrer sur son propre élément',
      text: 'Utilisez <code>anchor</code> pour une ancre CSS existante, notamment avec un champ texte. Définissez l’ancre sur le cadre du contrôle et limitez sa portée depuis un parent.',
    },
  },
  api: {
    VPopover: {
      props: {
        id: 'Identifiant du panneau. Généré si absent.',
        placement: 'Position souhaitée du panneau ; change de côté si l’espace manque.',
        mode: '<code>auto</code> utilise la fermeture native au clic extérieur et avec Échap. <code>manual</code> exige vos propres contrôles de fermeture.',
        anchor:
          'Nom d’ancre CSS existante, comme <code>--tooltip-anchor</code>. Supprime l’enveloppe du déclencheur ; requis pour les champs texte.',
        bare: 'Retire le fond, la bordure, l’ombre et le rayon du panneau.',
        matchTrigger: 'Définit la largeur du déclencheur comme largeur minimale du panneau.',
        vModelOpen:
          'État ouvert synchronisé avec la fermeture native. Utilisez <code>show</code> / <code>close</code> pour des changements synchrones.',
      },
      slots: {
        trigger: 'Contrôle déclencheur. Liez les <code>triggerProps</code> fournis à un bouton.',
        default: 'Contenu du panneau.',
      },
    },
  },
}
