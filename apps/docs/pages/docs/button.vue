<script setup lang="ts">
import { VButton, VIconButton } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Button' })

const loading = ref(false)

const variantsCode = `<VButton>Solid</VButton>
<VButton variant="soft">Soft</VButton>
<VButton variant="outline">Outline</VButton>
<VButton variant="ghost">Ghost</VButton>
<VButton elevated>Elevated</VButton>`

const linkCode = `<VButton href="/pricing">Pricing</VButton>

<!-- disabled or loading, the address is dropped: an inert link
     can be neither focused nor followed -->
<VButton href="/pricing" disabled>Pricing</VButton>`
</script>

<template>
  <h1>Button</h1>
  <p class="vd-lead">
    The button that triggers an action, and the reference from which the tone and variant tables of
    every other coloured component are taken. It renders a native <code>&lt;button&gt;</code>, or an
    <code>&lt;a&gt;</code> as soon as it is given an <code>href</code>.
  </p>

  <h2 id="variants">Variants</h2>
  <p>
    How much visual weight the action carries. VButton overrides not a single value of the shared
    tone table, which is why it is the reference.
  </p>
  <DocsDemo>
    <VButton variant="solid" tone="accent">Solid</VButton>
    <VButton variant="soft" tone="accent">Soft</VButton>
    <VButton variant="outline" tone="accent">Outline</VButton>
    <VButton variant="ghost" tone="accent">Ghost</VButton>
    <VButton variant="solid" tone="accent" elevated>Elevated</VButton>
  </DocsDemo>
  <DocsCode lang="vue" :code="variantsCode" />
  <p>
    Elevation is orthogonal to the variant, and a boolean rather than a fifth value:
    <code>elevated</code> applies the shadow scale to all four. An elevated ghost or outline button
    additionally gets a RAISED surface, because in dark mode a shadow lying on the page background
    has nothing casting it.
  </p>

  <h2 id="tones">Tones</h2>
  <p>
    What the action MEANS. On a button a tone is an intention, which is why states such as success
    or warning are not offered here — those belong to chips, badges and toasts.
  </p>
  <DocsDemo>
    <VButton tone="accent">Accent</VButton>
    <VButton tone="neutral">Neutral</VButton>
    <VButton tone="danger">Delete</VButton>
    <VButton tone="danger" variant="soft">Delete</VButton>
    <VButton tone="neutral" variant="ghost">Cancel</VButton>
  </DocsDemo>
  <p>
    One rule governs filled controls: they carry white text. Everything else bends to keep it true —
    the neutral solid is a full text/surface inversion, and its hover mixes TOWARDS
    <code>surface</code> rather than away from it, because there is no darker neutral to reach for.
  </p>

  <h2 id="sizes">Sizes</h2>
  <p>
    The height comes from the control scale shared by every control: 24, 32, 40, 48 and 56px.
    <code>compact</code> takes 4px off, leaving the padding, the text and the icons as they are.
  </p>
  <DocsDemo>
    <VButton size="xs">xs</VButton>
    <VButton size="sm">sm</VButton>
    <VButton size="md">md</VButton>
    <VButton size="lg">lg</VButton>
    <VButton size="xl">xl</VButton>
    <VButton size="xl" compact>xl compact</VButton>
  </DocsDemo>

  <h2 id="icons">Icons</h2>
  <p>
    <code>iconStart</code> and <code>iconEnd</code> take an icon name or an explicit render, and the
    <code>#start</code> / <code>#end</code> slots take over when a name is not enough. VIconButton
    is the square sibling for an action with no label — where the <code>label</code> prop is
    required rather than optional, since it is the only accessible name the control will ever have.
  </p>
  <DocsDemo>
    <VButton icon-start="cloud_upload">Upload</VButton>
    <VButton variant="outline" tone="neutral" icon-end="arrow_right_alt">Continue</VButton>
    <VButton variant="soft" tone="accent" icon-start="check_circle" icon-filled>Approved</VButton>
    <VIconButton label="More actions" icon="more_horiz" variant="ghost" tone="neutral" />
    <VIconButton label="Dismiss" icon="close" variant="ghost" tone="neutral" shape="circular" />
  </DocsDemo>

  <h2 id="states">States</h2>
  <p>
    Disabled greys out through the colour tokens, never through opacity — loading is the one
    exception, at <code>opacity: 0.5</code>. A disabled or loading LINK becomes inert: the address
    is dropped, so it can be neither focused nor followed, and <code>aria-disabled</code> tells
    assistive technology why.
  </p>
  <DocsDemo>
    <VButton disabled>Disabled</VButton>
    <VButton variant="outline" tone="neutral" disabled>Disabled</VButton>
    <VButton :loading="loading" icon-start="cloud_upload" @click="loading = !loading">
      Deploy
    </VButton>
    <span style="font-size: var(--vectis-text-body-sm-size); color: var(--vectis-color-text-muted)">
      Click Deploy: the spinner replaces the START icon, and the button announces itself busy.
    </span>
  </DocsDemo>
  <DocsCode lang="vue" :code="linkCode" />

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>variant</code></td>
      <td><code>'solid' | 'outline' | 'ghost' | 'soft'</code></td>
      <td><code>'solid'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'accent' | 'neutral' | 'danger'</code></td>
      <td><code>'accent'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'xs' | 'sm' | 'md' | 'lg' | 'xl'</code></td>
      <td><code>'md'</code></td>
    </tr>
    <tr>
      <td><code>elevated</code> · <code>compact</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>href</code></td>
      <td><code>string</code> — renders an <code>&lt;a&gt;</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>'button' | 'submit' | 'reset'</code></td>
      <td><code>'button'</code></td>
    </tr>
    <tr>
      <td><code>disabled</code> · <code>loading</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>iconStart</code> · <code>iconEnd</code></td>
      <td><code>IconSource</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconFilled</code></td>
      <td><code>boolean</code> — the FILL axis, where the icon has one</td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <p>
    Slots: <code>#default</code> for the label, <code>#start</code> and <code>#end</code> for
    anything an icon name cannot express. Native attributes are not redeclared — they fall through
    onto the button or the anchor.
  </p>

  <h3 id="icon-button">VIconButton</h3>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>label</code></td>
      <td><code>string</code> — <strong>required</strong>, the accessible name</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <td><code>IconSource</code> — or the default slot</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>shape</code></td>
      <td><code>'square' | 'circular'</code></td>
      <td><code>'square'</code></td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td><code>'solid' | 'outline' | 'ghost' | 'soft'</code></td>
      <td><code>'ghost'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'accent' | 'neutral' | 'danger'</code></td>
      <td><code>'neutral'</code></td>
    </tr>
  </DocsTable>
  <blockquote>
    The two defaults differ from VButton's on purpose: an icon-only control is chrome far more often
    than it is the primary action.
  </blockquote>
</template>
