/**
 * This is what a VAvatarGroup passes down to the VAvatars it contains. Sizing a
 * row of avatars is a decision that belongs to the row, so the group announces
 * its size and its compact density once and every avatar inside picks them up,
 * instead of the writer repeating the same two props on each one.
 *
 * The two members are arbitrated differently, and on purpose:
 *
 * - `size` is a fallback: an avatar that was given an explicit size keeps it, one that was
 *   not takes the group's, and one that has neither falls back to
 *   `AVATAR_DEFAULT_SIZE` (`props.size ?? group.size ?? AVATAR_DEFAULT_SIZE`).
 * - `compact` is CUMULATIVE, the VButtonGroup `disabled` model (`props.compact ||
 *   group.compact`): a compact group has no avatar that can opt back out, and one avatar
 *   set compact in a regular group is compact alone. A boolean prop defaulting to `false`
 *   has no way to say "no opinion", so a fallback could never let the avatar refuse.
 */

import type { InjectionKey } from 'vue'

import type { AvatarSize } from './VAvatar.vue'

export interface AvatarGroupContext {
  size?: AvatarSize
  compact?: boolean
}

/**
 * The size of an avatar that neither names one nor sits in a group that does. VAvatar and
 * VAvatarGroup both read it — the group sets `--control-height` at its own level, for the
 * overlap — so the two cannot disagree on what an unsized avatar measures.
 */
export const AVATAR_DEFAULT_SIZE: AvatarSize = 'md'

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('v-avatar-group')
