/**
 * Explicit avatar size overrides the group fallback. Compact is cumulative, so a compact group
 * cannot have an expanded child.
 */

import type { InjectionKey } from 'vue'

import type { AvatarSize } from './VAvatar.vue'

export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

/** The size of an avatar that neither names one nor sits in a group that does. */
export const AVATAR_DEFAULT_SIZE: AvatarSize = 'md'

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('v-avatar-group')
