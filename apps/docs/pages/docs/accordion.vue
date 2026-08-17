<script setup lang="ts">
import { VAccordion, VAccordionItem } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Accordion' })

const basicCode = `<VAccordion variant="outlined">
  <VAccordionItem title="Does it work with Nuxt?" default-open>
    Yes. The package is SSR-safe and pre-built as ESM.
  </VAccordionItem>
  <VAccordionItem title="Is there a Tailwind preset?">
    No, and none is planned.
  </VAccordionItem>
</VAccordion>`

const independentCode = `<!-- exclusive is TRUE by default: opening one closes the rest.
     Turn it off and every section stands on its own. -->
<VAccordion :exclusive="false">…</VAccordion>`

const bodyStyle =
  'margin: 0; font-size: var(--vectis-text-body-md-size); line-height: 1.6; color: var(--vectis-color-text-muted)'
const codeStyle =
  'font-family: var(--vectis-font-family-mono); font-size: var(--vectis-text-code-size)'
</script>

<template>
  <h1>Accordion</h1>
  <p class="vd-lead">
    Sections that fold. It is built on <code>&lt;details&gt;</code> and
    <code>&lt;summary&gt;</code>, so the open state, the keyboard behaviour and in-page search all
    come from the browser.
  </p>

  <h2 id="exclusive-or-not">Exclusive, or not</h2>
  <p>
    Only one item open at a time is not JavaScript here: it is what the browser does once every item
    shares a <code>name</code>. The group generates one, so <code>exclusive</code> is
    <strong>true by default</strong> — set it to <code>false</code> and each section keeps its own
    state.
  </p>
  <DocsDemo stack>
    <VAccordion variant="outlined">
      <VAccordionItem title="Does it work with Nuxt?" default-open>
        <p :style="bodyStyle">
          Yes. The package is SSR-safe and pre-built as ESM, so
          <code :style="codeStyle">build.transpile</code> is not required. This site is the proof:
          it is a Nuxt 3 application, prerendered to static files.
        </p>
      </VAccordionItem>
      <VAccordionItem title="Is there a Tailwind preset?">
        <p :style="bodyStyle">
          No, and none is planned: the tokens are already custom properties, which any framework can
          read.
        </p>
      </VAccordionItem>
      <VAccordionItem title="Can I use it without Vue?" subtitle="Short answer: the CSS, yes">
        <p :style="bodyStyle">
          The stylesheet and the tokens are plain CSS and can be linked from anything. The
          components themselves are Vue single-file components.
        </p>
      </VAccordionItem>
    </VAccordion>
  </DocsDemo>
  <DocsCode lang="vue" :code="basicCode" />
  <DocsCode lang="vue" :code="independentCode" />

  <h2 id="variants">Variants</h2>
  <p>
    <code>flat</code> draws nothing at all — no background, no border, no radius — so the accordion
    inherits whatever surface it sits on. <code>outlined</code> gives the canonical card:
    <code>surface-raised</code>, a 1px border, <code>radius-surface</code>, and no shadow. It is the
    same decoration scale VDataTable and VTabs use, so the three agree without being coupled.
  </p>
  <p>
    A nested corner is derived with
    <code>calc(var(--vectis-radius-surface) - 1px)</code>, which is why the radius scale carries a
    <code>none</code> that is <code>0px</code> rather than <code>0</code>: subtracting from a
    unitless zero is invalid CSS.
  </p>

  <h2 id="density">Density</h2>
  <p>
    <code>compact</code> takes 4px off every padding — block, inline and the content's breathing
    room — through a single delta the items inherit. The type and the icons do not change: an
    accordion has no fixed height, so it is outside the control size scale entirely.
  </p>

  <h2 id="animation">Animation</h2>
  <p>
    The height animation is progressive enhancement, through <code>::details-content</code> and
    <code>interpolate-size</code>. Where those are unsupported the section simply opens instantly —
    no JavaScript measures anything, and nothing jumps.
  </p>

  <h2 id="disabling">Disabling an item</h2>
  <p>
    <code>&lt;summary&gt;</code> has no native <code>disabled</code>, so a disabled item gets
    <code>aria-disabled</code>, <code>tabindex="-1"</code> and a cancelled click — the component's
    only JavaScript. Not <code>pointer-events: none</code>, which would take away the
    <code>not-allowed</code> cursor and the ability to select the text.
  </p>

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>exclusive</code> <span>(VAccordion)</span></td>
      <td><code>boolean</code> — one open at a time, via <code>&lt;details name&gt;</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td><code>'flat' | 'outlined'</code></td>
      <td><code>'flat'</code></td>
    </tr>
    <tr>
      <td><code>compact</code></td>
      <td><code>boolean</code> — every padding loses 4px</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>expandIcon</code></td>
      <td><code>IconSource</code></td>
      <td><code>'expand_more'</code></td>
    </tr>
    <tr>
      <td><code>collapseIcon</code></td>
      <td><code>IconSource</code> — give both and they swap instead of rotating</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>title</code> · <code>subtitle</code> <span>(VAccordionItem)</span></td>
      <td><code>string</code> — or the <code>#title</code> / <code>#subtitle</code> slots</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStart</code> <span>(VAccordionItem)</span></td>
      <td><code>IconSource</code> — or the <code>#start</code> slot</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>defaultOpen</code></td>
      <td><code>boolean</code> — first render only; the browser owns it afterwards</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <blockquote>
    There is no <code>v-model:open</code>, and that is the point: the state belongs to the
    <code>&lt;details&gt;</code> element. Mirroring it into Vue would give you two sources of truth
    for something the browser already knows.
  </blockquote>
</template>
