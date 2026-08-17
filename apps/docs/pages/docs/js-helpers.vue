<script setup lang="ts">
definePageMeta({ layout: 'docs' })
useHead({ title: 'JavaScript helpers' })

const configCode = `// app entry — module level, never inside a setup()
import {
  fr,
  registerMessages,
  setLocale,
  setIconResolver,
  ligatureIconResolver,
} from '@vectis/ui'

registerMessages('fr', fr)
setLocale('fr-FR')
setIconResolver(ligatureIconResolver())`

const toastCode = `import { toast } from '@vectis/ui'

// client-side only: the queue is module state, shared by every
// request a server handles
toast({ message: 'Copied to the clipboard', duration: 1600 })`
</script>

<template>
  <h1>JavaScript helpers</h1>
  <p class="vd-lead">
    The package exports named functions only, and the list is short on purpose: configuration for
    the whole design system, and nothing that a component could have done itself.
  </p>

  <h2 id="what-is-exported">What is exported</h2>
  <DocsTable :columns="['Export', 'What it does']">
    <tr>
      <td><code>setLocale(tag)</code></td>
      <td>
        Sets the locale for the whole design system. The FORMATS derive from
        <code>Intl</code> from this tag, whether or not a dictionary matches it.
      </td>
    </tr>
    <tr>
      <td><code>registerMessages(tag, dict)</code></td>
      <td>
        Registers a dictionary. Partial dictionaries are legitimate: what is missing falls back to
        English.
      </td>
    </tr>
    <tr>
      <td><code>en</code> · <code>fr</code></td>
      <td>
        The two shipped dictionaries. <code>en</code> is always bundled; <code>fr</code> is opt-in —
        not importing it prunes it.
      </td>
    </tr>
    <tr>
      <td><code>setIconResolver(fn)</code></td>
      <td>
        Wires a third-party icon library. Consulted BEFORE the built-in registry; return
        <code>undefined</code> to hand over.
      </td>
    </tr>
    <tr>
      <td><code>ligatureIconResolver()</code></td>
      <td>Resolves a name to an icon-font ligature — Material Symbols, IcoMoon.</td>
    </tr>
    <tr>
      <td><code>classIconResolver()</code></td>
      <td>
        Resolves a name to a class-driven set — Font Awesome, Phosphor, Bootstrap Icons. Strict by
        default, so an unmapped name falls back to the built-in SVG rather than to an empty square.
      </td>
    </tr>
    <tr>
      <td><code>componentIconResolver()</code></td>
      <td>Resolves a name to a component from your own library — Lucide, Untitled UI.</td>
    </tr>
    <tr>
      <td><code>toast(options)</code> · <code>dismissToast(id)</code></td>
      <td>
        Adds and removes a notification. The only imperative API in the library — a toast has no
        place in the tree that asks for it.
      </td>
    </tr>
  </DocsTable>
  <DocsCode lang="ts" :code="configCode" />
  <p>
    Everything above writes MODULE-LEVEL state, which is what lets it be called from any
    <code>.ts</code> file without a plugin or a provider, and what makes already-mounted components
    re-render when it changes. The same property is the constraint: it belongs to the process rather
    than to a request, so it is configuration and never anything that varies per visitor.
  </p>
  <DocsCode lang="ts" :code="toastCode" />
  <p>
    Types are exported alongside them — <code>VectisMessages</code>,
    <code>VectisMessagesInput</code>, <code>IconSource</code>, <code>IconResolver</code>,
    <code>ToastOptions</code> — plus one per component whose API needs naming
    (<code>ComboboxOption</code>, <code>DataTableColumn</code>, <code>CalendarSelection</code>…).
  </p>

  <h2 id="the-internal-helpers">The internal helpers, and why they stay internal</h2>
  <p>
    The library carries a full set of date, time, file and text helpers — they are what VCalendar,
    VDatePicker, VTimePicker and VFileUpload are built on. They are NOT exported, and the reason is
    stated at the entry point: the internal modules are not part of the public surface, so their
    signatures stay free to change with the components that use them.
  </p>
  <DocsTable :columns="['Module', 'Internal helpers']">
    <tr>
      <td><code>utils/date.ts</code></td>
      <td>
        <code>parseISO</code>, <code>formatISO</code>, <code>addDays</code>, <code>addMonths</code>,
        <code>clampISO</code>, <code>isWithin</code>, <code>buildMonthGrid</code>,
        <code>firstDayOfWeekFor</code>, <code>weekdayNames</code>, <code>monthNames</code>,
        <code>formatDisplay</code>, <code>dateMaskFor</code>,
        <code>parseDateMask</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/time.ts</code></td>
      <td>
        <code>parseTime</code>, <code>formatTime</code>, <code>to12h</code>, <code>to24h</code>,
        <code>hourCycleFor</code>, <code>snapMinute</code>, <code>timeList</code>,
        <code>timeToMask</code>, <code>parseTimeMask</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/file.ts</code></td>
      <td><code>matchesAccept</code>, <code>formatBytes</code>, <code>screenFiles</code></td>
    </tr>
    <tr>
      <td><code>utils/text.ts</code> · <code>number.ts</code> · <code>array.ts</code></td>
      <td>
        <code>normalizeText</code>, <code>pad2</code>, <code>digitsOf</code>, <code>clamp</code>,
        <code>toggleValue</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/arrowNav.ts</code> · <code>matcher.ts</code></td>
      <td><code>navigableItems</code>, <code>arrowNavigate</code>, <code>resolveMatcher</code></td>
    </tr>
    <tr>
      <td><code>utils/css.ts</code> · <code>vnode.ts</code> · <code>env.ts</code></td>
      <td><code>px</code>, <code>cssSize</code>, <code>flattenSlot</code>, <code>isDev</code></td>
    </tr>
  </DocsTable>
  <blockquote>
    Two of them are worth copying rather than importing: <code>hourCycleFor(locale)</code> and
    <code>firstDayOfWeekFor(locale)</code> answer questions <code>Intl</code> only answers
    indirectly.
  </blockquote>

  <h2 id="composables">Composables</h2>
  <p>
    The same rule covers the thirteen composables — <code>usePopover</code>,
    <code>useFieldPanel</code>, <code>useMaskedField</code>, <code>useFocusoutDismiss</code>,
    <code>useTextLimit</code>, <code>useRootAttrs</code>, <code>useTimer</code> and their kin:
    internal, unexported, and documented in their own files. If you find yourself needing one, that
    is a request for a component.
  </p>
</template>
