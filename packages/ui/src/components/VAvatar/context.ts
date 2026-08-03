import type { InjectionKey } from 'vue'

import type { AvatarSize } from './VAvatar.vue'

/**
 * The VAvatarGroup → VAvatar contract: the group propagates size/compact so they
 * need not be repeated on every VAvatar. Each VAvatar only falls back to it in the
 * absence of an explicit prop (`props.size ?? group.size ?? 'md'`).
 */
export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('v-avatar-group')
