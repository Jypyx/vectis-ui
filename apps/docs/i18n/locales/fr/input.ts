export default {
  title: 'Champ de saisie',
  lead: "Un champ de texte complet : libellé au-dessus, indication en dessous, icônes à l'intérieur, compteur de caractères, bouton d'effacement et état de chargement, le tout autour d'un vrai <code>&lt;input&gt;</code>.",
  validation:
    "La validation reste celle du navigateur. Le champ rougit via <code>:user-invalid</code>, qui ne réagit qu'une fois que le lecteur l'a quitté : un e-mail à moitié saisi n'est donc jamais déclaré faux.",

  anatomyHeading: 'Anatomie',
  anatomyBody:
    "Le libellé est lié au champ, donc le cliquer y place le focus, et l'indication est lue avec le libellé. La croix rend le focus au champ à l'instant où elle le vide — sans quoi un lecteur au clavier perdrait sa place dans le formulaire.",
  anatomyModel:
    'Le modèle est typé <code>string | number</code> plutôt que <code>string</code>, et ce n\'est pas du laxisme : sur <code>type="number"</code>, Vue convertit lui-même la valeur en nombre, si bien qu\'un modèle limité aux chaînes rendrait un nombre à qui lui avait passé une chaîne.',

  sizesHeading: 'Tailles et densité',
  sizesBody:
    'Trois tailles seulement — 32, 40 et 48px — parce que tout composant qui embarque une saisie de texte se limite à sm, md et lg. Le pas de 24px est trop court pour du texte éditable, et celui de 56px sort du gabarit des formulaires.',

  statesHeading: 'États',
  statesBody:
    "<code>readonly</code> montre la valeur sans permettre de la changer, et le champ peut toujours être focalisé et copié — c'est la différence avec <code>disabled</code>, dont la valeur n'est même pas envoyée. <code>invalid</code> force l'état d'erreur pour une règle que seul le serveur peut vérifier ; tout ce que le navigateur peut vérifier, il le vérifie lui-même.",

  limitsHeading: 'Compteurs et limites',
  limitsBody:
    "<code>counter</code> affiche la longueur, et avec <code>maxlength</code> l'affiche sous forme de fraction. <code>softLimit</code> rend la limite souple : le lecteur peut la dépasser, et le champ passe en erreur au lieu d'avaler la frappe — ce que l'on veut chaque fois que le texte en cours d'écriture vaut plus que la règle.",

  apiHeading: 'API',
  apiIcons:
    "<code>IconSource</code> — devient un bouton dès qu'un écouteur <code>@click:icon-start</code> / <code>@click:icon-end</code> est présent",
  apiIconLabels: "<code>string</code> — obligatoire dès que l'icône est cliquable",
  apiClearVisible:
    '<code>boolean</code> — votre propre réponse à « y a-t-il quelque chose à effacer ? »',
  apiBody:
    'Émet <code>clear</code>, <code>click:icon-start</code> et <code>click:icon-end</code> ; slots <code>#start</code> et <code>#end</code> ; et expose <code>focus()</code>, <code>select()</code> et <code>el</code>. Tout autre attribut — <code>name</code>, <code>required</code>, <code>autocomplete</code>, <code>pattern</code> — retombe sur le véritable <code>&lt;input&gt;</code>, si bien que les formulaires et la validation fonctionnent exactement comme ils le font déjà.',
  apiQuote:
    "VTextarea est le même composant avec le champ échangé : il grandit avec son contenu grâce à <code>field-sizing: content</code>, sans qu'aucun JavaScript ne mesure quoi que ce soit.",
}
