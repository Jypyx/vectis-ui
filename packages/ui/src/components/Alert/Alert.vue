<script setup lang="ts">
import { computed } from 'vue'

/**
 * Message contextuel. HTML + CSS ; le seul JS est l'émission de `dismiss`
 * (la visibilité reste pilotée par le consommateur, pas d'état interne).
 * role="alert" (interruptif) pour danger/warning, role="status" (poli) sinon.
 */
interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  /** Affiche un bouton de fermeture qui émet `dismiss`. */
  dismissible?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  tone: 'info',
  title: undefined,
  dismissible: false,
})

defineEmits<{
  /** Émis au clic sur le bouton de fermeture — la visibilité est au consommateur. */
  dismiss: []
}>()

defineSlots<{
  /** Corps du message */
  default(): unknown
  /** Titre riche (remplace la prop `title`) */
  title?(): unknown
  /** Icône personnalisée (remplace l'icône par défaut du tone) */
  icon?(): unknown
}>()

const role = computed(() =>
  props.tone === 'danger' || props.tone === 'warning' ? 'alert' : 'status',
)

/** Icônes par défaut, en currentcolor (thémables). */
const ICON_PATHS: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 5.25v3.75M8 4.75v.5',
  success: 'M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-2.5 6.75 1.75 1.75 3.25-3.75',
  warning: 'M8 2 14.5 13.5h-13L8 2Zm0 4.25v3M8 11.5v.5',
  danger: 'M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM5.75 5.75l4.5 4.5m0-4.5-4.5 4.5',
}
</script>

<template>
  <div class="ds-alert" :data-tone="tone" :role="role">
    <span class="ds-alert-icon" aria-hidden="true">
      <slot name="icon">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path
            :d="ICON_PATHS[tone]"
            fill="none"
            stroke="currentcolor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </span>
    <div class="ds-alert-body">
      <p v-if="title || $slots.title" class="ds-alert-title">
        <slot name="title">{{ title }}</slot>
      </p>
      <div class="ds-alert-content">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      class="ds-alert-close"
      type="button"
      aria-label="Fermer"
      @click="$emit('dismiss')"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentcolor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style>
@layer ds.components {
  .ds-alert {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4);
    border: 1px solid var(--_border);
    border-radius: var(--ds-radius-surface);
    background: var(--_bg);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }

  .ds-alert[data-tone='info'] {
    --_bg: var(--ds-color-accent-surface);
    --_border: var(--ds-color-accent-border);
    --_accent: var(--ds-color-accent-text);
  }

  .ds-alert[data-tone='success'] {
    --_bg: var(--ds-color-success-surface);
    --_border: var(--ds-color-success-border);
    --_accent: var(--ds-color-success-text);
  }

  .ds-alert[data-tone='warning'] {
    --_bg: var(--ds-color-warning-surface);
    --_border: var(--ds-color-warning-border);
    --_accent: var(--ds-color-warning-text);
  }

  .ds-alert[data-tone='danger'] {
    --_bg: var(--ds-color-danger-surface);
    --_border: var(--ds-color-danger-border);
    --_accent: var(--ds-color-danger-text);
  }

  .ds-alert-icon {
    display: inline-flex;
    flex: none;
    margin-block-start: calc(var(--ds-space-1) / 2);
    color: var(--_accent);
  }

  .ds-alert-body {
    flex: 1;
    color: var(--ds-color-text);
  }

  .ds-alert-title {
    margin-block-end: var(--ds-space-1);
    font-weight: var(--ds-font-weight-semibold);
    color: var(--_accent);
  }

  .ds-alert-content {
    color: var(--ds-color-text-muted);
  }

  .ds-alert-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: var(--ds-space-6);
    height: var(--ds-space-6);
    border: none;
    background: transparent;
    color: var(--_accent);
    border-radius: var(--ds-radius-sm);
    cursor: pointer;
  }

  .ds-alert-close:hover {
    background: color-mix(in oklab, var(--_accent), transparent 88%);
  }

  .ds-alert-close:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }
}
</style>
