<script setup lang="ts">
// @core
/** A static block saying that there is nothing to show, and what to do about it. */
import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

/** The scale of the block: a panel or a list, a section, a whole page. */
export type EmptyStateSize = 'sm' | 'md' | 'lg'

/** The heading level the title is rendered at. */
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

interface EmptyStateProps {
  /** What is empty, in a few words: "No invoices yet". */
  title?: string
  /** A sentence saying why, or what to do next. The default slot replaces it. */
  description?: string
  /** An icon drawn in a round badge above the title. The `#media` slot replaces it. */
  icon?: IconSource
  /** The scale of the block: `sm` for a panel or a list, `lg` for a whole page. */
  size?: EmptyStateSize
  /**
   * Renders the title as a heading of this level, without changing how it looks. Left out, the
   * title is a paragraph, which keeps a block inside a panel out of the document outline.
   */
  headingLevel?: EmptyStateHeadingLevel
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  title: undefined,
  description: undefined,
  icon: undefined,
  size: 'md',
  headingLevel: undefined,
})

defineSlots<{
  /** Replaces `description`: text with links or formatting of its own. */
  default?(): unknown
  /** An illustration replacing the icon badge. */
  media?(): unknown
  /** The buttons or links that get out of the empty state: create, import, clear the search. */
  actions?(): unknown
}>()

const titleTag = computed(() => (props.headingLevel ? `h${props.headingLevel}` : 'p'))
</script>

<template>
  <div class="v-empty-state" :data-size="size">
    <div v-if="$slots.media" class="v-empty-state-media">
      <slot name="media" />
    </div>
    <span v-else-if="icon" class="v-empty-state-icon">
      <VIcon v-bind="iconProps(icon)" />
    </span>
    <component :is="titleTag" v-if="title" class="v-empty-state-title">{{ title }}</component>
    <div v-if="$slots.default || description" class="v-empty-state-description">
      <slot>{{ description }}</slot>
    </div>
    <div v-if="$slots.actions" class="v-empty-state-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-empty-state {
    --empty-state-media: var(--vectis-control-size-empty-state-media-md);
    --empty-state-gap: var(--vectis-space-3);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--empty-state-gap);
    padding: var(--vectis-space-8) var(--vectis-space-6);
    text-align: center;
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
  }

  .v-empty-state[data-size='sm'] {
    --empty-state-media: var(--vectis-control-size-empty-state-media-sm);
    --empty-state-gap: var(--vectis-space-2);

    padding: var(--vectis-space-4);
  }

  .v-empty-state[data-size='lg'] {
    --empty-state-media: var(--vectis-control-size-empty-state-media-lg);
    --empty-state-gap: var(--vectis-space-4);

    padding: var(--vectis-space-12) var(--vectis-space-8);
  }

  /* The glyph takes half the badge, whatever its size. */
  .v-empty-state-icon {
    --vectis-icon-size: calc(var(--empty-state-media) / 2);

    display: inline-grid;
    place-items: center;
    inline-size: var(--empty-state-media);
    block-size: var(--empty-state-media);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-muted);
  }

  /* The badge's gap to the title is a step wider than the others: it opens the block. */
  .v-empty-state-icon,
  .v-empty-state-media {
    margin-block-end: var(--vectis-space-1);
  }

  .v-empty-state-title,
  .v-empty-state-description {
    max-inline-size: var(--vectis-control-size-empty-state-text-max);
    margin: 0;
  }

  .v-empty-state-title {
    font-size: var(--vectis-text-heading-4-size);
    font-weight: var(--vectis-text-heading-4-weight);
    line-height: var(--vectis-text-heading-4-leading);
  }

  .v-empty-state-description {
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    color: var(--vectis-color-text-muted);
  }

  .v-empty-state[data-size='sm'] .v-empty-state-title {
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  .v-empty-state[data-size='sm'] .v-empty-state-description {
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
  }

  .v-empty-state[data-size='lg'] .v-empty-state-title {
    font-size: var(--vectis-text-heading-3-size);
    font-weight: var(--vectis-text-heading-3-weight);
    line-height: var(--vectis-text-heading-3-leading);
  }

  .v-empty-state-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--vectis-space-3);
    margin-block-start: var(--vectis-space-2);
  }

  /* Without a fill, the badge keeps its outline so the icon still sits in a circle. */
  @media (forced-colors: active) {
    .v-empty-state-icon {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
