import { Comment, Fragment, Text } from 'vue'
import type { VNode } from 'vue'

// @ssr @core
/**
 * Reduces what a consumer put inside a component down to the elements that will really be
 * rendered.
 *
 * Content written between a component's tags does not arrive as a plain list. A loop
 * arrives as a bundle to be opened up, a condition that turned out false leaves a marker
 * behind, and the line breaks of the source text arrive as content of their own. All of
 * that is removed here, leaving only what will appear on the page.
 *
 * This is what lets a component count its own children WITHOUT the children announcing
 * themselves as they appear. Such an announcement would arrive nowhere during the render
 * done on the server and everywhere in the browser, so the page the server sent and the
 * page the browser builds would disagree — a group of avatars would say "+0" in one and
 * "+3" in the other. The content is inspected while the parent renders, which happens on
 * both sides alike, so the count is the same in both.
 *
 * It is used by the group of avatars, for the "+3" it ends with, and by the carousel, for
 * its dots and for announcing which slide of how many is showing.
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
