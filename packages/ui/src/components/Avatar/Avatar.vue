<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * Avatar avec fallback en cascade : image → initiales (dérivées du nom).
 * JS justifié : la détection d'échec de chargement d'image (`error`) n'existe
 * qu'en événement DOM, et les initiales sont dérivées du nom.
 */
interface AvatarProps {
  /** URL de l'image. */
  src?: string
  /** Nom complet — sert d'alt par défaut et de source des initiales. */
  name?: string
  /** Alt explicite (prioritaire sur name). */
  alt?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  name: undefined,
  alt: undefined,
  size: 'md',
})

const failed = ref(false)
// nouvelle source → on retente l'image
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('')
})

const showImage = computed(() => Boolean(props.src) && !failed.value)
</script>

<template>
  <!-- sans nom accessible, pas de role="img" : l'avatar est alors décoratif -->
  <span
    class="ds-avatar"
    :data-size="size"
    :role="!showImage && (alt ?? name) ? 'img' : undefined"
    :aria-label="showImage ? undefined : (alt ?? name)"
  >
    <img
      v-if="showImage"
      class="ds-avatar-image"
      :src="src"
      :alt="alt ?? name ?? ''"
      @error="failed = true"
    />
    <span v-else class="ds-avatar-initials" aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style>
@layer ds.components {
  .ds-avatar {
    --_size: var(--ds-control-height-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_size);
    height: var(--_size);
    flex: none;
    overflow: hidden;
    background: var(--ds-color-accent-surface);
    color: var(--ds-color-accent-text);
    border-radius: var(--ds-radius-full);
    font-family: var(--ds-font-family-sans);
    font-size: calc(var(--_size) * 0.4);
    font-weight: var(--ds-font-weight-semibold);
    user-select: none;
  }

  .ds-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ds-avatar[data-size='sm'] {
    --_size: var(--ds-control-height-sm);
  }

  .ds-avatar[data-size='lg'] {
    --_size: var(--ds-control-height-lg);
  }
}
</style>
