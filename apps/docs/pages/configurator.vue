<script setup lang="ts">
/**
 * The configurator: four controls, a live preview, and the CSS that would reproduce it.
 *
 * Every control writes CUSTOM PROPERTIES onto the preview subtree and nothing else. There is
 * no component variant here, no build step and no rebuild — which is the whole claim the
 * Theming page makes, demonstrated rather than asserted. The generated snippet is the same
 * set of declarations, printed for `:root`.
 */
import {
  VAccordion,
  VAccordionItem,
  VButton,
  VChip,
  VInput,
  VMenu,
  VMenuItem,
  VSwitch,
  VToggle,
  VToggleItem,
} from '@vectis/ui'

useHead({ title: 'Configurator' })

/**
 * The chromatic palettes an accent can point at. The greys are omitted on purpose: a grey
 * accent leaves a filled control with no way to say that it is the primary action.
 */
const palettes = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
] as const

type Palette = (typeof palettes)[number]
type RadiusPreset = 'sharp' | 'small' | 'default' | 'large' | 'pill'

const accent = ref<Palette>('violet')
const radius = ref<RadiusPreset>('default')
const headingFamily = ref('Josefin Sans')
const textFamily = ref('Geist')
const previewTheme = ref<'light' | 'dark'>('light')

const families = ['Josefin Sans', 'Geist', 'Georgia', 'system-ui']

/** interactive, surface, overlay — by ROLE, which is how the radii are named. */
const RADII: Record<RadiusPreset, [string, string, string]> = {
  sharp: ['0px', '0px', '0px'],
  small: ['4px', '6px', '8px'],
  default: ['6px', '8px', '12px'],
  large: ['10px', '14px', '18px'],
  pill: ['9999px', '14px', '18px'],
}

/**
 * Green is the one palette whose 600 does not hold white text at AA, so its accent starts a
 * step darker. The hover and active steps follow from wherever the base lands.
 */
const base = computed(() => (accent.value === 'green' ? 700 : 600))

const swatch = (name: Palette) => `var(--vectis-color-${name}-${name === 'green' ? 700 : 600})`

const radii = computed(() => RADII[radius.value])

/** What the preview subtree actually carries — the mechanism, applied. */
const previewStyle = computed(() => ({
  '--vectis-color-accent': `var(--vectis-color-${accent.value}-${base.value})`,
  '--vectis-color-accent-hover': `var(--vectis-color-${accent.value}-${base.value + 100})`,
  '--vectis-color-accent-active': `var(--vectis-color-${accent.value}-${base.value + 200})`,
  '--vectis-color-accent-surface': `var(--vectis-color-${accent.value}-50)`,
  '--vectis-color-accent-border': `var(--vectis-color-${accent.value}-200)`,
  '--vectis-color-accent-text': `var(--vectis-color-${accent.value}-700)`,
  '--vectis-focus-ring-color': `var(--vectis-color-${accent.value}-500)`,
  '--vectis-radius-interactive': radii.value[0],
  '--vectis-radius-surface': radii.value[1],
  '--vectis-radius-overlay': radii.value[2],
  '--vectis-font-family-display': `'${headingFamily.value}', system-ui, sans-serif`,
  '--vectis-font-family-sans': `'${textFamily.value}', system-ui, sans-serif`,
  background: 'var(--vectis-color-surface)',
  color: 'var(--vectis-color-text)',
}))

const accentToken = computed(() => `var(--vectis-color-${accent.value}-${base.value})`)

const generatedCss = computed(
  () => `:root {
  --vectis-color-accent: var(--vectis-color-${accent.value}-${base.value});
  --vectis-color-accent-hover: var(--vectis-color-${accent.value}-${base.value + 100});
  --vectis-color-accent-active: var(--vectis-color-${accent.value}-${base.value + 200});
  --vectis-color-accent-text: var(--vectis-color-${accent.value}-700);
  --vectis-focus-ring-color: var(--vectis-color-${accent.value}-500);
  --vectis-radius-interactive: ${radii.value[0]};
  --vectis-radius-surface: ${radii.value[1]};
  --vectis-radius-overlay: ${radii.value[2]};
  --vectis-font-family-display: '${headingFamily.value}', system-ui, sans-serif;
  --vectis-font-family-sans: '${textFamily.value}', system-ui, sans-serif;
}`,
)

const labelStyle =
  'margin: 0 0 4px; font-size: var(--vectis-text-label-size); font-weight: var(--vectis-text-label-weight)'
