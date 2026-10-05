export default {
  title: 'Curseur',
  lead: '<code>VSlider</code> sélectionne un nombre ou un intervalle avec un ou deux curseurs. Des champs numériques facultatifs permettent une saisie précise.',
  examples: {
    range: {
      title: 'Intervalle',
      text: '<code>range</code> utilise une paire ordonnée. Déplacer un curseur au-delà de l’autre les amène tous deux à la nouvelle valeur.',
    },
    minMax: {
      title: 'Minimum et maximum',
      text: '<code>min</code> et <code>max</code> définissent les bornes, y compris négatives.',
    },
    steps: {
      title: 'Pas',
      text: '<code>step</code> définit l’incrément. <code>ticks</code> affiche les repères jusqu’à 50 pas.',
    },
    textLabels: {
      title: 'Libellés texte',
      text: '<code>labels</code> nomme chaque pas et fournit son texte de valeur accessible. Active aussi les repères.',
    },
    iconLabels: {
      title: 'Libellés icône',
      text: 'Les libellés peuvent mélanger des chaînes et des objets contenant une icône et un texte accessible.',
    },
    tooltip: {
      title: 'Infobulle de valeur',
      text: '<code>tooltip</code> affiche la valeur pendant le déplacement ou le focus clavier.',
    },
    inputs: {
      title: 'Champs numériques',
      text: '<code>inputs</code> ajoute des champs numériques. La perte du focus ou Entrée valide la valeur, limitée aux bornes et alignée sur le pas. Une saisie invalide restaure la valeur précédente.',
    },
    inputsPlacement: {
      title: 'Position des champs',
      text: '<code>ends</code> place les champs aux extrémités de la piste ; <code>top</code> et <code>bottom</code> les placent au-dessus ou en dessous. Sur un slider vertical, ces positions deviennent les côtés de début et de fin.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> place la valeur minimale en bas.',
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> désactive les curseurs et les champs numériques.',
    },
    form: {
      title: 'Dans un formulaire',
      text: '<code>label</code> nomme le slider sans texte visible. Les noms ARIA fournis prennent le pas sur cette prop. Les attributs natifs atteignent le curseur de fin ; en mode intervalle, seule cette valeur est envoyée.',
    },
    sizes: {
      title: 'Taille des champs',
      text: '<code>size</code> ajuste les champs numériques. La taille définie par <code>VInputGroup</code> prend le pas sur cette valeur.',
    },
    readonly: {
      title: 'Lecture seule',
      text: '<code>readonly</code> empêche les changements par pointeur ou clavier et conserve le focus.',
    },
    invalid: {
      title: 'Invalide',
      text: '<code>invalid</code> signale une erreur sur les curseurs et champs numériques avec <code>aria-invalid</code> et le style d’erreur.',
    },
  },
  api: {
    VSlider: {
      props: {
        readonly:
          'Empêche les changements par pointeur ou clavier. Les curseurs gardent le focus ; les champs numériques passent en lecture seule.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        size: 'Taille des champs numériques, remplacée si <code>VInputGroup</code> définit une taille.',
        min: 'Valeur minimale.',
        max: 'Valeur maximale.',
        step: 'Incrément pour les curseurs, le clavier et les champs numériques.',
        range: 'Active deux curseurs et une paire ordonnée pour <code>v-model</code>.',
        disabled: 'Désactive les interactions.',
        label:
          'Nom accessible sans texte visible. Les curseurs d’intervalle reçoivent des noms distincts de début et de fin.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        orientation: 'Sens de la piste. Les sliders verticaux placent le minimum en bas.',
        inputs:
          'Position des champs numériques : <code>ends</code>, <code>top</code>, <code>bottom</code>, ou <code>false</code> pour les masquer. Le mode intervalle ajoute deux champs.',
        ticks:
          'Affiche les repères de pas, aussi activés par <code>labels</code>. Masqués au-delà de 50 pas.',
        labels:
          'Libellés des pas dans l’ordre, chaînes ou objets avec icône et libellé. Fournit aussi le texte de valeur accessible.',
        tooltip:
          'Affiche la valeur pendant le déplacement ou le focus d’un curseur. Masqué aux technologies d’assistance.',
        vModel:
          'Nombre ou paire ordonnée avec <code>range</code>. Croiser les curseurs déplace l’autre borne pour conserver l’ordre.',
      },
      events: {
        input: 'Émet la valeur complète pendant le déplacement d’un curseur.',
        change:
          'Émet la valeur validée après l’interaction avec un curseur ou la validation d’un champ numérique.',
      },
    },
  },
}
