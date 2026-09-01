export default {
  title: 'Accessibility',
  lead: "Comprehensive keyboard navigation, native ARIA semantics, and systemic respect for <code>prefers-reduced-motion</code> across all components.",

  guaranteedHeading: "Accessibility Requirements and Guarantees",
  guarantees: [
    "<strong>Keyboard Navigation & Focus Management</strong>: All interactive components are accessible and operable via keyboard following the logical DOM order, without focus traps. The focus ring is guaranteed. Upon closing a floating component (menu, drawer, dialog), focus is restored to its trigger element, and the Escape key consistently dismisses overlay views.",
    "<strong>WAI-ARIA Semantics & Dynamic Announcements</strong>: Each component implements the appropriate ARIA pattern for its role, reflecting its dynamic states and structural relationships between sub-elements. Screen reader announcements prioritize function and behavior over visual appearance. Contextual updates are broadcast to assistive technologies via ARIA live regions.",
    "<strong>Compile-time Constraints for Accessible Names</strong>: Visual controls relying solely on icons mandate an accessible name via their props. Omitting this label results in a compile-time typing error rather than a silent failure at runtime.",
    "<strong>Contrast Ratios & State Tokens</strong>: Text contrast adheres to the minimum WCAG AA threshold in both light and dark themes. Disabled states are managed through dedicated color tokens rather than reduced opacity, preserving their legibility regardless of the underlying surface.",
  ],
  guaranteedBody:
    "Nearly half of the design system's behavioral JavaScript logic is dedicated exclusively to accessibility mechanisms (focus management, ARIA attributes, keyboard trapping). Components are designed with an accessibility-first paradigm: accessibility serves as the foundation before any interactive layer is added. Finally, the codebase is explicitly tagged so this proportion can be factually measured and audited, guaranteeing a quantifiable commitment rather than mere intent.",

  focusHeading: 'Focus',
  focusBody:
    "The focus indicator is materialized as a 2px outline with a 2px offset, drawn outside the element's box (<code>outline</code>). This out-of-flow rendering guarantees zero reflow cost (no layout shift). When the parent component clips its content (<code>overflow: hidden</code>), the indicator is automatically inset (notably for action buttons nested within inputs, accordion summaries, or animated tree branches). Indeed, an outline projected outside a container with a clipping mask is truncated and becomes invisible.",
  focusCaption:
    "Navigate through them using Tab. A text field is the exception to the rule, featuring a 1px accent border plus a shadow of the same color, while the clear icon inside it retains its own focus ring.",

  validationHeading: 'Validation',
  validationBody:
    "Error management relies on the native <code>:user-invalid</code> pseudo-class rather than <code>:invalid</code>. Visual error feedback is only triggered once input is interrupted and the field loses focus (blur), preventing partial inputs (e.g., a half-typed email address) from being prematurely marked as invalid. For business rules that can only be validated by the server, the <code>invalid</code> prop allows programmatically forcing the component's error state.",

  motionHeading: 'Motion',
  motionBody:
    "When the <code>prefers-reduced-motion</code> system preference is active, state transitions are removed (<code>transition: none</code>), while looping animations are slowed down instead of being stopped. A loading spinner, for example, has its cycle extended from 1s to 3s. Maintaining this minimal motion prevents display ambiguity: a completely frozen status component is perceived by users as an application crash.",

  forcedColorsHeading: 'Forced Colors',
  forcedColorsBody:
    "Vectis UI incorporates two architectural choices specifically designed for Windows Forced Colors Mode (High Contrast):",
  forcedColorsRules: [
    "<strong>Icon Rendering</strong>: Icons are exclusively integrated as <code>&lt;svg&gt;</code> tags using <code>fill=\"currentColor\"</code>. The use of CSS background masks (<code>mask-image</code>) is prohibited, as they are completely hidden by the system in forced colors mode.", 
    "<strong>Dividers and Separators</strong>: Dividers are implemented using genuine CSS borders (<code>border</code>) rather than thin containers with a background color (<code>background-color</code>). The system resets backgrounds to the Canvas system color (identical to the page background, rendering the component invisible), whereas borders fallback to <code>CanvasText</code>, ensuring their visibility."
  ]
}