const helpStyle =
  'margin: 0 0 12px; font-size: var(--vectis-text-caption-size); color: var(--vectis-color-text-muted)'

/** The preview's private demo state — a switch that does nothing is a switch nobody trusts. */
const privateRepository = ref(true)
const framework = ref<string | number | null>('nuxt')
</script>

<template>
  <main class="vd-limit" style="padding-block: 32px 64px">
    <h1
      style="
        margin: 0 0 8px;
        font-family: var(--vectis-font-family-display);
        font-size: var(--vectis-text-heading-1-size);
        font-weight: var(--vectis-text-heading-1-weight);
        line-height: var(--vectis-text-heading-1-leading);
        letter-spacing: var(--vectis-text-heading-1-tracking);
      "
    >
      Configurator
    </h1>
    <p
      style="
        margin: 0 0 28px;
        max-width: 72ch;
        font-size: 16px;
        line-height: 1.65;
        color: var(--vectis-color-text-muted);
      "
    >
      Every control below redefines custom properties on the preview subtree — the same mechanism an
      application uses, with no rebuild. Nothing here is a component variant.
    </p>

    <div class="vd-config">
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 20px;
          border: 1px solid var(--vectis-color-border);
          border-radius: var(--vectis-radius-surface);
          background: var(--vectis-color-surface-raised);
        "
      >
        <div>
          <p :style="labelStyle">Accent</p>
          <p :style="helpStyle">
            Twenty-six OKLCH palettes ship so a role can be repointed without waiting for a release.
            The default is indigo 600; this site runs on violet.
          </p>
          <div class="vd-swatches">
            <button
              v-for="name in palettes"
              :key="name"
              type="button"
              class="vd-swatch"
              :aria-label="name"
              :aria-pressed="accent === name"
              :style="{ background: swatch(name) }"
              @click="accent = name"
            >
              <span v-if="accent === name" class="vd-swatch-ring" />
            </button>
          </div>
          <p
            style="
              margin: 10px 0 0;
              font-family: var(--vectis-font-family-mono);
              font-size: var(--vectis-text-code-size);
              color: var(--vectis-color-text-muted);
            "
          >
            --vectis-color-accent: {{ accentToken }}
          </p>
        </div>

        <div>
          <p :style="labelStyle">Radius</p>
          <p :style="helpStyle">
            By role, not by size: interactive for controls, surface for cards, overlay for panels.
          </p>
          <VToggle v-model="radius" label="Radius" size="sm" mandatory attached>
            <VToggleItem value="sharp" label="0" />
            <VToggleItem value="small" label="Small" />
            <VToggleItem value="default" label="Default" />
            <VToggleItem value="large" label="Large" />
            <VToggleItem value="pill" label="Pill" />
          </VToggle>
        </div>

        <div>
          <p :style="labelStyle">Families</p>
          <p :style="helpStyle">
            Titles and text are separate faces, and each keeps a platform stack behind it.
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 12px">
            <span style="display: flex; align-items: center; gap: 8px">
              <span
                style="
                  font-size: var(--vectis-text-caption-size);
                  color: var(--vectis-color-text-muted);
                "
              >
                Titles
              </span>
              <VMenu placement="bottom-start" size="sm" width="12rem">
                <template #trigger="{ triggerProps }">
                  <VButton
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    icon-end="expand_more"
                    v-bind="triggerProps"
                  >
                    {{ headingFamily }}
                  </VButton>
                </template>
                <VMenuItem
                  v-for="family in families"
                  :key="family"
                  :label="family"
                  :selected="headingFamily === family"
                  @select="headingFamily = family"
                />
              </VMenu>
            </span>

            <span style="display: flex; align-items: center; gap: 8px">
              <span
                style="
                  font-size: var(--vectis-text-caption-size);
                  color: var(--vectis-color-text-muted);
                "
              >
                Text
              </span>
              <VMenu placement="bottom-start" size="sm" width="12rem">
                <template #trigger="{ triggerProps }">
                  <VButton
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    icon-end="expand_more"
                    v-bind="triggerProps"
                  >
                    {{ textFamily }}
                  </VButton>
                </template>
                <VMenuItem
                  v-for="family in families"
                  :key="family"
                  :label="family"
                  :sublabel="family === 'Josefin Sans' ? 'low x-height at 14px' : undefined"
                  :selected="textFamily === family"
                  @select="textFamily = family"
                />
              </VMenu>
            </span>
          </div>
        </div>

        <div>
          <p :style="labelStyle">Preview theme</p>
          <p :style="helpStyle">
            Independent of the site's own theme:
            <code
              style="
                font-family: var(--vectis-font-family-mono);
                font-size: var(--vectis-text-code-size);
              "
              >data-theme</code
            >
            works on any subtree.
          </p>
          <VToggle v-model="previewTheme" label="Preview theme" size="sm" mandatory attached>
            <VToggleItem value="light" icon="light_mode" label="Light" />
            <VToggleItem value="dark" icon="dark_mode" label="Dark" />
          </VToggle>
        </div>
      </div>

      <div>
        <div :data-theme="previewTheme" :style="previewStyle">
          <div
            style="
              padding: 24px;
              border: 1px solid var(--vectis-color-border);
              border-radius: var(--vectis-radius-surface);
              background: var(--vectis-color-surface);
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 20px;
              "
            >
              <div>
                <p
                  style="
                    margin: 0 0 2px;
                    font-family: var(--vectis-font-family-display);
                    font-size: var(--vectis-text-heading-2-size);
                    font-weight: var(--vectis-text-heading-2-weight);
                    letter-spacing: var(--vectis-text-heading-2-tracking);
                    color: var(--vectis-color-text);
                  "
                >
                  New project
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: var(--vectis-text-body-sm-size);
                    color: var(--vectis-color-text-muted);
                  "
                >
                  Deploy in one click. Everything below is a real component.
                </p>
              </div>
              <VChip tone="accent" variant="soft" size="sm">Preview</VChip>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px">
              <VInput
                size="md"
                label="Project name"
                placeholder="acme-dashboard"
                hint="Lowercase, hyphens allowed"
              />
              <VInput
                model-value="acme.example.com"
                size="md"
                label="Domain"
                icon-start="search"
                clearable
              />

              <div>
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: var(--vectis-text-label-size);
                    font-weight: var(--vectis-text-label-weight);
                    color: var(--vectis-color-text);
                  "
                >
                  Framework
                </p>
                <VToggle v-model="framework" label="Framework" size="sm" :attached="false">
                  <VToggleItem value="nuxt" label="Nuxt 3" />
                  <VToggleItem value="vite" label="Vite" />
                  <VToggleItem value="astro" label="Astro" />
                </VToggle>
              </div>

              <VSwitch v-model="privateRepository" spread label-position="start">
                Private repository
              </VSwitch>

              <VAccordion variant="outlined" compact>
                <VAccordionItem title="Advanced options">
                  <p
                    style="
                      margin: 0;
                      font-size: var(--vectis-text-body-sm-size);
                      line-height: 1.6;
                      color: var(--vectis-color-text-muted);
                    "
                  >
                    Build command, output directory and environment variables. The panel's corner is
                    derived from the surface radius minus its border.
                  </p>
                </VAccordionItem>
              </VAccordion>

              <div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  justify-content: flex-end;
                  padding-top: 4px;
                "
              >
                <VButton variant="ghost" tone="neutral" size="md">Cancel</VButton>
                <VButton variant="outline" tone="neutral" size="md">Save draft</VButton>
                <VButton variant="solid" tone="accent" size="md" icon-end="arrow_right_alt">
                  Create
                </VButton>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px">
          <DocsCode lang="css" :code="generatedCss" />
        </div>
        <p
          style="
            margin: 12px 0 0;
            font-size: var(--vectis-text-caption-size);
            color: var(--vectis-color-text-subtle);
          "
        >
          Paste it into an unlayered stylesheet: a non-layered consumer rule wins over every layer
          of the design system.
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* The swatch grid's own states — :hover and :focus-visible, which no inline style can carry. */
.vd-swatch {
  height: 28px;
  padding: 0;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-xs);
  cursor: pointer;
}
.vd-swatch:focus-visible {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: var(--vectis-focus-ring-offset);
}

/*
 * The chosen swatch, marked with two inset rings rather than a tick: the mark has to read on
 * eighteen different backgrounds, and a glyph in any single colour disappears on some of them.
 * The inner ring is the panel's own surface, so the gap reads as a cut-out.
 */
.vd-swatch-ring {
  display: block;
  height: 100%;
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 2px var(--vectis-color-surface-raised),
    inset 0 0 0 4px var(--vectis-color-text);
}
</style>
