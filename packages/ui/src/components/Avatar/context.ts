import type { InjectionKey } from 'vue'

import type { AvatarSize } from './Avatar.vue'

/**
 * Contrat AvatarGroup → Avatar : le groupe propage taille/compact pour éviter
 * de les répéter sur chaque Avatar. Chaque Avatar n'y recourt qu'à défaut de
 * prop explicite (`props.size ?? group.size ?? 'md'`).
 */
export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('ds-avatar-group')
