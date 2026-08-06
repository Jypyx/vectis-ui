# Accessibility

Accessibility in Vectis UI is a build step, not a review stage. Every interaction test
runs in a real browser and is followed by an axe audit, in the light theme and again in
the dark one; a violation fails the build. The suite sits at zero violations in both
themes and is meant to stay there.

That arrangement is what makes the guarantees below checkable rather than aspirational.

## What the components give you

Keyboard navigation and ARIA semantics come with each component rather than being your
job to add:

- the ARIA menu pattern in `VMenu` — roving focus, submenus forming a native popover
  stack, focus returned to the trigger on dismissal;
- the combobox/listbox pattern in `VCombobox` — `aria-activedescendant`, with DOM focus
  staying in the input, so the panel needs no keyboard of its own;
- `role="switch"` on `VSwitch`, `role="status"` or `role="alert"` on toasts depending on
  criticality, `aria-current="page"` on the active navigation item;
- tooltips linked by `aria-describedby` and dismissible with Escape, per WCAG 1.4.13;
- a mandatory accessible `label` on `VIconButton` — the prop is required, so an unnamed
  icon button does not compile;
- `prefers-reduced-motion` honoured by every transition and animation.

## Disabled is a colour, not an opacity

A disabled control switches to `--vectis-color-surface-muted` and
`--vectis-color-text-subtle` rather than being faded with `opacity`. Two reasons: opacity
compounds unpredictably over whatever is behind it, and it degrades contrast in a way that
depends on the page rather than on the theme. Tokens follow the dark theme correctly;
opacity does not.

The one exception is `loading`, which does keep an opacity — it is a transient state, and
the control retains its colours underneath.

## Focus is never removed

Every focusable element carries a visible ring, drawn from `--vectis-focus-ring-width`,
`--vectis-focus-ring-color` and `--vectis-focus-ring-offset`. Where a component clips its
own overflow — a scrolling tab bar, a framed accordion — the ring is drawn inside with a
negative offset rather than being dropped.

## What the audit cannot judge

Two places in the library paint text over a sibling it only partly covers: the clipped
copy of a `VProgressLinear` label, and the selected numeral on `VTimePicker`'s dial. axe
derives a background from the boxes containing an element's rectangle, so it measures
those against whatever lies underneath and reports a false failure.

Both are excluded by name, with the reasoning recorded next to the exclusion. An exclusion
is for a tool limitation, never for a real violation.

## Your side of the contract

The library cannot see your content. Three things stay yours:

- **heading order** — components render the heading levels you ask for;
- **landmarks** — one `<main>`, named `<nav>` elements where there is more than one;
- **the accessible name of anything you fill** — a `VIcon` you pass a `label` to becomes
  informative, and one you do not stays decorative, which is usually right.

This site is checked the same way, with axe over the built pages in both themes.
