<script setup lang="ts">
definePageMeta({ layout: 'docs' })
useHead({ title: 'CSS helper classes' })

const vhCode = `.v-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`

const layersCode = `@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* your rule, in no layer at all, wins */
.checkout-cta { border-radius: 9999px; }`
</script>

<template>
  <h1>CSS helper classes</h1>
  <p class="vd-lead">
    One utility class ships, and that is deliberate: a design system that ships utilities competes
    with the framework the consumer already chose.
  </p>

  <h2 id="v-visually-hidden">v-visually-hidden</h2>
  <p>
    Takes an element out of sight while leaving it in the accessibility tree — the label a screen
    reader needs and a sighted reader does not. It lives in
    <code>vectis.utilities</code>, the strongest layer, so it wins over any component rule.
  </p>
  <DocsCode lang="css" :code="vhCode" />
  <p>
    Note what it is NOT: <code>display: none</code> and <code>visibility: hidden</code> both remove
    the element from the accessibility tree as well as from the page, and <code>width: 0</code> is
    announced by some screen readers and skipped by others. The clip is what keeps it readable and
    unseen at once.
  </p>

  <h2 id="the-layers">The layers</h2>
  <p>Four, declared in this order, and the order is the whole override model:</p>
  <DocsCode lang="css" :code="layersCode" />
  <p>
    Any non-layered consumer style wins automatically. Write an unlayered rule, or write into
    <code>vectis.utilities</code> — never a specificity war, and never <code>!important</code>.
    Every line of CSS on this site takes that path: its layout, its fonts and its accent are all
    unlayered rules sitting on top of the library.
  </p>
  <blockquote>
    One trap comes with it. A layer name is GLOBAL and not namespaced, so writing
    <code>@layer vectis.components { … }</code> in your own stylesheet puts your rule INSIDE the
    library's layer, where it is arbitrated by the order above rather than winning over it. Leaving
    your CSS unlayered is both simpler and stronger.
  </blockquote>

  <h2 id="internal-classes">The internal classes you will see in the DOM</h2>
  <p>
    These are not an API — they are named here because you will read them in devtools, and because a
    targeted override needs the right hook. They can change; a custom property cannot.
  </p>
  <DocsTable :columns="['Class', 'What carries it']">
    <tr>
      <td><code>.v-control</code></td>
      <td>
        Every control. Reads the size table and publishes <code>--control-height</code>,
        <code>--control-padding-inline</code>, <code>--control-font-size</code> and
        <code>--control-gap</code> for its children.
      </td>
    </tr>
    <tr>
      <td><code>.v-panel</code></td>
      <td>
        The shared floating-panel chrome: overlay surface, 1px border,
        <code>radius-overlay</code>, <code>shadow-lg</code>.
      </td>
    </tr>
    <tr>
      <td><code>.v-overlay</code> · <code>.v-floating</code></td>
      <td>
        Top-layer placement and the anchor-positioned entry animation (fade plus
        <code>scale(0.97)</code>).
      </td>
    </tr>
    <tr>
      <td><code>.v-tone</code></td>
      <td>
        The tone table, on the element carrying <code>data-tone</code>. It publishes
        <code>--tone-bg-solid</code>, <code>--tone-text-tinted</code> and their kin, which the
        variants consume.
      </td>
    </tr>
    <tr>
      <td><code>.v-icon-ligature</code></td>
      <td>An icon rendered as a font ligature rather than an embedded path.</td>
    </tr>
    <tr>
      <td><code>[data-theme]</code></td>
      <td>
        Not a class: the one signal in the document. It moves the roles and drives
        <code>color-scheme</code>.
      </td>
    </tr>
  </DocsTable>

  <h2 id="the-custom-properties-to-aim-at">The custom properties to aim at</h2>
  <p>
    Prefer repointing a property to rewriting a rule: <code>--vectis-color-accent</code>,
    <code>--vectis-radius-interactive</code>, <code>--vectis-icon-size</code>,
    <code>--vectis-focus-ring-color</code>, <code>--vectis-text-family-heading</code>. A component
    reads them every render, so the change follows every state — hover, focus, disabled — without a
    single one of them being restated.
  </p>
</template>
