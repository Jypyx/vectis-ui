<script setup lang="ts">
// @a11y
/**
 * A VButtonGroup joining a VButton to the VIconButton that opens a VMenu. The group shares the
 * shape and the disabled state; the menu is anchored to the whole control rather than to its
 * trigger, so it can line up with either edge and match the full width.
 */
import { computed, ref } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useMessages } from '../../i18n/state'

import VButton from '../VButton/VButton.vue'
import type { ButtonSize, ButtonTone, ButtonVariant } from '../VButton/VButton.vue'
import VButtonGroup from '../VButton/VButtonGroup.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import VMenu from '../VMenu/VMenu.vue'
import type { MenuPlacement, MenuSize } from '../VMenu/context'

interface SplitButtonProps {
  /** The visible text of the main action. */
  label: string
  /**
   * How much visual weight both halves carry, on the values of VButton's own `variant`:
   * `solid`, `outline`, `ghost` or `soft`.
   */
  variant?: ButtonVariant
  /** What the actions mean, in colour: `accent`, `neutral` or `danger`. */
  tone?: ButtonTone
  /** The height of both halves, from the size scale shared by every control. */
  size?: ButtonSize
  /** Takes 4px off the height of both halves. */
  compact?: boolean
  /** Raises the control off the page with a shadow, on the terms of VButton's `elevated`. */
  elevated?: boolean
  /**
   * Stretches the control to the whole inline size of its parent. The main action takes the
   * extra room; the menu button stays square.
   */
  fullWidth?: boolean
  /**
   * Turns the main action into an `<a>` pointing at this address. A disabled or loading link
   * becomes inert: the address is dropped, so it can be neither focused nor followed.
   */
  href?: string
  /** The native type of the main button. It is ignored as soon as `href` makes it a link. */
  type?: ButtonHTMLAttributes['type']
  /** Makes both halves unusable. */
  disabled?: boolean
  /**
   * Shows a spinner in the main action and announces it as busy. The menu button is disabled
   * meanwhile: an action is already under way.
   */
  loading?: boolean
  /** An icon before the label of the main action. */
  iconStart?: IconSource
  /** An icon after the label of the main action. */
  iconEnd?: IconSource
  /** Renders `iconStart` and `iconEnd` in their filled form. */
  iconFilled?: boolean
  /** What screen readers announce for the menu button. The dictionary's "More options" otherwise. */
  menuLabel?: string
  /** The icon of the menu button, the built-in `expand_more` otherwise. */
  menuIcon?: IconSource
  /**
   * Where the menu opens relative to the whole control. The browser moves it to another side by
   * itself when there is not enough room.
   */
  placement?: MenuPlacement
  /** How tall the rows of the menu are: 32, 40 or 48 pixels. */
  menuSize?: MenuSize
  /**
   * A width for the menu: a number is read as pixels, a string as any CSS length or keyword
   * (`16rem`, `max-content`).
   */
  menuWidth?: number | string
  /** Stops the menu from being narrower than the whole control, while leaving it free to grow. */
  matchTrigger?: boolean
}

const props = withDefaults(defineProps<SplitButtonProps>(), {
  variant: 'solid',
  tone: 'accent',
  size: 'md',
  compact: false,
  elevated: false,
  fullWidth: false,
  href: undefined,
  type: 'button',
  disabled: false,
  loading: false,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
  menuLabel: undefined,
  menuIcon: () => expandMoreIcon,
  placement: 'bottom-end',
  menuSize: 'sm',
  menuWidth: undefined,
  matchTrigger: false,
})

const emit = defineEmits<{
  /** The main action was activated. A disabled or loading control emits nothing. */
  click: [event: MouseEvent]
}>()

/** Whether the menu is showing. The browser's own dismissal writes back to it. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The other actions: VMenuItem, VMenuGroup and VMenuSeparator, submenus included. */
  default(): unknown
}>()

defineOptions({ inheritAttrs: false })

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const m = useMessages()
const menuText = computed(() => props.menuLabel ?? m.value.splitButton.menu)

const mainRef = ref<InstanceType<typeof VButton> | null>(null)
const el = computed(() => (mainRef.value?.$el as HTMLElement | undefined) ?? null)

defineExpose({
  /** Moves the focus to the main action. */
  focus: (options?: FocusOptions) => el.value?.focus(options),
  /** The main action's `<button>` or `<a>`. */
  el,
})
</script>

<template>
  <VButtonGroup
    bordered
    class="v-split-button"
    :class="rootClass"
    :style="rootStyle"
    :variant="variant"
    :tone="tone"
    :size="size"
    :compact="compact"
    :elevated="elevated"
    :disabled="disabled"
    :full-width="fullWidth"
    :data-loading="loading ? '' : undefined"
  >
    <VButton
      ref="mainRef"
      v-bind="forwardedAttrs"
      class="v-split-button-main"
      :href="href"
      :type="type"
      :loading="loading"
      :icon-start="iconStart"
      :icon-end="iconEnd"
      :icon-filled="iconFilled"
      @click="emit('click', $event)"
    >
      {{ label }}
    </VButton>
    <VMenu
      v-model:open="open"
      :placement="placement"
      :size="menuSize"
      :width="menuWidth"
      :match-trigger="matchTrigger"
    >
      <template #trigger="{ triggerProps }">
        <VIconButton
          v-bind="triggerProps"
          class="v-split-button-menu"
          :label="menuText"
          :icon="menuIcon"
          :disabled="loading"
        />
      </template>
      <slot />
    </VMenu>
  </VButtonGroup>
</template>

<style>
@layer vectis.components {
  /* The panel stays a descendant of the group in the document, so the scope covers it while
     keeping every split button on the page from answering to the same name. */
  .v-split-button {
    anchor-name: --split-button-anchor;
    anchor-scope: --split-button-anchor;
  }

  /* The whole control instead of the menu button VMenu anchors to. (0,2,0) beats the panel's
     own `position-anchor` at (0,1,0) whatever the sheet order, and the child combinator leaves
     submenus, nested inside the panel, on their parent item. */
  .v-split-button > .v-menu {
    position-anchor: --split-button-anchor;
  }

  /* The group's full width shares the row equally between its segments; here only the main
     action grows, and the menu button keeps its square. */
  .v-split-button[data-full-width] {
    grid-template-columns: 1fr auto;
  }

  /*
   * While the main action loads, the disabled menu button keeps the paint of the main one, half
   * transparent, instead of VButton's grey disabled state, which would split the control in two
   * colours. At (0,5,0) these beat VButton's (0,4,0) disabled rules whatever the sheet order.
   */
  .v-split-button[data-loading] > .v-split-button-menu.v-button {
    opacity: 0.5;
  }

  .v-split-button[data-loading] > .v-split-button-menu.v-button[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  .v-split-button[data-loading] > .v-split-button-menu.v-button[data-variant='soft'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .v-split-button[data-loading] > .v-split-button-menu.v-button[data-variant='outline'] {
    color: var(--tone-text-tinted);
    border-color: var(--tone-border-soft);
  }

  .v-split-button[data-loading] > .v-split-button-menu.v-button[data-variant='ghost'] {
    color: var(--tone-text-tinted);
  }
}
</style>
