import { Comment, Fragment, Text } from 'vue'
import type { VNode } from 'vue'

// @ssr @core
/**
 * A slot's VNodes reduced to the elements that will actually render: `v-for` Fragments
 * unwrapped, a false `v-if`'s Comment and the source text's whitespace dropped.
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
