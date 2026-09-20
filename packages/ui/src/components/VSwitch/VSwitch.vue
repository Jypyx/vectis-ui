<script setup lang="ts">
/**
 * A switch, for a setting that takes effect at once — where a checkbox states an
 * intention to be confirmed later.
 *
 * Underneath it is a native checkbox marked `role="switch"`, so a screen reader
 * announces it as on or off rather than as ticked, and the keyboard and the form
 * behaviour come along for free. The track and the moving thumb are pure CSS,
 * following the input's checked state; the only JavaScript besides the v-model is the
 * refusal `readonly` asks for, which a checkbox has no native form of.
 */

import { ref } from 'vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useRootAttrs } from '../../composables/useRootAttrs'

/** Which side of the switch the label sits on. */
export type SwitchLabelPosition = 'start' | 'end'

interface SwitchProps {
  /** The text beside the switch, which names it. The default slot replaces it. */
  label?: string
  /**
   * A line of help under the label. It is tied to the switch for assistive technology,
   * so it is read out after the label rather than as part of it.
   */
  hint?: string
  /** Which side of the switch the label sits on. */
  labelPosition?: SwitchLabelPosition
  /**
   * Pushes the label and the switch to opposite ends of the line, the row taking the
   * full width available. This is the usual shape for a list of settings.
   */
  spread?: boolean
  /**
   * Marks the field as invalid, which rings the track and tells assistive technology
   * so. Use it for a rule the browser cannot check by itself; native validity is
   * already handled without it.
   */
  invalid?: boolean
  /** Makes the switch unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the setting without allowing it to be changed. The switch can still be
   * focused, is announced as read-only and is still submitted with its form; a click
   * or the Space key simply changes nothing.
   */
  readonly?: boolean
}

const props = withDefaults(defineProps<SwitchProps>(), {
  label: undefined,
  hint: undefined,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
  readonly: false,
})

