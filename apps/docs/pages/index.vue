<script setup lang="ts">
/**
 * The home page: what the library is, the three decisions that produced it, and the figures
 * that back them up.
 *
 * The numbers in the stats band are read from the source rather than remembered — the
 * component count is `content/nav.ts` counting itself, and the palette and stylesheet
 * figures come from the token source and a measured build.
 */
import { VButton } from '@vectis/ui'

import { components } from '~/content/nav'

useHead({ title: 'A modern UI library for HTML and CSS lovers' })

const repositoryUrl = 'https://github.com/Jypyx/vectis-ui'

const DOCS_HOME = '/docs/installation'

const installCode = 'pnpm add @vectis/ui vue'
const importCode = `import { VButton } from '@vectis/ui'
import '@vectis/ui/styles.css'`

const codeStyle =
  'font-family: var(--vectis-font-family-mono); font-size: var(--vectis-text-code-size)'

/** One entry per exported component family — the same list the sidebar is built from. */
const componentCount = components.length
</script>

<template>
  <main>
    <div class="vd-limit vd-hero">
      <div>
        <h1
          style="
            margin: 0 0 16px;
            font-family: var(--vectis-font-family-display);
            font-size: var(--vectis-text-display-size);
            font-weight: var(--vectis-text-display-weight);
            line-height: var(--vectis-text-display-leading);
            letter-spacing: var(--vectis-text-display-tracking);
            text-wrap: pretty;
          "
        >
          A modern UI library<br />
          <span style="color: var(--vectis-color-accent)">for HTML and CSS lovers</span>
        </h1>
        <p
          style="
            margin: 0 auto 28px;
            max-width: 52ch;
            font-size: 18px;
            line-height: 1.65;
            color: var(--vectis-color-text-muted);
            text-wrap: pretty;
          "
        >
          Vectis UI is a component library built on the latest HTML and CSS features, with no
          compromises and no need for external plugins.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center">
          <NuxtLink :to="DOCS_HOME" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="solid"
                tone="accent"
                size="lg"
                icon-end="arrow_right_alt"
                :href="href ?? undefined"
                @click="navigate"
              >
                Install the library
              </VButton>
            </template>
          </NuxtLink>
        </div>
      </div>
    </div>

    <section
      style="
        border-top: 1px solid var(--vectis-color-border);
        background: var(--vectis-color-surface-muted);
      "
    >
      <div class="vd-limit" style="padding-block: 48px">
        <h2
          style="
            margin: 0 0 8px;
            font-family: var(--vectis-font-family-display);
            font-size: var(--vectis-text-heading-1-size);
            font-weight: var(--vectis-text-heading-1-weight);
            line-height: var(--vectis-text-heading-1-leading);
            letter-spacing: var(--vectis-text-heading-1-tracking);
          "
        >
          Why it exists
        </h2>
        <p
          style="
            margin: 0 0 28px;
            max-width: 64ch;
            font-size: 16px;
            line-height: 1.65;
            color: var(--vectis-color-text-muted);
          "
        >
          Three decisions carry the whole library. Each one is stated with its reason, because a
          rule without a reason is a rule nobody can apply to the next case.
        </p>
        <div class="vd-grid-3">
          <article
            style="
              padding: 20px;
              border: 1px solid var(--vectis-color-border);
              border-radius: var(--vectis-radius-surface);
              background: var(--vectis-color-surface-raised);
            "
          >
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-3-size);
                font-weight: var(--vectis-text-heading-3-weight);
              "
            >
              HTML and CSS first
            </h3>
            <p
              style="
                margin: 0;
                font-size: var(--vectis-text-body-md-size);
                line-height: 1.6;
                color: var(--vectis-color-text-muted);
              "
            >
              Accordions are <code :style="codeStyle">&lt;details&gt;</code>, menus and tooltips
              rest on the top layer with no positioning library, forms report validity through
              <code :style="codeStyle">:user-invalid</code>. Where behavioural JavaScript exists, a
              comment in the file justifies it.
            </p>
          </article>
          <article
            style="
              padding: 20px;
              border: 1px solid var(--vectis-color-border);
              border-radius: var(--vectis-radius-surface);
              background: var(--vectis-color-surface-raised);
            "
          >
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-3-size);
                font-weight: var(--vectis-text-heading-3-weight);
              "
            >
              One typed token source
            </h3>
            <p
              style="
                margin: 0;
                font-size: var(--vectis-text-body-md-size);
                line-height: 1.6;
                color: var(--vectis-color-text-muted);
              "
            >
              Primitives in OKLCH, then semantic roles — and a component may only name the second. A
              raw hex in component CSS is treated as a missing token, which is what lets an
              application repoint the accent without a component knowing.
            </p>
          </article>
          <article
            style="
              padding: 20px;
              border: 1px solid var(--vectis-color-border);
              border-radius: var(--vectis-radius-surface);
              background: var(--vectis-color-surface-raised);
            "
          >
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-3-size);
                font-weight: var(--vectis-text-heading-3-weight);
              "
            >
              Overrides without a fight
            </h3>
            <p
              style="
                margin: 0;
                font-size: var(--vectis-text-body-md-size);
                line-height: 1.6;
                color: var(--vectis-color-text-muted);
              "
            >
              The CSS lives in four layers, and any non-layered consumer style wins automatically.
              That is the intended override mechanism, not a loophole: overriding a component never
              calls for a specificity war.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="vd-limit" style="padding-block: 48px">
      <div class="vd-grid-2" style="align-items: start">
        <div>
          <h2
            style="
              margin: 0 0 8px;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-heading-1-size);
              font-weight: var(--vectis-text-heading-1-weight);
              line-height: var(--vectis-text-heading-1-leading);
              letter-spacing: var(--vectis-text-heading-1-tracking);
            "
          >
            Three lines to install
          </h2>
          <p
            style="
              margin: 0 0 20px;
              font-size: 16px;
              line-height: 1.65;
              color: var(--vectis-color-text-muted);
            "
          >
            The package is pre-built as ESM and SSR-safe. Named imports are tree-shaken by Vite and
            Nitro, so no <code :style="codeStyle">build.transpile</code> entry is required.
          </p>
          <NuxtLink :to="DOCS_HOME" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="soft"
                tone="accent"
                size="md"
                icon-end="arrow_right_alt"
                :href="href ?? undefined"
                @click="navigate"
              >
                Read the installation guide
              </VButton>
            </template>
          </NuxtLink>
        </div>
        <div>
          <DocsCode lang="bash" :code="installCode" />
          <DocsCode lang="ts" :code="importCode" />
        </div>
      </div>
    </section>

    <section class="vd-limit" style="padding-block: 48px">
      <div class="vd-stats">
        <div>
          <p
            style="
              margin: 0;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-display-size);
              font-weight: var(--vectis-text-display-weight);
              line-height: 1.1;
              letter-spacing: var(--vectis-text-display-tracking);
            "
          >
            {{ componentCount }}
          </p>
          <p
            style="
              margin: 4px 0 0;
              font-size: var(--vectis-text-body-sm-size);
              color: var(--vectis-color-text-muted);
            "
          >
            component families
          </p>
        </div>
        <div>
          <p
            style="
              margin: 0;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-display-size);
              font-weight: var(--vectis-text-display-weight);
              line-height: 1.1;
              letter-spacing: var(--vectis-text-display-tracking);
            "
          >
            26
          </p>
          <p
            style="
              margin: 4px 0 0;
              font-size: var(--vectis-text-body-sm-size);
              color: var(--vectis-color-text-muted);
            "
          >
            OKLCH palettes, five wired to roles
          </p>
        </div>
        <div>
          <p
            style="
              margin: 0;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-display-size);
              font-weight: var(--vectis-text-display-weight);
              line-height: 1.1;
              letter-spacing: var(--vectis-text-display-tracking);
            "
          >
            6.7 kB
          </p>
          <p
            style="
              margin: 4px 0 0;
              font-size: var(--vectis-text-body-sm-size);
              color: var(--vectis-color-text-muted);
            "
          >
            gzip, the core stylesheet
          </p>
        </div>
        <div>
          <p
            style="
              margin: 0;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-display-size);
              font-weight: var(--vectis-text-display-weight);
              line-height: 1.1;
              letter-spacing: var(--vectis-text-display-tracking);
            "
          >
            0
          </p>
          <p
            style="
              margin: 4px 0 0;
              font-size: var(--vectis-text-body-sm-size);
              color: var(--vectis-color-text-muted);
            "
          >
            runtime dependencies beyond Vue
          </p>
        </div>
      </div>
    </section>

    <section style="border-top: 1px solid var(--vectis-color-border)">
      <div class="vd-limit" style="padding-block: 48px">
        <div class="vd-grid-2" style="gap: 24px; align-items: start">
          <article>
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-2-size);
                font-weight: var(--vectis-text-heading-2-weight);
              "
            >
              Accessibility, guaranteed
            </h3>
            <ul
              style="
                margin: 0;
                padding-inline-start: 20px;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            >
              <li>The ARIA menu pattern: roving focus, focus returned to the trigger.</li>
              <li>
                <code :style="codeStyle">role="switch"</code> on VSwitch, announced as on or off
                rather than ticked.
              </li>
              <li>
                Tooltips linked by <code :style="codeStyle">aria-describedby</code> and dismissible
                with Escape.
              </li>
              <li>
                <code :style="codeStyle">prefers-reduced-motion</code> honoured in every component:
                transitions stop, loops slow down.
              </li>
            </ul>
          </article>
          <article>
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-2-size);
                font-weight: var(--vectis-text-heading-2-weight);
              "
            >
              Browser support
            </h3>
            <p
              style="
                margin: 0 0 12px;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            >
              Chrome and Edge 125+, Safari 26+. Baseline with no compromise: the Popover API,
              <code :style="codeStyle">&lt;dialog&gt;</code>,
              <code :style="codeStyle">:has()</code>, <code :style="codeStyle">color-mix()</code>,
              <code :style="codeStyle">@layer</code>.
            </p>
            <p
              style="
                margin: 0;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            >
              CSS anchor positioning is not stable on Firefox, and there is deliberately no
              JavaScript fallback: panels open there, they are simply not anchored to their trigger.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px">
              <VButton
                variant="outline"
                tone="neutral"
                size="md"
                icon-end="open_in_new"
                :href="repositoryUrl"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </VButton>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
