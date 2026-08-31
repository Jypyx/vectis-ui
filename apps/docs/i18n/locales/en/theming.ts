export default {
  title: 'Theming',
  lead: 'A theme is a set of CSS custom properties, and theming is redefining some of them. There is nothing to rebuild and no build step to configure. No component holds a colour, a radius or a duration of its own: each one paints itself from semantic <code>--vectis-*</code> roles, so redefining a role changes every component that reads it, wherever it is used. Which theme is showing is one attribute, <code>data-theme</code>, and it can sit on any element rather than only on the page.',

  switchHeading: 'Switch theme',
  switchBody:
    'The library ships two themes, light and dark. They are the same roles pointing at different steps of the same palettes, so switching is not loading a second stylesheet or rendering anything differently. It is setting one attribute, at any moment, with no rebuild and no flash of restyled content.',
  switchLight: 'Light',
  switchDark: 'Dark',
  switchScope:
    'The two panels above are the same markup in the same page, each naming its own theme. That is the whole point of making it an attribute: it is usually set on <code>&lt;html&gt;</code>, where it covers everything, but it works on <strong>any element of the DOM</strong>, and the nearest one wins for its own subtree. A dark navigation rail in a light application, a light preview card inside a dark editor, an invoice that stays light while the tool around it is dark: none of these needs a second theme, only a second attribute.',
  switchScopeBody:
    'Anything nested inherits the theme it did not name, because what the attribute really sets is a block of custom properties, and custom properties inherit down the tree. Nesting is therefore free, and reversible at any depth.',
  switchColorScheme:
    'The attribute also sets <code>color-scheme</code>, so the parts of the page the design system does not draw follow the theme instead of staying light inside a dark panel. Scrollbars, form controls and the browser’s own widgets are the ones to watch.',
  switchSystem:
    'There is deliberately no <code>prefers-color-scheme</code> query in the generated tokens. Following the system is the application’s decision, not the design system’s, and it comes down to one line of JavaScript reading the media query and setting the attribute. Written into the CSS it could not be overridden by a reader who wants the other theme, which is exactly what the switch in this site’s header does.',

  tokensHeading: 'Customize colors and tokens',
  tokensBody:
    'Everything the library paints with is a token, generated from a typed TypeScript source in a format inspired by the W3C DTCG and published as ordinary custom properties, on two levels.',
  tokensLevels: [
    '<strong>Primitives</strong>: five OKLCH palettes of eleven steps each (<code>--vectis-color-indigo-500</code>), plus the space scale, the type scale, the radii, the shadows, the durations and the easings.',
    '<strong>Semantic roles</strong>, the only ones a component is allowed to name: <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>, <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-focus-ring-color</code>.',
  ],
  tokensRoles:
    'A component asks for the accent and never for a particular indigo, and that is what makes the library customisable at all: change what the accent IS, and no component has to know. Customising is therefore never a matter of overriding component CSS. Redefine the role and every button, chip and selection follows. The focus ring is a role of its own rather than a shade of the accent, since the two answer to different constraints: white text has to read on the accent, and the ring has to be seen against the page. Repoint it alongside.',
  tokensOverride:
    "A redefinition is an ordinary CSS declaration, so it goes wherever CSS goes: on <code>:root</code> for the whole application, on a class for a single region, or under <code>[data-theme='dark']</code> to differ from one theme to the other. Its value can be a colour, another token, or a <code>calc()</code>. The panel below repoints the six accent roles to a coral, the focus ring to a step that reads on both grounds, and the interactive radius to the pill token: eight declarations, and no component touched.",
  tokensDemoCaption:
    'A filled button, an outlined one and a chip. None of the three names a colour or a radius, so all three follow the redefinition, and so would every other component in that panel.',
  tokensOklch:
    'Colour is written in OKLCH, always, and for two reasons: one step of a palette is as light as the same step of any other, and mixing two of them passes through the shades you expect rather than through grey. The library derives hovers, tints and disabled states from your roles with <code>color-mix()</code>, so a value given in a space whose lightness axis behaves differently makes those derivations drift. Keep your values in OKLCH and they cannot.',
  tokensPalettes:
    'The library ships five palettes and no more, because five is what it paints with: gray for surfaces, text and borders, indigo for the accent, and red, green and amber for danger, success and warning. An unused palette would still be eleven custom properties in every page that loads the stylesheet, which is why a sixth colour belongs to the application. Declare its eleven steps under your own name, point the role at them, and you are done, with no rebuild and no release to wait for. This site does exactly that for its violet accent.',

  layersHeading: 'CSS layers',
  layersBody:
    'The library’s CSS is declared in four cascade layers, in this order: <code>vectis.reset</code>, <code>vectis.tokens</code>, <code>vectis.components</code>, <code>vectis.utilities</code>. A layer is a stage of the cascade consulted <strong>before</strong> specificity is ever compared, and declarations outside every layer are consulted last of all. A rule you write in no layer therefore beats the library’s, whatever either selector is made of.',
  layersConsequence:
    'That is the intended override mechanism rather than a loophole, and it is what makes the usual escapes unnecessary: no <code>!important</code>, no selector padded with a spare class or an <code>id</code>, no wrapper element added to buy specificity. One class name is enough to change any property of any component, and your stylesheet stays as readable as what it overrides.',
  layersTrap:
    'One thing to avoid: do not write your own rules inside <code>@layer vectis.components</code>. Layer names are global, so the browser would fold your block into the library’s own layer and arbitrate it there by source order instead of giving it the last word. Keep your overrides unlayered, or, if your application has layers of its own, declare them after the library’s.',
}
