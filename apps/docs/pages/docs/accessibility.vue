<script setup lang="ts">
import { VButton, VInput } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Accessibility' })
</script>

<template>
  <h1>Accessibility</h1>
  <p class="vd-lead">
    Keyboard navigation and ARIA semantics on every component.
    <code>prefers-reduced-motion</code> is respected everywhere, and axe audits every story in both
    themes on every commit — a violation fails the build rather than filing a warning.
  </p>

  <h2 id="what-is-guaranteed">What is guaranteed</h2>
  <ul>
    <li>The ARIA menu pattern: roving focus, and focus returned to the trigger on close.</li>
    <li>
      <code>role="switch"</code> on VSwitch, so it is announced as on or off rather than ticked.
    </li>
    <li>
      Tooltips linked by <code>aria-describedby</code> and dismissible with Escape (WCAG 1.4.13).
    </li>
    <li><code>role="status"</code> or <code>role="alert"</code> according to criticality.</li>
    <li>
      An accessible label REQUIRED on VIconButton — the prop is not optional, so an unlabelled icon
      button cannot be written by accident.
    </li>
  </ul>
  <p>
    Half of the behavioural JavaScript in the library exists for this rather than to make anything
    work: the components are accessible first and interactive second, and the code is tagged so that
    the ratio can be counted rather than claimed.
  </p>

  <h2 id="focus">Focus</h2>
  <p>
    Focus is a 2px outline at 2px offset, outside the box, so it costs no layout. It is pulled
    INWARDS wherever the container clips — a field's inner buttons, an accordion summary, a nav row
    inside an animatable branch — because an outline drawn outside a clipping box is an outline
    nobody sees.
  </p>
  <DocsDemo>
    <VButton variant="outline" tone="neutral">Focus me with Tab</VButton>
    <VInput placeholder="Then keep going" />
    <span style="font-size: var(--vectis-text-body-sm-size); color: var(--vectis-color-text-muted)">
      A text field departs: a 1px accent border plus a shadow of the same colour, because Windows
      forced colours drop box-shadows and the outline is the safety net.
    </span>
  </DocsDemo>

  <h2 id="validation">Validation</h2>
  <p>
    <code>:user-invalid</code>, not <code>:invalid</code>: a field only turns red once the reader
    has left it, so a half-typed email is never called wrong. The <code>invalid</code> prop forces
    the state for a rule only the server can check.
  </p>

  <h2 id="motion">Motion</h2>
  <p>
    Under <code>prefers-reduced-motion</code> transitions go to <code>none</code>, while looping
    animations SLOW DOWN rather than stopping — a spinner goes from 1s to 3s, because a frozen
    spinner reads as a broken page.
  </p>

  <h2 id="forced-colors">Forced colours</h2>
  <p>
    Two decisions in the library exist for Windows' forced-colors mode, and both are worth copying.
    Icons are drawn as <code>&lt;svg&gt;&lt;path fill="currentcolor"&gt;</code> and never as a
    masked background, which vanishes there. Rules are painted with a BORDER and not a background,
    because a background is forced to <code>Canvas</code> — the same colour as the page — while a
    border colour is forced to <code>CanvasText</code> and survives.
  </p>

  <h2 id="what-a-tool-cannot-tell-you">What a tool cannot tell you</h2>
  <p>
    axe reads computed colours, so contrast has to be checked TWICE — once per theme — and the
    library's CI does exactly that. It also cannot judge text painted over a sibling it only partly
    covers: it derives a background from the boxes containing an element's rect, so a clipped label
    reads against whatever is underneath. Those two cases in the library are excluded by name, each
    with its reasoning; an exclusion is for a tool limitation, never for a real violation.
  </p>
  <blockquote>
    A tool that runs on every commit and blocks the build is worth more than an audit that happens
    once. Neither replaces using the thing with a keyboard.
  </blockquote>
</template>
