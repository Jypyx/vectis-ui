export default {
  title: 'Champ de saisie',
  lead: '<code>VInput</code> est un champ sur une ligne avec un libellé, un texte d’aide, des icônes et des actions facultatifs.',
  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: '<code>label</code> nomme le champ. <code>hint</code> ajoute un texte d’aide lié par <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste la hauteur, les espacements internes, le texte et les icônes. <code>compact</code> réduit uniquement la hauteur.',
    },
    icons: {
      title: 'Icônes',
      text: 'Ajoutez des icônes décoratives avec <code>iconStart</code> et <code>iconEnd</code>, ou du contenu personnalisé avec <code>#start</code> et <code>#end</code>.',
    },
    clearable: {
      title: 'Bouton d’effacement',
      text: '<code>clearable</code> ajoute un bouton qui vide le champ et lui rend le focus. Utilisez <code>clearVisible</code> pour contrôler sa visibilité.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> bloque les interactions. <code>readonly</code> permet le focus et la copie. <code>invalid</code> signale une erreur, et <code>error</code> affiche aussi son message à la place de l’aide. <code>loading</code> affiche un indicateur de chargement sans empêcher la saisie.',
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: 'Ajoutez un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> pour transformer une icône en bouton. Fournissez son nom accessible avec <code>iconStartLabel</code> ou <code>iconEndLabel</code>.',
    },
    counters: {
      title: 'Compteur de caractères',
      text: '<code>counter</code> affiche le nombre de caractères. Avec <code>maxlength</code>, <code>softLimit</code> autorise la saisie au-delà de la limite et signale une erreur de validation native.',
    },
    pattern: {
      title: 'Validation native',
      text: 'Les attributs natifs comme <code>pattern</code>, <code>inputmode</code> et <code>name</code> sont transmis au champ de saisie. <code>class</code> et <code>style</code> s’appliquent au conteneur.',
    },
  },
  api: {
    VInput: {
      props: {
        size: 'Taille du champ. Remplacée lorsque <code>VInputGroup</code> définit <code>size</code>.',
        compact:
          'Réduit la hauteur sans modifier les espacements internes, le texte ni les icônes. Remplacé lorsque <code>VInputGroup</code> définit <code>compact</code>.',
        type: 'Type natif du champ de saisie.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        disabled:
          'Désactive le champ et l’exclut de la navigation par Tab et de l’envoi du formulaire.',
        readonly:
          'Empêche la modification tout en permettant le focus et la copie. Masque le bouton d’effacement sauf si <code>clearVisible</code> impose sa visibilité.',
        noTyping:
          'Empêche la saisie avec l’attribut natif <code>readonly</code>, sans le style de lecture seule. Conserve l’effacement pour les champs modifiés via un sélecteur.',
        label:
          'Libellé visible lié au champ. Si omis, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide sous le champ, lié par <code>aria-describedby</code>.',
        iconStart:
          'Icône de début. Devient un bouton avec <code>@click:icon-start</code> ; nécessite alors <code>iconStartLabel</code>.',
        iconEnd:
          'Icône de fin. Devient un bouton avec <code>@click:icon-end</code> ; nécessite alors <code>iconEndLabel</code>. Remplacée par <code>#end</code> ou l’indicateur de chargement.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        iconEndLabel: 'Nom accessible du bouton d’icône de fin.',
        loading:
          'Remplace l’icône de fin ou le contenu de <code>#end</code> par un indicateur de chargement. Ne désactive pas le champ.',
        loadingText:
          'Texte accessible de l’indicateur de chargement. Utilise le dictionnaire de la bibliothèque par défaut.',
        clearable:
          'Ajoute un bouton d’effacement si le champ est rempli et modifiable, sauf si <code>clearVisible</code> impose sa visibilité. Masqué lorsque le champ est désactivé.',
        clearVisible:
          'Remplace les critères de contenu et de lecture seule pour afficher le bouton d’effacement. Nécessite <code>clearable</code> et un champ non désactivé.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Utilise le dictionnaire de la bibliothèque par défaut.',
        maxlength:
          'Limite native de caractères. L’attribut natif n’est pas appliqué avec <code>softLimit</code>.',
        softLimit:
          'Autorise le dépassement de <code>maxlength</code> et signale une erreur de validation native tant que la valeur dépasse la limite.',
        counter:
          'Nombre de caractères dans le champ : <code>12/80</code> avec une limite, ou <code>12</code> sans limite.',
        vModel:
          'Valeur du champ, chaîne ou nombre. Avec <code>type="number"</code>, Vue convertit la saisie numérique en nombre. Un champ vide utilise une chaîne vide.',
      },
      events: {
        clear: 'Émis après que le bouton d’effacement a remplacé la valeur par une chaîne vide.',
        clickIconStart:
          'Émis à l’activation du bouton d’icône de début. Transmet un <code>MouseEvent</code>.',
        clickIconEnd:
          'Émis à l’activation du bouton d’icône de fin. Transmet un <code>MouseEvent</code>.',
      },
      slots: {
        start: 'Contenu après <code>iconStart</code>. Ne remplace pas l’icône.',
        valueEnd:
          'Contenu après la valeur et le compteur, avant le bouton d’effacement et l’icône de fin.',
        end: 'Contenu remplaçant <code>iconEnd</code>. Masqué pendant le chargement.',
        control:
          'Contrôle remplaçant l’input, pour les champs composés. Liez-lui les <code>controlProps</code> reçues : id, classe du champ, liens ARIA et attributs transmis.',
      },
    },
  },
}
