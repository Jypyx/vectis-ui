<script setup lang="ts">
import { VInput } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Input' })

const name = ref('Vectis')

const anatomyCode = `<VInput
  v-model="name"
  label="Project name"
  hint="Shown in the sidebar and in the URL"
  clearable
  counter
  :maxlength="32"
/>`

const softCode = `<!-- the reader may type past 40; the field then goes into
     error through setCustomValidity, rather than silently
     refusing the keystroke -->
<VInput v-model="summary" :maxlength="40" soft-limit counter />`
</script>

<template>
  <h1>Input</h1>
  <p class="vd-lead">
    A complete text field: label above, hint below, icons inside, a character counter, a clear
    button and a loading state, all around a real <code>&lt;input&gt;</code>.
  </p>
  <p>
    Validation stays the browser's. The field turns red through <code>:user-invalid</code>, which
    only reacts once the reader has left it, so a half-typed email is never called wrong.
  </p>

  <h2 id="anatomy">Anatomy</h2>
  <DocsDemo stack>
    <VInput
      v-model="name"
      label="Project name"
      hint="Shown in the sidebar and in the URL"
      placeholder="my-project"
      clearable
      counter
      :maxlength="32"
    />
    <VInput label="Search the registry" icon-start="search" placeholder="Package name" />
  </DocsDemo>
  <p>
    The label is tied to the field, so clicking it focuses the field, and the hint is read out along
    with the label. The cross hands focus back to the input the instant it empties the field —
    otherwise a keyboard reader loses their place in the form.
  </p>
  <DocsCode lang="vue" :code="anatomyCode" />
  <p>
    The model is typed <code>string | number</code> rather than <code>string</code>, and that is not
    laxity: on <code>type="number"</code> Vue casts the value to a number itself, so a string-only
    model would hand a number back to whoever passed a string in.
  </p>

  <h2 id="sizes-and-density">Sizes and density</h2>
  <p>
    Three sizes only — 32, 40 and 48px — because every component that embeds a text input restricts
    itself to sm, md and lg. The 24px step is too short for editable text, and the 56px one is
    outside the form template.
  </p>
  <DocsDemo>
    <VInput size="sm" placeholder="sm · 32px" />
    <VInput size="md" placeholder="md · 40px" />
    <VInput size="lg" placeholder="lg · 48px" />
  </DocsDemo>

  <h2 id="states">States</h2>
  <DocsDemo>
    <VInput
      model-value="taken@example.com"
      label="Server-side rule"
      invalid
      hint="This address is already registered"
    />
    <VInput model-value="vectis-ui" label="Read only" readonly />
    <VInput label="Disabled" placeholder="Unavailable" disabled />
    <VInput model-value="vectis" label="Checking" loading />
  </DocsDemo>
  <p>
    <code>readonly</code> shows the value without allowing changes, and the field can still be
    focused and copied — which is the difference from <code>disabled</code>, whose value is not even
    submitted. <code>invalid</code> forces the error state for a rule only the server can check;
    everything the browser can check, it checks itself.
  </p>

  <h2 id="limits">Counters and limits</h2>
  <p>
    <code>counter</code> shows the length, and with <code>maxlength</code> shows it as a fraction.
    <code>softLimit</code> turns the limit soft: the reader may type past it, and the field goes
    into error instead of swallowing the keystroke — which is what you want whenever the text being
    written is worth more than the rule.
  </p>
  <DocsCode lang="vue" :code="softCode" />

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>v-model</code></td>
      <td><code>string | number</code></td>
      <td><code>''</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'sm' | 'md' | 'lg'</code></td>
      <td><code>'md'</code></td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'</code></td>
      <td><code>'text'</code></td>
    </tr>
    <tr>
      <td><code>label</code> · <code>hint</code></td>
      <td><code>string</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStart</code> · <code>iconEnd</code></td>
      <td>
        <code>IconSource</code> — becomes a button with a <code>@click:icon-start</code> /
        <code>@click:icon-end</code> listener
      </td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStartLabel</code> · <code>iconEndLabel</code></td>
      <td><code>string</code> — required once the icon is clickable</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>clearable</code> · <code>counter</code> · <code>loading</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>clearVisible</code></td>
      <td><code>boolean</code> — your own answer to "is there anything to clear?"</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>maxlength</code></td>
      <td><code>number</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>softLimit</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td>
        <code>invalid</code> · <code>disabled</code> · <code>readonly</code> · <code>compact</code>
      </td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <p>
    Emits <code>clear</code>, <code>click:icon-start</code> and <code>click:icon-end</code>; slots
    <code>#start</code> and <code>#end</code>; and it exposes <code>focus()</code>,
    <code>select()</code> and <code>el</code>. Every other attribute — <code>name</code>,
    <code>required</code>, <code>autocomplete</code>, <code>pattern</code> — falls through onto the
    real <code>&lt;input&gt;</code>, so forms and validation work exactly as they already do.
  </p>
  <blockquote>
    VTextarea is the same component with the field swapped: it grows with its content through
    <code>field-sizing: content</code>, with no JavaScript measuring anything.
  </blockquote>
</template>
