export default {
  title: 'Zone de texte',
  lead: '<code>VTextarea</code> est un champ multiligne avec un libellé, un texte d’aide, des icônes et des actions facultatifs. Utilisez <code>autoGrow</code> pour adapter sa hauteur au contenu.',
  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: '<code>label</code> nomme le champ. <code>hint</code> ajoute un texte d’aide lié par <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste les espacements internes, le texte et les icônes. <code>rows</code> définit le nombre de lignes ; <code>compact</code> réduit les espacements verticaux.',
    },
    icons: {
      title: 'Icônes',
      text: '<code>iconStart</code> et <code>iconEnd</code> s’alignent sur la première ligne. Utilisez <code>#start</code> et <code>#end</code> pour du contenu personnalisé.',
    },
    clickableIcons: {
      title: 'Icônes cliquables',
      text: 'Ajoutez un écouteur <code>@click:icon-start</code> ou <code>@click:icon-end</code> pour transformer une icône en bouton. Fournissez son nom accessible avec <code>iconStartLabel</code> ou <code>iconEndLabel</code>.',
    },
    clearable: {
      title: 'Bouton d’effacement',
      text: '<code>clearable</code> ajoute un bouton qui vide le champ, émet <code>clear</code> et lui rend le focus.',
    },
    counters: {
      title: 'Compteur de caractères',
      text: '<code>counter</code> affiche le nombre de caractères sous le champ. Avec <code>maxlength</code>, <code>softLimit</code> autorise la saisie au-delà de la limite et signale une erreur de validation native.',
    },
    autoGrow: {
      title: 'Hauteur automatique',
      text: '<code>autoGrow</code> adapte la hauteur au contenu, avec <code>rows</code> comme minimum. Sans cette option, le champ défile et peut être redimensionné verticalement.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> bloque les interactions. <code>readonly</code> permet le focus et la copie. <code>invalid</code> signale une erreur, et <code>error</code> affiche aussi son message à la place de l’aide. <code>loading</code> affiche un indicateur de chargement sans empêcher la saisie.',
    },
  },
  api: {
    VTextarea: {
      props: {
        size: 'Ajuste les marges internes, le texte et les icônes. <code>rows</code> fixe le nombre de lignes.',
        compact:
          'Réduit les espacements verticaux sans modifier le nombre de lignes, le texte ni les icônes.',
        rows: 'Nombre de lignes visibles, arrondi à un entier d’au moins 1. Avec <code>autoGrow</code>, définit la hauteur minimale.',
        autoGrow:
          'Adapte la hauteur au contenu avec la propriété CSS <code>field-sizing</code>. Désactive le redimensionnement manuel. Sans prise en charge par le navigateur, le champ garde une hauteur fixe et défile.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        disabled:
          'Désactive le champ et l’exclut de la navigation par Tab et de l’envoi du formulaire.',
        readonly:
          'Empêche la modification tout en permettant le focus et la copie. Masque le bouton d’effacement sauf si <code>clearVisible</code> impose sa visibilité.',
        label:
          'Libellé visible lié à la zone de texte. Si omis, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
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
          'Nombre de caractères sous le champ : <code>12/80</code> avec une limite, ou <code>12</code> sans limite.',
        vModel: 'Texte du champ. Vaut une chaîne vide par défaut.',
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
        end: 'Contenu remplaçant <code>iconEnd</code>. Masqué pendant le chargement.',
        valueEnd:
          'Contenu après la zone de saisie, avant le bouton d’effacement et l’icône de fin.',
      },
    },
  },
}
