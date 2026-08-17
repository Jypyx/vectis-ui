<script setup lang="ts">
import { VButton, VChip } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Theming' })

const darkCode = '<html data-theme="dark">'

const coralCode = `/* a "coral" theme: accent + pill radii */
:root {
  --vectis-color-accent: oklch(58% 0.2 25);
  --vectis-color-accent-hover: oklch(51% 0.19 25);
  --vectis-radius-interactive: 9999px;
}`

const layersCode = `@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* your rule, in no layer at all, wins */
.checkout-cta { border-radius: 9999px; }`
</script>

<template>
  <h1>Theming</h1>
  <p class="vd-lead">
    Every customisation is a redefinition of custom properties. There is no rebuild, and no build
    step to configure.
  </p>

  <h2 id="token-architecture">Token architecture</h2>
  <p>
    Two levels of custom properties, generated from a typed TypeScript source in a format inspired
    by the W3C DTCG.
  </p>
  <ul>
    <li>
      <strong>Primitives</strong> — 26 OKLCH palettes of eleven steps each
      (<code>--vectis-color-indigo-500</code>), plus the space scale, type, radii, shadows,
      durations and easings.
    </li>
    <li>
      <strong>Semantic roles</strong>, the only ones a component may name:
      <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>,
      <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>,
      <code>--vectis-focus-ring-color</code>.
    </li>
  </ul>
  <p>
    A component asks for the accent and never for a particular indigo, so an application can change
    what the accent IS without a single component knowing. A raw hex in component CSS is treated as
    a missing token.
  </p>
  <p>
    Five palettes are wired to roles — gray for surfaces, text and borders, indigo for the accent,
    and red, green and amber for danger, success and warning. The other twenty-one ship unused, so
    pointing a role at one of them costs nothing and waits for no release. This site does exactly
    that: its accent is violet.
  </p>

  <h2 id="dark-mode">Dark mode</h2>
  <DocsCode lang="html" :code="darkCode" />
  <p>
    Dark mode moves the ROLES, never the palette. <code>data-theme</code> works on any DOM subtree —
    a dark panel inside a light page, or the reverse — and also drives <code>color-scheme</code>, so
    scrollbars and native controls follow.
  </p>
  <div class="vd-demo" data-theme="dark" style="background: var(--vectis-color-surface)">
    <VButton variant="solid" tone="accent" size="sm">Accent</VButton>
    <VButton variant="soft" tone="accent" size="sm">Soft</VButton>
    <VButton variant="outline" tone="neutral" size="sm">Outline</VButton>
    <VChip tone="success" size="sm">Deployed</VChip>
    <span style="font-size: var(--vectis-text-body-sm-size); color: var(--vectis-color-text-muted)">
      One subtree, one attribute.
    </span>
  </div>
  <p>
    There is deliberately no <code>prefers-color-scheme</code> query in the generated tokens:
    following the system is a decision for the application, not the design system, and it is one
    line of JavaScript setting the attribute. Doing it in CSS would make the choice un-overridable
    by the reader.
  </p>

  <h2 id="runtime-overrides">Runtime overrides</h2>
  <DocsCode lang="css" :code="coralCode" />
  <p>
    Colour is written in OKLCH, always, and for two reasons the library states explicitly: one step
    of a palette is as light as the same step of any other, and mixing two of them passes through
    the shades one expects rather than through grey. Never convert a token to hex.
  </p>

  <h3 id="layers">Layers</h3>
  <p>
    The CSS lives in layers — <code>vectis.reset</code> &lt; <code>vectis.tokens</code> &lt;
    <code>vectis.components</code> &lt; <code>vectis.utilities</code> — and any non-layered consumer
    style wins automatically. That is the intended override mechanism, not a loophole: overriding a
    component never calls for a specificity war.
  </p>
  <DocsCode lang="css" :code="layersCode" />

  <h2 id="try-it">Try it</h2>
  <p>
    The configurator repoints the accent, the radii and the two families on a live subtree, which is
    exactly the mechanism described above — and hands you the CSS it applied.
  </p>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <NuxtLink to="/configurator" custom>
      <template #default="{ href, navigate }">
        <VButton
          variant="soft"
          tone="accent"
          size="md"
          icon-end="arrow_right_alt"
          :href="href ?? undefined"
          @click="navigate"
        >
          Open the configurator
        </VButton>
      </template>
    </NuxtLink>
  </div>
</template>
