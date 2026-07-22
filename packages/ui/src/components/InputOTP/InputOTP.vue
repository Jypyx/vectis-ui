<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Code à usage unique (OTP). Il n'existe pas de primitive « code à N
 * caractères » : chaque case reste un <input> natif, le JS orchestre le
 * clavier et le collage (justifié) — avance auto, retour arrière, collage
 * distribué sur les cases, flèches. `autocomplete="one-time-code"` sur la
 * première case : le remplissage automatique (SMS/gestionnaire) est distribué.
 */
interface InputOTPProps {
  length?: number
  /** Chiffres uniquement (inputmode numérique, filtrage). */
  numeric?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Nom accessible du groupe. */
  label?: string
}

const props = withDefaults(defineProps<InputOTPProps>(), {
  length: 6,
  numeric: true,
  disabled: false,
  invalid: false,
  label: 'Code de vérification',
})

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /** Émis quand toutes les cases sont remplies. */
  complete: [code: string]
}>()

const inputs = ref<(HTMLInputElement | null)[]>([])
const digits = ref<string[]>([])

function syncFromModel(value: string) {
  digits.value = Array.from({ length: props.length }, (_, i) => value[i] ?? '')
}
syncFromModel(model.value)
watch(model, (value) => {
  if (value !== digits.value.join('')) syncFromModel(value)
})

function commit() {
  const code = digits.value.join('')
  model.value = code
  if (code.length === props.length) emit('complete', code)
}

function onInput(index: number, event: Event) {
  const el = event.target as HTMLInputElement
  let text = el.value
  if (props.numeric) text = text.replace(/\D+/g, '')
  if (!text) {
    digits.value[index] = ''
    el.value = ''
    commit()
    return
  }
  // saisie simple OU collage multi-caractères : distribution à partir de la case
  const chars = [...text].slice(0, props.length - index)
  chars.forEach((char, offset) => {
    digits.value[index + offset] = char
  })
  el.value = digits.value[index] ?? ''
  inputs.value[Math.min(index + chars.length, props.length - 1)]?.focus()
  commit()
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    event.preventDefault()
    digits.value[index - 1] = ''
    commit()
    inputs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    inputs.value[index + 1]?.focus()
  }
}
</script>

<template>
  <div class="ds-otp" role="group" :aria-label="label" :data-invalid="invalid ? '' : undefined">
    <input
      v-for="n in length"
      :key="n"
      :ref="
        (el) => {
          inputs[n - 1] = el as HTMLInputElement | null
        }
      "
      type="text"
      class="ds-otp-input"
      :inputmode="numeric ? 'numeric' : 'text'"
      :autocomplete="n === 1 ? 'one-time-code' : 'off'"
      :value="digits[n - 1]"
      :disabled="disabled"
      :aria-label="`Caractère ${n} sur ${length}`"
      :aria-invalid="invalid || undefined"
      @input="onInput(n - 1, $event)"
      @keydown="onKeydown(n - 1, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>

<style>
@layer ds.components {
  .ds-otp {
    display: inline-flex;
    gap: var(--ds-space-2);
  }

  .ds-otp-input {
    width: var(--ds-control-height-md);
    height: var(--ds-control-height-md);
    text-align: center;
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-mono);
    font-size: var(--ds-font-size-lg);
    transition: border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur
     (aligné sur Input/Textarea) ; l'outline transparent est le filet
     forced-colors (Windows High Contrast supprime les box-shadow) */
  .ds-otp-input:focus-visible {
    border-color: var(--ds-color-accent);
    box-shadow: 0 0 0 1px var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  .ds-otp[data-invalid] .ds-otp-input {
    border-color: var(--ds-color-danger);
  }

  .ds-otp[data-invalid] .ds-otp-input:focus-visible {
    box-shadow: 0 0 0 1px var(--ds-color-danger);
  }

  .ds-otp-input:disabled {
    background: var(--ds-color-surface-muted);
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-otp-input {
      transition: none;
    }
  }
}
</style>
