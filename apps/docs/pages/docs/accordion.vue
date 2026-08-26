<script setup lang="ts">
import { VAccordion, VAccordionItem, VTypography } from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('accordion.title') })

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
</script>

<template>
  <h1>{{ t('accordion.title') }}</h1>
  <DocsProse class="vd-lead" keypath="accordion.lead" />

  <h2 id="exclusive-or-not">{{ t('accordion.exclusiveHeading') }}</h2>
  <DocsProse keypath="accordion.exclusiveBody" />
  <DocsDemo stack>
    <VAccordion variant="outlined">
      <VAccordionItem title="Does it work with Nuxt?" default-open>
        <VTypography variant="body-md" tone="muted">
          Yes. The package is SSR-safe and pre-built as ESM, so
          <VTypography variant="code">build.transpile</VTypography> is not required. This site is
          the proof: it is a Nuxt 3 application, prerendered to static files.
        </VTypography>
      </VAccordionItem>
      <VAccordionItem title="Is there a Tailwind preset?">
        <VTypography variant="body-md" tone="muted">
          No, and none is planned: the tokens are already custom properties, which any framework can
          read.
        </VTypography>
      </VAccordionItem>
      <VAccordionItem title="Can I use it without Vue?" subtitle="Short answer: the CSS, yes">
        <VTypography variant="body-md" tone="muted">
          The stylesheet and the tokens are plain CSS and can be linked from anything. The
          components themselves are Vue single-file components.
        </VTypography>
      </VAccordionItem>
    </VAccordion>
  </DocsDemo>
  <DocsCode lang="vue" :code="basicCode" />
  <DocsCode lang="vue" :code="independentCode" />

  <h2 id="variants">{{ t('accordion.variantsHeading') }}</h2>
  <DocsProse keypath="accordion.variantsBody" />
  <DocsProse keypath="accordion.variantsRadius" />

  <h2 id="density">{{ t('accordion.densityHeading') }}</h2>
  <DocsProse keypath="accordion.densityBody" />

  <h2 id="animation">{{ t('accordion.animationHeading') }}</h2>
  <DocsProse keypath="accordion.animationBody" />

  <h2 id="disabling">{{ t('accordion.disablingHeading') }}</h2>
  <DocsProse keypath="accordion.disablingBody" />

  <h2 id="api">{{ t('accordion.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>exclusive</code> <span>(VAccordion)</span></td>
      <DocsProse tag="td" keypath="accordion.apiExclusive" />
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td><code>'flat' | 'outlined'</code></td>
      <td><code>'flat'</code></td>
    </tr>
    <tr>
      <td><code>compact</code></td>
      <DocsProse tag="td" keypath="accordion.apiCompact" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>expandIcon</code></td>
      <td><code>IconSource</code></td>
      <td><code>'expand_more'</code></td>
    </tr>
    <tr>
      <td><code>collapseIcon</code></td>
      <DocsProse tag="td" keypath="accordion.apiCollapseIcon" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>title</code> · <code>subtitle</code> <span>(VAccordionItem)</span></td>
      <DocsProse tag="td" keypath="accordion.apiTitles" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStart</code> <span>(VAccordionItem)</span></td>
      <DocsProse tag="td" keypath="accordion.apiIconStart" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>defaultOpen</code></td>
      <DocsProse tag="td" keypath="accordion.apiDefaultOpen" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <DocsProse tag="blockquote" keypath="accordion.apiQuote" />
</template>
