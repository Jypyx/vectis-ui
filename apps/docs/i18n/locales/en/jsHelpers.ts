export default {
  title: 'JavaScript helpers',
  lead: 'The package exports named functions only, and the list is short on purpose: configuration for the whole design system, and nothing that a component could have done itself.',

  exportedHeading: 'What is exported',
  columnExport: 'Export',
  columnDoes: 'What it does',
  setLocale:
    'Sets the locale for the whole design system. The FORMATS derive from <code>Intl</code> from this tag, whether or not a dictionary matches it.',
  registerMessages:
    'Registers a dictionary. Partial dictionaries are legitimate: what is missing falls back to English.',
  dictionaries:
    'The two shipped dictionaries. <code>en</code> is always bundled; <code>fr</code> is opt-in — not importing it prunes it.',
  setIconResolver:
    'Wires a third-party icon library. Consulted BEFORE the built-in registry; return <code>undefined</code> to hand over.',
  ligatureResolver: 'Resolves a name to an icon-font ligature — Material Symbols, IcoMoon.',
  classResolver:
    'Resolves a name to a class-driven set — Font Awesome, Phosphor, Bootstrap Icons. Strict by default, so an unmapped name falls back to the built-in SVG rather than to an empty square.',
  componentResolver: 'Resolves a name to a component from your own library — Lucide, Untitled UI.',
  toast:
    'Adds and removes a notification. The only imperative API in the library — a toast has no place in the tree that asks for it.',

  moduleState:
    'Everything above writes MODULE-LEVEL state, which is what lets it be called from any <code>.ts</code> file without a plugin or a provider, and what makes already-mounted components re-render when it changes. The same property is the constraint: it belongs to the process rather than to a request, so it is configuration and never anything that varies per visitor.',
  types:
    'Types are exported alongside them — <code>VectisMessages</code>, <code>VectisMessagesInput</code>, <code>IconSource</code>, <code>IconResolver</code>, <code>ToastOptions</code> — plus one per component whose API needs naming (<code>ComboboxOption</code>, <code>DataTableColumn</code>, <code>DatePickerSelection</code>…).',

  internalHeading: 'The internal helpers, and why they stay internal',
  internalBody:
    'The library carries a full set of date, time, file and text helpers — they are what VDatePicker, VDateInput, VTimePicker and VFilePicker are built on. They are NOT exported, and the reason is stated at the entry point: the internal modules are not part of the public surface, so their signatures stay free to change with the components that use them.',
  columnModule: 'Module',
  columnInternal: 'Internal helpers',
  internalQuote:
    'Two of them are worth copying rather than importing: <code>hourCycleFor(locale)</code> and <code>firstDayOfWeekFor(locale)</code> answer questions <code>Intl</code> only answers indirectly.',

  composablesHeading: 'Composables',
  composablesBody:
    'The same rule covers the thirteen composables — <code>usePopover</code>, <code>useFieldPanel</code>, <code>useMaskedField</code>, <code>useFocusoutDismiss</code>, <code>useTextLimit</code>, <code>useRootAttrs</code>, <code>useTimer</code> and their kin: internal, unexported, and documented in their own files. If you find yourself needing one, that is a request for a component.',
}
