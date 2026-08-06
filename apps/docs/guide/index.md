# What is Vectis UI?

Vectis UI is a Vue 3 design system, shipped as an npm library and compatible with Nuxt 3
server-side rendering. It is built on four principles, and they are constraints rather
than aspirations — each one is visible in the code, and each one is what makes the next
one affordable.

## HTML and CSS first, JavaScript last

Every behaviour the platform already implements is taken from the platform: `<dialog>`
with `showModal()`, the Popover API, CSS anchor positioning, `<details name>` for
exclusive accordions, `:user-invalid` for validation styling, `:has()` for layout that
reacts to its own content.

JavaScript appears only where the platform leaves a gap, and where it does it has to
justify itself in a comment inside the component. The menu keeps some, for roving focus
and for bridging `v-model` to the imperative popover API; the accordion's only script is
the click it cancels on a disabled `<summary>`, because `<summary>` has no `disabled`
attribute.

The practical consequence is that a lot of the system keeps working with JavaScript
disabled, and that components stay small — the whole library has no runtime dependency
beyond Vue itself.

## One typed token source

Colour, spacing, radius, typography, shadow and duration all come from a single typed
source in TypeScript, in DTCG format, which generates the stylesheet and a JSON export.
Component styles never contain a raw value: they read semantic `--vectis-*` custom
properties, which a consumer can override at runtime without rebuilding anything.

Dark mode follows from that. The generated stylesheet sets the light palette on `:root`
and the two themes on `[data-theme='light']` and `[data-theme='dark']`, so a theme applies
to any DOM subtree — and switching one is a single attribute write.

## Accessibility as a build step, not a review

Every interaction test runs in a real browser and is followed by an axe audit, in the
light theme and again in the dark one, with violations failing the build. The suite sits
at zero violations and is meant to stay there.

## Server-side rendering that actually is

No component reads `window`, `document` or `navigator` outside `onMounted`, a watcher or
an event handler. Nothing is teleported: overlays are native popovers rendered in place
and promoted to the top layer only when opened. Ids come from Vue's `useId()`.

This site is the proof. It is statically generated, its navigation, buttons, search field
and theme switch are Vectis UI components, and its prerendered HTML contains them fully
formed — you can read it with view-source, or turn JavaScript off and still navigate.

## Where to go next

[Installation](/guide/installation) covers adding the package to a Vue or Nuxt
application. The component pages document each component's API, and Storybook holds the
live playground for every one of them.
