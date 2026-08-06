# Security model

The package has **no runtime dependency** beyond Vue, makes **no network request**, and
reads no storage. It renders no string of yours as HTML — there is no `v-html` anywhere in
the library.

What follows is the part that is yours, stated plainly so it is not discovered later.

## URL schemes are not filtered

`href` and `src` are passed through untouched. That is the standard contract for a
component library — filtering would break legitimate `mailto:`, `tel:` and custom schemes
— but it means a `javascript:` URL coming from your data runs on click.

The props concerned are `href` on `VButton`, `VChip`, `VAvatar`, `VMenuItem`,
`VSideNavigationItem` and `VBreadcrumb`, and `src` on `VIcon` and `VAvatar`.

Validate where the data enters your application, not at the point of render. Pay
particular attention to `VBreadcrumb`, whose `items[].href` is typically built from a CMS
or an API rather than written by hand.

## Custom colours are data too

Custom colour props — `color` on `VChip`, `VBadge`, `VAvatar`, and on `VCalendar` events —
are written to CSS custom properties through `style.setProperty`, so they cannot escape
the `style` attribute and cannot inject a rule.

They can still be a valid `url(…)`, which is to say a tracking beacon. If such a value
comes from outside your application, treat it as data to validate.

## Server-side rendering

No component reads `window`, `document` or `navigator` outside `onMounted`, a watcher or
an event handler, so nothing leaks per-request state into module scope.

Two pieces of configuration are the exception, and deliberately so: the icon resolver and
the locale are **module-level**, one per process. That is correct for configuration and
wrong for per-request state — a server serving several locales from one process must pass
text props explicitly rather than calling `setLocale` per request.
