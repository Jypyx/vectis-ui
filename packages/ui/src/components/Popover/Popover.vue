<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useId } from 'vue'

/**
 * Popover API native : top-layer, light dismiss (clic extérieur, Esc) et
 * liaison déclarative trigger→panneau via `popovertarget` — zéro JS de clic.
 * L'invocateur devient l'ancre implicite du panneau : le positionnement est
 * du pur CSS (voir styles/floating.css). JS limité à la synchronisation
 * v-model:open ↔ événement natif `toggle`.
 */
type Placement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

interface PopoverProps {
  placement?: Placement
}

withDefaults(defineProps<PopoverProps>(), { placement: 'bottom' })

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` sur un <Button> / <button>. */
  trigger(props: { triggerProps: { popovertarget: string } }): unknown
  /** Contenu du panneau */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
const panelId = useId()

// État réellement affiché, tenu à jour par l'événement natif `toggle` —
// évite d'interroger `:popover-open` (et permet de tester la logique en jsdom).
const shown = ref(false)

function onToggle(event: Event) {
  shown.value = (event as ToggleEvent).newState === 'open'
  open.value = shown.value
}

// Ouverture/fermeture programmatique via v-model (client uniquement).
watch(open, (value) => {
  const el = panelEl.value
  if (!el || value === shown.value) return
  if (value) el.showPopover()
  else el.hidePopover()
})

onMounted(() => {
  if (open.value) panelEl.value?.showPopover()
})
</script>

<template>
  <slot name="trigger" :trigger-props="{ popovertarget: panelId }" />
  <div
    :id="panelId"
    ref="panelEl"
    popover
    class="ds-popover-panel ds-floating"
    :data-placement="placement"
    @toggle="onToggle"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-popover-panel {
    width: max-content;
    max-width: min(20rem, calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-4);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }
}
</style>
