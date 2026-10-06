export default {
  title: 'Sélecteur',
  lead: '<code>VSelect</code> choisit une ou plusieurs valeurs dans une liste, comme un <code>&lt;select&gt;</code> natif, avec l’apparence de <code>VCombobox</code>. Rien ne se saisit : les lettres tapées sur le champ mettent en évidence l’option correspondante.',
  examples: {
    labelAndHint: {
      title: "Label et texte d'aide",
      text: 'Utilisez <code>label</code> pour nommer le champ et <code>hint</code> pour le texte d’aide. Un clic sur le label ouvre la liste.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste le champ et les lignes d’options. <code>compact</code> réduit la hauteur du champ.',
    },
    states: {
      title: 'États',
      text: 'Utilisez <code>disabled</code>, <code>readonly</code> et <code>invalid</code> pour les états du champ, et <code>clearable</code> pour effacer la sélection. Un champ en lecture seule reste focalisable, mais sa liste ne s’ouvre jamais.',
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: '<code>options</code> accepte des options, des groupes nommés et des séparateurs. Le clavier passe par-dessus les groupes et les séparateurs.',
    },
    multiple: {
      title: 'Sélection multiple',
      text: '<code>multiple</code> utilise un tableau pour la sélection et affiche des chips amovibles. La liste reste ouverte pendant que l’on coche les options. <code>max</code> limite les valeurs visibles quand le champ n’a pas le focus.',
    },
    textDisplay: {
      title: 'Valeurs en texte',
      text: '<code>display="text"</code> réunit les libellés choisis sur une ligne, coupée par des points de suspension.',
    },
    customOption: {
      title: 'Options personnalisées',
      text: 'Utilisez <code>#option</code> pour personnaliser le contenu des options.',
    },
    form: {
      title: 'Formulaires',
      text: 'Un <code>&lt;select&gt;</code> natif masqué reçoit <code>name</code>, <code>form</code>, <code>required</code> et <code>autocomplete</code>. Le navigateur le valide à l’envoi, le remplissage automatique met à jour <code>v-model</code>, et la réinitialisation du formulaire rétablit la valeur initiale.',
    },
  },
  api: {
    VSelect: {
      props: {
        options:
          'Options, groupes nommés ou séparateurs. Chaque option a une valeur et un libellé.',
        multiple:
          'Autorise la sélection multiple. Utilisez un tableau pour <code>v-model</code>. La liste reste ouverte pendant que l’on coche les options.',
        display:
          'Affichage de la sélection multiple : chips amovibles ou texte séparé par des virgules. La sélection simple utilise toujours du texte.',
        max: 'Nombre de valeurs visibles sans focus. Le focus affiche toutes les valeurs. Absent ou nul, tout est affiché. S’applique seulement avec <code>multiple</code>.',
        overflowText:
          'Formate le nombre de valeurs masquées par <code>max</code>. Reçoit le nombre masqué.',
        label:
          'Label visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place du texte d’aide. Définit <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé à son apparition.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        size: 'Taille du champ et des options. Le champ hérite d’une taille définie par <code>VInputGroup</code>.',
        compact: 'Réduit la hauteur du contrôle sans changer le texte ni les icônes.',
        placeholder: 'Texte affiché tant que rien n’est choisi.',
        disabled: 'Désactive l’interaction. La valeur n’est pas envoyée.',
        readonly:
          'Empêche de changer la sélection. Conserve le focus et l’envoi ; masque les actions d’effacement et empêche d’ouvrir la liste.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas l’envoi du formulaire à lui seul.',
        iconStart:
          'Icône de début, avant les valeurs choisies. Un écouteur <code>@click:icon-start</code> en fait un bouton qui exige <code>iconStartLabel</code>.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        expandIcon: 'Chevron décoratif, tourné pendant que la liste est ouverte.',
        clearable: 'Ajoute une action pour effacer la sélection.',
        clearLabel: 'Nom accessible du bouton d’effacement. Par défaut, celui du dictionnaire.',
        placement: 'Position préférée du panneau par rapport au champ.',
        vModel:
          'Chaîne ou nombre choisi, ou tableau avec <code>multiple</code>. Une chaîne vide par défaut.',
      },
      events: {
        clear: 'Émis après l’effacement de la sélection.',
        clickIconStart: 'Émis à l’activation du bouton d’icône de début.',
      },
      slots: {
        option: 'Contenu d’une option. Reçoit l’option, l’index, l’état actif et l’état choisi.',
        chip: 'Chip d’une valeur choisie. Reçoit la valeur, le libellé, l’option éventuelle, <code>remove</code>, la taille et l’état compact. Branchez l’action de retrait.',
        overflow:
          'Nombre de valeurs masquées. Reçoit <code>count</code>, la taille des chips et l’état compact.',
        valueEnd: 'Contenu avant l’action d’effacement et l’icône d’ouverture.',
        start: 'Contenu après <code>iconStart</code> et les chips, sans les remplacer.',
      },
    },
  },
}
