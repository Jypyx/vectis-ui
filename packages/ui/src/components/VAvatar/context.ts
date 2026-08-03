import type { InjectionKey } from 'vue'

import type { AvatarSize } from './VAvatar.vue'

/**
 * Contrat VAvatarGroup → VAvatar : le groupe propage taille/compact pour éviter
 * de les répéter sur chaque VAvatar. Chaque VAvatar n'y recourt qu'à défaut de
 * prop explicite (`props.size ?? group.size ?? 'md'`).
 */
export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('v-avatar-group')
