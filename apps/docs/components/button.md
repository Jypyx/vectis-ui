<script setup lang="ts">
import { VButton } from '@vectis/ui'
</script>

# Button

An action button built on the native `<button>` — focus, keyboard and disabling come for
free — or rendered as an `<a>` through the `href` prop. It carries no behavioural
JavaScript except one bridge, described under [Links](#links).

<DocsDemo>
  <VButton>Subscribe</VButton>
  <VButton variant="outline" tone="neutral">Cancel</VButton>
  <VButton variant="soft" tone="danger" icon-start="close">Delete</VButton>
</DocsDemo>

```vue
<VButton>Subscribe</VButton>
<VButton variant="outline" tone="neutral">Cancel</VButton>
<VButton variant="soft" tone="danger" icon-start="close">Delete</VButton>
```

## Variants and tones

Four variants — `solid`, `outline`, `ghost`, `soft` — crossed with three tones —
`accent`, `neutral`, `danger`. Every combination is valid, because the tones define
nothing but local CSS variables (`--tone-bg-solid`, `--tone-text-tinted`…) which the
variants consume.

`soft` is named after the token it paints, `--tone-bg-soft`, which also keeps it one
character clear of the `tone` prop.

<DocsDemo>
  <VButton variant="solid">Solid</VButton>
  <VButton variant="outline">Outline</VButton>
  <VButton variant="ghost">Ghost</VButton>
  <VButton variant="soft">Soft</VButton>
</DocsDemo>

<DocsDemo>
  <VButton tone="accent">Accent</VButton>
  <VButton tone="neutral">Neutral</VButton>
  <VButton tone="danger">Danger</VButton>
</DocsDemo>

There is deliberately **no `success` or `warning` tone here**. On a button, `tone`
expresses an action's _intention_ — proceed, stay neutral, destroy — whereas success and
warning are _states_. Both of those tones exist, on the components that report a state:
`VChip`, `VToast`, `VBadge`, `VTypography` and the two progress indicators.

## Elevation

`elevated` is a boolean, not a fifth variant: it is **orthogonal** to `variant`, so any of
the four can be raised. It applies the shadow scale, rising on hover and settling back on
press.

On `ghost` and `outline`, which have no background of their own, it additionally paints
the raised surface — and that is not cosmetic. In the dark theme the page is `gray-950`
and the raised surface `gray-900`, so without it the shadow would have nothing casting
it. `ghost` plus `elevated` is therefore the combination that reads as a floating card.

<DocsDemo>
  <VButton elevated>Solid</VButton>
  <VButton elevated variant="outline">Outline</VButton>
  <VButton elevated variant="ghost">Ghost</VButton>
</DocsDemo>

## Sizes

Five sizes — `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px, `xl` 56px — from the
`--vectis-control-height-*` tokens. `compact` takes 4px off the height without touching
the padding, the typography or the icon size.

The size mapping is shared by every control in the design system, which is why an `md`
button, an `md` input and an `md` skeleton line up exactly.

<DocsDemo align="center">
  <VButton size="xs">Extra small</VButton>
  <VButton size="sm">Small</VButton>
  <VButton size="md">Medium</VButton>
  <VButton size="lg">Large</VButton>
  <VButton size="xl">Extra large</VButton>
</DocsDemo>

## Icons

`icon-start` and `icon-end` take an icon name and render a `VIcon` internally. Size and
optical size follow the button's own size — 16px at `xs`, 20px at `sm`/`md`, 24px at
`lg`/`xl` — and the icons are decorative, so the accessible name stays the label.

The icons the design system renders itself are embedded SVG paths: no icon font is
required. Names of your own resolve through whichever library you wire in with
`setIconResolver`.

<DocsDemo>
  <VButton icon-start="check">Confirm</VButton>
  <VButton icon-end="chevron_right" variant="outline">Next</VButton>
  <VButton icon-start="notifications" icon-filled variant="soft">Subscribe</VButton>
</DocsDemo>

The `#start` and `#end` slots stay available for custom content — an inline SVG, an
image — and win over the props.

## Links

With `href` the component renders an `<a>`: `type` and `disabled` are not set, and link
attributes such as `target` and `rel` pass through by fallthrough.

Since an `<a>` has no native `disabled`, a disabled or loading link becomes an **inert
link**: the `href` is removed so it is neither focusable nor navigable,
`aria-disabled="true"` is set for assistive technologies, and click handlers are filtered
out of the fallthrough. This is the component's only behavioural JavaScript.

<DocsDemo>
  <VButton href="https://github.com/Jypyx/vectis-ui" target="_blank" rel="noreferrer" icon-end="open_in_new">
    Repository
  </VButton>
  <VButton href="https://example.com" disabled variant="outline">Unavailable</VButton>
</DocsDemo>

## States

`loading` disables the button, shows a spinner, sets `aria-busy` and fades it with opacity
while keeping its colours. The spinner **replaces** the start slot — never a spinner and
an icon side by side — while `icon-end` stays visible.

`disabled` switches every variant to greys (`--vectis-color-surface-muted`,
`--vectis-color-text-subtle`) rather than reaching for an opacity trick, which is what
makes it follow the dark theme correctly.

<DocsDemo>
  <VButton loading>Saving</VButton>
  <VButton disabled>Disabled</VButton>
  <VButton disabled variant="outline">Disabled</VButton>
  <VButton disabled variant="ghost">Disabled</VButton>
</DocsDemo>

## Accessibility

- Focus is always visible, through the `--vectis-focus-ring-*` ring, and never removed.
- Icons are decorative; the accessible name is the default slot's label. For an icon-only
  button use `VIconButton`, where a `label` is mandatory.
- `loading` sets `aria-busy="true"`; an inert link sets `aria-disabled="true"` and drops
  its `href`.
- Every transition respects `prefers-reduced-motion`.