// @a11y
// The root element is a layout box, so the attributes the consumer passes have to be
// redirected onto the input: `name` for the form, and the aria-* for the element that
// actually carries the switch role.
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const { hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

/** Whether the switch is on. It starts off. */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** The label, when it needs more than the `label` prop's text. It is clickable. */
  default?(): unknown
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// @core
// The native `readonly` attribute does nothing on a checkbox. Cancelling the click is what
// refuses the change: the browser puts `checked` back and fires no `change`, so the v-model
// never hears of it. It covers the Space key, which a checkbox turns into a click, and a
// click on the label, which is forwarded to the input.
function refuseWhenReadonly(event: MouseEvent) {
  if (props.readonly) event.preventDefault()
}

// The root is a wrapper, so a template ref on the component reaches the layout box and not
// the control: these two are the way to the real switch.
defineExpose({
  /** Moves the focus to the real switch. */
  focus: (options?: FocusOptions) => inputEl.value?.focus(options),
  /** The real `<input type="checkbox" role="switch">`, for what `focus` does not cover. */
  el: inputEl,
})
</script>

<template>
  <span
    class="v-switch v-choice"
    :class="rootClass"
    :style="rootStyle"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <label class="v-choice-row">
      <input
        ref="inputEl"
        v-model="model"
        type="checkbox"
        role="switch"
        class="v-switch-input v-hidden-input"
        :aria-invalid="invalid || undefined"
        :aria-readonly="readonly || undefined"
        v-bind="forwardedAttrs"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @click="refuseWhenReadonly"
      />
      <span class="v-switch-track" aria-hidden="true">
        <span class="v-switch-thumb" />
      </span>
      <span v-if="$slots.default || label" class="v-switch-label v-choice-label">
        <slot>{{ label }}</slot>
      </span>
    </label>
    <span v-if="hint" :id="hintId" class="v-switch-hint v-choice-hint">{{ hint }}</span>
  </span>
</template>

<style>
@layer vectis.components {
  /* The track's own measurements, which nothing outside this sheet reads. The row they
     sit in is `.v-choice`'s (styles/choice.css), and so is the focus ring.

     TRAP — the selector is COMPOUNDED with `.v-choice`, which is on this very element and
     comes from another sheet at the same (0,1,0). Nothing collides today, this rule setting
     only custom properties and that one only real ones, but the day either gains a
     `display`, a `font-family` or a `color` the winner would be whichever sheet the
     consumer's bundler happened to emit last. VCheckbox and VRadio declare no root rule at
     all, so this is the one place in the family exposed to it. */
  .v-choice.v-switch {
    --switch-track-w: var(--vectis-control-size-switch-w);
    --switch-track-h: var(--vectis-control-size-switch-h);
    --switch-pad: var(--vectis-control-size-switch-pad);
  }

  .v-switch-track {
    display: inline-flex;
    align-items: center;
    inline-size: var(--switch-track-w);
    block-size: var(--switch-track-h);
    padding: var(--switch-pad);
    background: var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-pill);
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-switch-thumb {
    inline-size: calc(var(--switch-track-h) - var(--switch-pad) * 2);
    block-size: calc(var(--switch-track-h) - var(--switch-pad) * 2);
    background: var(--vectis-color-text-on-accent);
    border-radius: var(--vectis-radius-pill);
    box-shadow: var(--vectis-shadow-xs);
    /* The thumb travels through `margin-inline-start` rather than a translation,
       because a logical property follows the reading direction: in a right-to-left
       page the thumb then moves leftwards on its own, where a translateX would have
       to be mirrored by a second rule. The track's own box is stated logically for the
       same reason: it is the one box of the family that is not square, so a physical
       `width` would name the travel's axis in one page and the other axis in the next. */
    transition: margin-inline-start var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-switch-input:checked + .v-switch-track {
    background: var(--vectis-color-accent);
  }

  .v-switch-input:checked + .v-switch-track .v-switch-thumb {
    margin-inline-start: calc(var(--switch-track-w) - var(--switch-track-h));
  }

  /* The two hover steps VCheckbox and VRadio take, on the track's own colour: the 15 % mix
     when the switch is off, `accent-hover` when it is on. Both are needed, or a list of
     switches that are all ON answers the pointer nowhere and a live one cannot be told
     from a frozen one.

     Unlike its two siblings these exclude no invalid state, and they must not: an invalid
     switch is RINGED rather than tinted, so the hover repaints a property the invalid rule
     never touches and the two states simply add up. */
  .v-switch:not([data-readonly])
    .v-choice-row:hover
    .v-switch-input:not(:disabled, :checked)
    + .v-switch-track {
    background: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-switch:not([data-readonly])
    .v-choice-row:hover
    .v-switch-input:not(:disabled):checked
    + .v-switch-track {
    background: var(--vectis-color-accent-hover);
  }

  /* The same pair of selectors as VCheckbox and VRadio, so a switch reports a rule the
     browser checked and one only the consumer can. It is drawn as a RING rather than as
     a border colour: the track has no border to tint, and a shadow changes no geometry,
     where a border would eat into the padding the thumb travels in. Its width is the same
     token the other two give their border, so a consumer who thickens their controls
     thickens all three; the focus outline then starts where the ring ends, at its own
     offset, and the two never sit on the same pixels. */
  .v-switch-input:user-invalid + .v-switch-track,
  .v-switch-input[aria-invalid='true'] + .v-switch-track {
    box-shadow: 0 0 0 var(--vectis-control-border-width) var(--vectis-color-danger);
  }

  /* Read-only, and it has to say so whichever way the switch is pointing. An OFF switch
     sinks like a read-only checkbox — `surface-sunken` behind the 1px `border` ring the box
     and the dot draw as a real border, which a track has nowhere to put but inside itself —
     and its thumb takes the muted text colour, white being invisible on that pale track.
     An ON switch trades the accent for that same muted colour and gives the thumb the
     surface colour, which contrasts with it in both themes; the ring goes with the tint it
     was drawn against.

     `:where()` keeps all four rules at the weight of the disabled ones below, which
     therefore win by order on a switch that is both. */
  :where(.v-switch[data-readonly]) .v-switch-input + .v-switch-track {
    background: var(--vectis-color-surface-sunken);
    box-shadow: inset 0 0 0 var(--vectis-control-border-width) var(--vectis-color-border);
  }

  :where(.v-switch[data-readonly]) .v-switch-input + .v-switch-track .v-switch-thumb {
    background: var(--vectis-color-text-muted);
  }

  :where(.v-switch[data-readonly]) .v-switch-input:checked + .v-switch-track {
    background: var(--vectis-color-text-muted);
    box-shadow: none;
  }

  :where(.v-switch[data-readonly]) .v-switch-input:checked + .v-switch-track .v-switch-thumb {
    background: var(--vectis-color-surface);
  }

  /* The thumb takes text-subtle — the colour VCheckbox's disabled tick and VRadio's
     disabled dot take — which is what keeps it visible against the grey track in both
     themes. The greying of the row itself comes from `.v-choice`. */
  /* The `box-shadow: none` is not tidying: it is this rule's only way of cancelling the
     rings above it. A checkbox draws both its invalid verdict and its read-only sink with
     `border-color`, so its disabled rule overwrites them by naming the same property; here
     they are shadows, and left standing a disabled switch would go on wearing a danger ring
     around a grey track nobody can act on. */
  .v-switch-input:disabled + .v-switch-track {
    background: var(--vectis-color-surface-muted);
    box-shadow: none;
  }

  .v-switch-input:disabled + .v-switch-track .v-switch-thumb {
    background: var(--vectis-color-text-subtle);
    box-shadow: none;
  }

  /* Windows forced colors erase every author colour: a `background` becomes `Canvas` and a
     shadow is dropped altogether, so a switch loses BOTH its state and its outline, the
     track and the thumb being nothing but backgrounds. The track therefore draws its own
     edge as a real border here, inside the box so the thumb's travel is unchanged, and the
     system Highlight pair says "on" as it does on a pressed VToggleItem.

     The classes are repeated to (0,8,0) so the row's own hover rules, which reach (0,7,0),
     cannot repaint the track: `forced-color-adjust: none` takes the forcing off it, and a
     hover left winning would then paint its REAL colour over the system one. */
  @media (forced-colors: active) {
    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input + .v-switch-track {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) CanvasText;
    }

    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input
      + .v-switch-track
      .v-switch-thumb {
      forced-color-adjust: none;
      background: CanvasText;
      box-shadow: none;
    }

    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input:checked:not(
        :disabled
      )
      + .v-switch-track {
      background: Highlight;
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) Highlight;
    }

    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input:checked:not(
        :disabled
      )
      + .v-switch-track
      .v-switch-thumb {
      background: HighlightText;
    }

    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input:disabled
      + .v-switch-track {
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) GrayText;
    }

    .v-switch-input.v-switch-input.v-switch-input.v-switch-input.v-switch-input:disabled
      + .v-switch-track
      .v-switch-thumb {
      background: GrayText;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-switch-track,
    .v-switch-thumb {
      transition: none;
    }
  }
}
</style>
