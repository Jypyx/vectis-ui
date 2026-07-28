import type { InjectionKey } from 'vue'

import type { AvatarSize } from './VAvatar.vue'

/**
 * This is what a VAvatarGroup passes down to the VAvatars it contains. Sizing a
 * row of avatars is a decision that belongs to the row, so the group announces
 * its size and its compact density once and every avatar inside picks them up,
 * instead of the writer repeating the same two props on each one.
 *
 * The values are only a fallback: an avatar that was given an explicit prop keeps
 * it, an avatar that was not takes the group's, and one that has neither falls
 * back to the default size (`props.size ?? group.size ?? 'md'`).
 */
export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('v-avatar-group')
