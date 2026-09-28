export default {
  title: 'Groupe de boutons',
  lead: '<code>VButtonGroup</code> rassemble des actions liées et partage la disposition et les réglages d’apparence entre <code>VButton</code> et <code>VIconButton</code>.',
  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: 'Le <code>variant</code> du groupe remplace celui de chaque bouton. Son <code>tone</code> s’applique uniquement aux boutons sans ton propre.',
    },
    toneOverride: {
      title: 'Tons individuels',
      text: 'Définissez le <code>tone</code> d’un bouton pour remplacer celui du groupe, par exemple pour signaler une action destructrice.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> dispose les boutons en colonne.',
    },
    detached: {
      title: 'Boutons séparés',
      text: '<code>detached</code> sépare les boutons en conservant les réglages d’apparence du groupe.',
    },
    seamless: {
      title: 'Sans séparateurs',
      text: '<code>seamless</code> retire les séparateurs internes et conserve la bordure extérieure. Sans effet avec <code>detached</code>.',
    },
    elevated: {
      title: 'Avec une ombre',
      text: '<code>elevated</code> ajoute une ombre au groupe, ou à chaque bouton lorsqu’ils sont séparés.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille de tous les boutons et remplace les tailles individuelles.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit la hauteur de chaque bouton.',
    },
    fullWidth: {
      title: 'Pleine largeur',
      text: '<code>fullWidth</code> occupe toute la largeur du parent. Dans un groupe horizontal, les boutons ont la même largeur.',
    },
    icons: {
      title: 'Avec des icônes',
      text: 'Utilisez <code>iconStart</code> et <code>iconEnd</code> sur les boutons, ou <code>VIconButton</code> avec un <code>label</code> obligatoire.',
    },
    link: {
      title: 'Liens',
      text: 'Définissez <code>href</code> sur un bouton pour afficher un lien. Un lien désactivé ou en chargement ne permet pas de naviguer.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> désactive tous les boutons. Définissez <code>loading</code> sur les boutons concernés.',
    },
  },
  api: {
    VButtonGroup: {
      props: {
        orientation: 'Disposition en ligne horizontale ou en colonne verticale.',
        detached:
          'Sépare les boutons par un espace. Chacun garde ses coins et bordures ; les réglages d’apparence du groupe restent appliqués.',
        seamless:
          'Retire les séparateurs internes et conserve la bordure extérieure. Sans effet avec <code>detached</code>.',
        fullWidth:
          'Occupe toute la largeur du parent. Les boutons horizontaux ont la même largeur, mais peuvent déborder si leur contenu est trop large.',
        variant:
          'Style visuel de tous les boutons. Remplace les variantes individuelles ; si omis, chaque bouton conserve la sienne.',
        tone: 'Ton appliqué aux boutons sans <code>tone</code> propre.',
        size: 'Taille de tous les boutons. Remplace les tailles individuelles ; si omise, chaque bouton conserve la sienne.',
        compact:
          'Réduit la hauteur des boutons. Remplace les valeurs individuelles, même avec <code>false</code> ; si omis, chaque bouton conserve la sienne.',
        elevated:
          'Ajoute une ombre au groupe, ou à chaque bouton avec <code>detached</code>. Remplace les valeurs individuelles, même avec <code>false</code> ; si omis, chaque bouton conserve la sienne.',
        disabled:
          'Désactive tous les boutons. La valeur <code>false</code> ne réactive pas les boutons désactivés individuellement.',
        label:
          'Nom accessible du groupe, par exemple « Mise en forme ». Les attributs <code>aria-label</code> ou <code>aria-labelledby</code> fournis prennent le pas sur cette prop.',
      },
      slots: {
        default: 'Les composants <code>VButton</code> et <code>VIconButton</code> à regrouper.',
      },
    },
  },
}
