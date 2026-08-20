export default {
  title: 'Fonctions JavaScript',
  lead: "Le paquet n'exporte que des fonctions nommées, et la liste est courte à dessein : de la configuration pour l'ensemble du design system, et rien qu'un composant aurait pu faire lui-même.",

  exportedHeading: 'Ce qui est exporté',
  columnExport: 'Export',
  columnDoes: 'Ce que ça fait',
  setLocale:
    "Fixe la locale pour tout le design system. Les FORMATS dérivent d'<code>Intl</code> à partir de ce tag, qu'un dictionnaire lui corresponde ou non.",
  registerMessages:
    "Enregistre un dictionnaire. Les dictionnaires partiels sont légitimes : ce qui manque retombe sur l'anglais.",
  dictionaries:
    "Les deux dictionnaires livrés. <code>en</code> est toujours embarqué ; <code>fr</code> est optionnel — ne pas l'importer l'élague.",
  setIconResolver:
    "Branche une bibliothèque d'icônes tierce. Consulté AVANT le registre intégré ; renvoyez <code>undefined</code> pour passer la main.",
  ligatureResolver:
    "Résout un nom vers une ligature de police d'icônes — Material Symbols, IcoMoon.",
  classResolver:
    "Résout un nom vers un jeu piloté par classe — Font Awesome, Phosphor, Bootstrap Icons. Strict par défaut, si bien qu'un nom non mappé retombe sur le SVG intégré plutôt que sur un carré vide.",
  componentResolver:
    'Résout un nom vers un composant de votre propre bibliothèque — Lucide, Untitled UI.',
  toast:
    "Ajoute et retire une notification. La seule API impérative de la bibliothèque — une notification n'a pas sa place dans l'arbre qui la demande.",

  moduleState:
    "Tout ce qui précède écrit un état AU NIVEAU DU MODULE, ce qui permet de l'appeler depuis n'importe quel fichier <code>.ts</code> sans plugin ni provider, et fait que les composants déjà montés se rendent à nouveau quand il change. Cette même propriété est la contrainte : il appartient au processus et non à une requête, c'est donc de la configuration et jamais quelque chose qui varie selon le visiteur.",
  types:
    "Les types sont exportés à côté — <code>VectisMessages</code>, <code>VectisMessagesInput</code>, <code>IconSource</code>, <code>IconResolver</code>, <code>ToastOptions</code> — plus un par composant dont l'API demande à être nommée (<code>ComboboxOption</code>, <code>DataTableColumn</code>, <code>CalendarSelection</code>…).",

  internalHeading: 'Les fonctions internes, et pourquoi elles le restent',
  internalBody:
    "La bibliothèque porte un jeu complet d'aides pour les dates, les heures, les fichiers et le texte — ce sont elles qui font VCalendar, VDatePicker, VTimePicker et VFileUpload. Elles ne sont PAS exportées, et la raison est énoncée au point d'entrée : les modules internes ne font pas partie de la surface publique, si bien que leurs signatures restent libres de changer avec les composants qui s'en servent.",
  columnModule: 'Module',
  columnInternal: 'Fonctions internes',
  internalQuote:
    "Deux d'entre elles méritent d'être recopiées plutôt qu'importées : <code>hourCycleFor(locale)</code> et <code>firstDayOfWeekFor(locale)</code> répondent à des questions auxquelles <code>Intl</code> ne répond qu'indirectement.",

  composablesHeading: 'Composables',
  composablesBody:
    "La même règle couvre les treize composables — <code>usePopover</code>, <code>useFieldPanel</code>, <code>useMaskedField</code>, <code>useFocusoutDismiss</code>, <code>useTextLimit</code>, <code>useRootAttrs</code>, <code>useTimer</code> et les leurs : internes, non exportés, et documentés dans leurs propres fichiers. Si vous vous surprenez à en vouloir un, c'est une demande de composant.",
}
