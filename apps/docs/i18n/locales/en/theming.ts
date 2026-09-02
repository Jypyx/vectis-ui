export default {
  title: 'Theming',
  lead: 'A theme relies on a set of CSS custom properties. Customizing the theme simply consists of redefining some of them, without any build step or recompilation. No component uses hardcoded values (color, border radius, transition duration): all rely on semantic <code>--vectis-*</code> tokens.<br>Modifying a token immediately propagates the change across all components. The theme is controlled via the <code>data-theme</code> attribute, which can be applied to any HTML element, not just the root of the page.',

  switchHeading: 'Switching Themes',
  switchBody:
    'Vectis UI includes two native themes: light and dark. Both reuse the same semantic tokens by binding them to different shades of the palettes. Switching themes requires no additional CSS files and imposes no re-rendering of your Vue components. You simply modify an HTML attribute at any time, without recompilation or visual flash (FOUC).',
  switchLight: 'Light',
  switchDark: 'Dark',
  switchScope:
    'The two examples above share the exact same HTML markup: only the theme attribute differs. While the attribute is generally applied to the <code>&lt;html&gt;</code> tag for the entire application, it can be set on any element in the DOM. Thanks to CSS inheritance, the attribute closest to the component prevails across its entire subtree. A dark navigation bar in a light layout, a light preview card in a dark editor, or an invoice that remains light: none of these cases require a dedicated theme, you simply add the attribute to the targeted container.',
  switchScopeBody:
    "Child elements automatically inherit their parent's theme as long as they do not define a new one. Indeed, the <code>data-theme</code> attribute merely reassigns a set of CSS variables, which propagate naturally along the DOM. Theme nesting thus occurs with zero performance overhead and remains reversible at any depth.",
  switchColorScheme:
    'The attribute also applies the CSS <code>color-scheme</code> property. Thus, elements not directly managed by the design system automatically adapt to the active theme instead of retaining their default light style. This mainly concerns scrollbars, native form controls, and browser-specific components.',
  switchSystem:
    'Tokens intentionally contain no <code>prefers-color-scheme</code> media query. Following the system preference is a choice that belongs to the application, not the design system. This is easily implemented in a single line of JavaScript to read the system configuration and apply the attribute. Handling this in pure CSS would make manual user overrides impossible.',

  tokensHeading: 'Customizing Colors and Tokens',
  tokensBody:
    'All library styles rely on design tokens. Generated from a typed TypeScript source formatted according to a specification inspired by the W3C DTCG spec, they are then exposed as CSS variables structured across two levels:',
  tokensLevels: [
    '<strong>Primitives</strong>: Five OKLCH palettes of 11 shades each (e.g., <code>--vectis-color-indigo-500</code>), as well as spacing, typography, radius, shadow, duration, and transition scales.',
    'Semantic roles: The only tokens directly consumed by components: <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>, <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-focus-ring-color</code>.',
  ],
  tokensRoles:
    'A component consumes the accent token, never a specific shade like a precise indigo. This is what makes the library fully customizable: modify the value of the accent role, and all components adapt without ever needing to override their CSS (buttons, badges, selected elements, etc.).<br>The focus ring also has a dedicated role rather than being a simple derivative of the accent. This choice responds to different contrast requirements: the accent color must ensure text legibility (often white), while the focus ring must be immediately visible against the page background. Therefore, be sure to re-adapt these two tokens in parallel.',
  tokensOverride:
    "Overriding a token is done via a simple CSS declaration: it inserts naturally into your stylesheets, whether on <code>:root</code> for the entire application, on a class for a targeted area, or under <code>[data-theme='dark']</code> to vary by theme. Its value can be a color, another token, or a <code>calc()</code> function.<br>In the example below, six accent tokens are reassigned to a coral shade, the focus ring is adjusted to guarantee good contrast on every background, and the radius is tied to the pill token. Eight CSS declarations are enough, without modifying a single component.",
  tokensDemoCaption:
    'Solid button, outline button, chip, field, text area: none of these components specify hardcoded colors or radii. They therefore all automatically inherit this redefinition, and the behavior would be exactly the same for any other component placed in this panel. The text area is the interesting one: taller than a control, it takes the corner a control of the same size takes, and stays in line with the field above it rather than turning into an ellipse.',
  tokensOklch:
    'All colors are expressed in OKLCH, for two reasons: perceptual lightness is strictly identical from one palette to another for the same shade level, and blending hues produces natural transitions without passing through grayish tones.<br>Vectis UI automatically calculates hovered, tinted, or disabled states for your roles thanks to the <code>color-mix()</code> function. If you provide a value originating from another color space (where lightness perception differs), these calculated variations risk losing consistency. Keeping your custom values in OKLCH guarantees a perfectly predictable visual rendering.',
  tokensPalettes:
    'Vectis UI includes only five foundational palettes to cover essential needs without bloating the CSS: <code>gray</code> for surfaces, texts, and borders, <code>indigo</code> for accentuation, and <code>red</code>, <code>green</code>, and <code>amber</code> for error, success, and warning states. Including additional unused palettes would unnecessarily add CSS variables across all your pages.<br>Adding a custom hue is therefore up to the application. You simply need to declare your 11 shades of CSS variables and bind the desired semantic role to them. Integration is immediate, without any compilation step or waiting for a new library version.',

  layersHeading: 'CSS Layers',
  layersBody:
    "The library styles are structured into four cascade layers (<code>@layer</code>), ordered as follows: <code>vectis.reset</code>, <code>vectis.tokens</code>, <code>vectis.components</code>, and <code>vectis.utilities</code>. In CSS, layers are evaluated before selector specificity, and unlayered styles take precedence over all layers. Consequently, any CSS written unlayered in your project will natively override the library's, regardless of your selector's specificity.",
  layersConsequence:
    'This behavior is a deliberate architectural choice that eliminates the need for usual workarounds: no use of !important, no need to over-specify your selectors (by adding an ID or chaining classes), and no superfluous containers injected into the DOM solely to increase specificity. A simple class name is enough to override any component style, while keeping stylesheets readable and maintainable.',
  layersTrap:
    "<strong>Caution</strong>: Do not insert your own rules directly into <code>@layer vectis.components</code>. Since layer names are global, the browser would merge your rules within the library's layer: priority would then depend solely on the order of appearance in the code instead of guaranteeing the application of your overrides. Write your overrides unlayered or, if your application uses its own @layer structure, make sure to declare your layers after the library's.",
}
