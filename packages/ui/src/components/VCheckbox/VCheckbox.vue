<script setup lang="ts">
import { ref, watchEffect } from 'vue'

/**
 * A native <input type="checkbox">, visually replaced by a styled box:
 * the input stays in the tree (focus, keyboard, forms, :user-invalid) and only its
 * rendering is hidden. All the state logic is native; the only JS beyond
 * the v-model bridge is `indeterminate`, which exists solely as a DOM property
 * (there is no equivalent HTML attribute).
 */
interface CheckboxProps {
  /** The "partially checked" visual state (nested lists). */
  indeterminate?: boolean
  /** Position of the label relative to the box. */
  labelPosition?: 'start' | 'end'
  /** Pushes label and box to opposite ends (the root becomes block, full width). */
  spread?: boolean
  /** Forces the invalid state — sets aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  indeterminate: false,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
})

// @a11y
// The root is a <label>: the native attributes (name, value, required, aria-*…) must
// land on the input.
defineOptions({ inheritAttrs: false })

const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Label, clickable (the <label> wraps everything) */
  default?(): unknown
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// @ssr @core
// SSR-safe: inputEl is null on the server, so the effect does nothing.
// flush: 'post' → the effect runs after the DOM update, once the template ref is
// set.
watchEffect(
  () => {
    if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
  },
  { flush: 'post' },
)
</script>

<template>
  <label class="v-checkbox" :data-label-position="labelPosition" :data-spread="spread || undefined">
    <input
      ref="inputEl"
      v-model="model"
      type="checkbox"
      class="v-checkbox-input"
      v-bind="$attrs"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="v-checkbox-box" aria-hidden="true">
      <svg class="v-checkbox-mark" viewBox="0 0 12 12">
        <path
          class="v-checkbox-mark-check"
          d="M2.5 6.5l2.5 2.5 4.5-5.5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="v-checkbox-mark-dash"
          d="M3 6h6"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default" class="v-checkbox-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  .v-checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
    cursor: pointer;
  }

  /* The input is position: absolute → outside the flex flow, so the visual order
     concerns only the box and the label */
  .v-checkbox[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-checkbox[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  /* The input stays focusable and submitted with the form; only its rendering goes */
  .v-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .v-checkbox-box {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-sm);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox-mark {
    width: var(--vectis-control-size-check-mark);
    height: var(--vectis-control-size-check-mark);
  }

  .v-checkbox-mark-check,
  .v-checkbox-mark-dash {
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox:hover .v-checkbox-input:not(:disabled, :checked, :indeterminate) + .v-checkbox-box {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-checkbox-input:checked + .v-checkbox-box,
  .v-checkbox-input:indeterminate + .v-checkbox-box {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-checkbox:hover
    .v-checkbox-input:not(:disabled):is(:checked, :indeterminate)
    + .v-checkbox-box {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  .v-checkbox-input:checked + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 1;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 0;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-dash {
    opacity: 1;
  }

  .v-checkbox-input:focus-visible + .v-checkbox-box {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-checkbox-input:user-invalid + .v-checkbox-box,
  .v-checkbox-input[aria-invalid='true'] + .v-checkbox-box {
    border-color: var(--vectis-color-danger);
  }

  /* Disabled: greys (the same tokens as VButton), no opacity */
  .v-checkbox:has(.v-checkbox-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-checkbox-input:disabled + .v-checkbox-box {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-checkbox-box,
    .v-checkbox-mark-check,
    .v-checkbox-mark-dash {
      transition: none;
    }
  }
}
</style>
