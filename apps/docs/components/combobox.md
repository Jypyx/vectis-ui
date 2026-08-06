<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from '@vectis/ui'

const single = ref('')
const multiple = ref<string[]>(['fr'])

const countries = [
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  // Accented on purpose: it is what the accent-insensitive filter is demonstrated with.
  { value: 're', label: 'Réunion' },
  { value: 'us', label: 'United States' },
]

const grouped = [
  { label: 'Europe', options: [countries[0], countries[1]] },
  { separator: true as const },
  { label: 'Elsewhere', options: [countries[2], countries[4]] },
]
</script>

# Combobox

A searchable select, composed of `VInput` for the field, `VPopover` for the panel and
`VChip` for the values in multiple mode. It implements the ARIA combobox/listbox pattern
the platform does not cover — there is no stylable `<datalist>`, and no multiple one.

The search field in this site's header is this component.

<DocsDemo>
  <VCombobox v-model="single" :options="countries" aria-label="Country" placeholder="Pick a country" style="inline-size: 16rem" />
</DocsDemo>

Type `reunion` without the accent: the filter normalises both sides, so it still matches
_Réunion_.

## Multiple selection

The model becomes an array and the values render as chips, one step below the field's own
size. Unfocused, the search input folds away so no empty space is left — it stays in the
DOM and stays focusable.

<DocsDemo>
  <VCombobox v-model="multiple" :options="countries" multiple aria-label="Countries" placeholder="Pick countries" style="inline-size: 18rem" />
</DocsDemo>

## Groups and separators

An entry may be an option, a named group, or a separator. A group whose every option is
filtered out disappears, label included, and separators are **deferred** — one is only
drawn if there is content on both sides of it, which covers the head, tail and consecutive
cases with a single mechanism.

<DocsDemo>
  <VCombobox :options="grouped" aria-label="Destination" placeholder="Grouped" style="inline-size: 16rem" />
</DocsDemo>

```ts
const options = [
  { label: 'Europe', options: [france, germany] },
  { separator: true },
  { label: 'Elsewhere', options: [japan, unitedStates] },
]
```

## Asynchronous sources

Set `filter` to `false` to disable local filtering entirely, and listen to `search`. The
term is debounced — `search-debounce`, `0` for synchronous — deduplicated, emitted
immediately when the panel opens, and cancelled wherever the panel closes.

```vue
<VCombobox
  v-model="value"
  :options="results"
  :filter="false"
  :loading="pending"
  :has-more="hasMore"
  @search="query = $event"
  @load-more="fetchNextPage()"
/>
```

`has-more` renders a sentinel watched by an `IntersectionObserver` inside the panel, which
emits `load-more` when it comes into view. It is re-observed on every page received, so a
page too short to fill the panel does not stall pagination.

`loading` fills the panel when there is nothing yet, and becomes a footer spinner once
there is — the order is loading, then empty, then content.

This site's search field is exactly this shape: `filter: false`, a `search` handler
querying a MiniSearch index, and results mapped to options.

## Slots

`#option` replaces a row's content and receives `{ option, index, active, selected }` —
this site uses it to stack a title, a breadcrumb and an excerpt.

`#chip` replaces a value's chip in multiple mode and receives `{ value, option, label,
remove, size, compact }`. The `remove` callback matters: without it a custom chip could no
longer be removed. So do `size` and `compact`, which carry the "one step below the field"
mapping you would otherwise have to guess.

`#empty` and `#loading` cover the two panel states.

## Sizes

`sm`, `md` and `lg` — 32, 40 and 48px — plus `compact`. The size propagates to the panel
unchanged, so its rows follow. `xs` is not exposed: 24px is too short for editable text.

## Accessibility

- **Name the field.** Pass `aria-label`, or associate a `<label>` — it is forwarded to the
  input, which is what names the `role="combobox"`. A `placeholder` will not do, and in
  `multiple` mode it is not even a fallback: the placeholder disappears as soon as there
  is a selection, leaving the input with no accessible name at all.
- The field carries `role="combobox"` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant`; DOM focus never leaves it, which is why the panel needs no
  keyboard handling of its own.
- An option is disabled through `aria-disabled` rather than the native attribute, so it
  stays in the accessibility tree the field walks.
- Empty and loading states are announced through a live region **outside** the listbox: a
  `role="listbox"` owns only options and groups.
- Clicking an option works because the panel cancels `mousedown` — otherwise focus would
  leave the field and `focusout` would close the panel before the selection landed.
