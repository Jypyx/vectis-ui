import { Comment, Fragment, Text } from 'vue'
import type { VNode } from 'vue'

/**
 * Flattens a slot's VNodes down to the elements a component actually renders:
 * Fragments (a `v-for`) are unwrapped, comments (a false `v-if`) and whitespace
 * text nodes are dropped.
 *
 * It is what lets a component know how many children it was given WITHOUT a
 * registry the children feed at mount: a registry renders 0 on the server and N
 * on the client, a guaranteed hydration mismatch (the reason VTabs derives
 * `hasPanels` from `slots` too). The slot function is called during the parent's
 * own render, on both sides, so the count is identical.
 *
 * Consumers: VAvatarGroup (the "+X" aggregate), VCarousel (the indicators and
 * the "N of M" slide labels).
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
