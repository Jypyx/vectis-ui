export default {
  title: 'Accordion',
  lead: 'Sections that fold. It is built on <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code>, so the open state, the keyboard behaviour and in-page search all come from the browser.',

  exclusiveHeading: 'Exclusive, or not',
  exclusiveBody:
    'Only one item open at a time is not JavaScript here: it is what the browser does once every item shares a <code>name</code>. The group generates one, so <code>exclusive</code> is <strong>true by default</strong>. Set it to <code>false</code> and each section keeps its own state.',

  /*
   * The demo's own FAQ text is NOT here, and deliberately: the code sample printed under it
   * shows the same strings, so translating one without the other would make the two disagree
   * on screen. Demo content is code; the prose around it is what this file carries.
   */

  variantsHeading: 'Variants',
  variantsBody:
    '<code>flat</code> draws nothing at all, with no background, no border and no radius, so the accordion inherits whatever surface it sits on. <code>outlined</code> gives the canonical card: <code>surface-raised</code>, a 1px border, <code>radius-surface</code>, and no shadow. It is the same decoration scale VDataTable and VTabs use, so the three agree without being coupled.',
  variantsRadius:
    'A nested corner is derived with <code>calc(var(--vectis-radius-surface) - 1px)</code>. That is why the radius scale carries a <code>none</code> worth <code>0px</code> rather than <code>0</code>: subtracting from a unitless zero is invalid CSS.',

  densityHeading: 'Density',
  densityBody:
    "<code>compact</code> takes 4px off every padding, block, inline and the content's breathing room alike, through a single delta the items inherit. The type and the icons do not change: an accordion has no fixed height, so it sits outside the control size scale entirely.",

  animationHeading: 'Animation',
  animationBody:
    'The height animation is progressive enhancement, through <code>::details-content</code> and <code>interpolate-size</code>. Where those are unsupported the section simply opens at once. No JavaScript measures anything, and nothing jumps.',

  disablingHeading: 'Disabling an item',
  disablingBody:
    '<code>&lt;summary&gt;</code> has no native <code>disabled</code>, so a disabled item gets <code>aria-disabled</code>, <code>tabindex="-1"</code> and a cancelled click, which is the component\'s only JavaScript. Not <code>pointer-events: none</code>, which would take away the <code>not-allowed</code> cursor and the ability to select the text.',

  apiHeading: 'API',
  apiExclusive: '<code>boolean</code>: one open at a time, via <code>&lt;details name&gt;</code>',
  apiCompact: '<code>boolean</code>: every padding loses 4px',
  apiCollapseIcon: '<code>IconSource</code>: give both and they swap instead of rotating',
  apiTitles: '<code>string</code>, or the <code>#title</code> / <code>#subtitle</code> slots',
  apiIconStart: '<code>IconSource</code>, or the <code>#start</code> slot',
  apiDefaultOpen: '<code>boolean</code>: first render only, the browser owns it afterwards',
  apiQuote:
    'There is no <code>v-model:open</code>, and that is the point: the state belongs to the <code>&lt;details&gt;</code> element. Mirroring it into Vue would give you two sources of truth for something the browser already knows.',
}
