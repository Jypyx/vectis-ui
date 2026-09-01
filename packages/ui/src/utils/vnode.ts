import { Comment, Fragment, Text } from 'vue'
import type { VNode } from 'vue'

// @ssr @core
/**
 * A slot's VNodes reduced to the elements that will actually render: `v-for` Fragments
 * unwrapped, a false `v-if`'s Comment and the source text's whitespace dropped.
 *
 * This is what lets a component count its children without a registry they feed at mount.
 * A registry fills up in the browser and stays empty on the server, so the two renders
 * disagree — VAvatarGroup would say "+0" in one and "+3" in the other. Reading the slot
 * happens while the parent renders, which is the same on both sides.
 *
 * Used by VAvatarGroup for its "+N" and by VCarousel for its dots and its live region.
 */
export function flattenSlot(nodes: VNode[] | undefined): VNode[] {
  const out: VNode[] = []
  for (const node of nodes ?? []) {
    if (node.type === Fragment) out.push(...flattenSlot(node.children as VNode[]))
    else if (node.type === Comment) continue
    else if (node.type === Text && !String(node.children).trim()) continue
    else out.push(node)
  }
  return out
}
