<script setup lang="ts">
/**
 * A native <input type="radio">, its rendering replaced by a styled dot (the same
 * approach as VCheckbox: the input stays in the tree, only its rendering is hidden). The group is native: several VRadio sharing the same `name`
 * (fallthrough) and the same v-model — arrow navigation is supplied by the
 * browser, zero JS.
 */
interface RadioProps {
  /** Value carried by this button, compared against the group's v-model. */
  value: string
  /** Position of the label relative to the dot. */
  labelPosition?: 'start' | 'end'
  /** Pushes label and dot to opposite ends (the root becomes block, full width). */
  spread?: boolean
  /** Forces the invalid state — sets aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<RadioProps>(), {
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
})

// @a11y — the component's ONLY behavioural decision: arrow navigation inside the
// group is the browser's, and it only works if `name` reaches the real input.
// The root is a <label>: the native attributes (`name` above all, for the group) must
// land on the input.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

defineSlots<{
  /** Label, clickable (the <label> wraps everything) */
  default?(): unknown
}>()
</script>

<template>
  <label class="v-radio" :data-label-position="labelPosition" :data-spread="spread || undefined">
    <input
      v-model="model"
      type="radio"
      class="v-radio-input"
      v-bind="$attrs"
      :value="value"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="v-radio-dot" aria-hidden="true" />
    <span v-if="$slots.default" class="v-radio-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  .v-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
    cursor: pointer;
  }

  /* The input is position: absolute → outside the flex flow, so the visual order
     concerns only the dot and the label */
  .v-radio[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-radio[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  .v-radio-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  /* Dot: the same mechanics as VCheckbox's box (accent background when checked),
     with the inner dot as a pseudo-element in currentcolor */
  .v-radio-dot {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-full);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio-dot::before {
    content: '';
    width: var(--vectis-control-size-check-dot);
    height: var(--vectis-control-size-check-dot);
    border-radius: var(--vectis-radius-full);
    background: currentcolor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio:hover .v-radio-input:not(:disabled, :checked) + .v-radio-dot {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-radio-input:checked + .v-radio-dot {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-radio-input:checked + .v-radio-dot::before {
    opacity: 1;
  }

  .v-radio:hover .v-radio-input:not(:disabled):checked + .v-radio-dot {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  .v-radio-input:focus-visible + .v-radio-dot {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-radio-input:user-invalid + .v-radio-dot,
  .v-radio-input[aria-invalid='true'] + .v-radio-dot {
    border-color: var(--vectis-color-danger);
  }

  /* Disabled: greys (the same tokens as VButton), no opacity */
  .v-radio:has(.v-radio-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-radio-input:disabled + .v-radio-dot {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-radio-dot,
    .v-radio-dot::before {
      transition: none;
    }
  }
}
</style>
