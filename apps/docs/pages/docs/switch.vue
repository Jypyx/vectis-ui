<script setup lang="ts">
import { VSwitch } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Switch' })

const reducedMotion = ref(true)
const notes = ref(true)

const basicCode = `<VSwitch v-model="reducedMotion">Respect reduced motion</VSwitch>

<VSwitch v-model="notes" label-position="start" spread>
  Send me release notes
</VSwitch>`
</script>

<template>
  <h1>Switch</h1>
  <p class="vd-lead">
    A setting that takes effect immediately. It is announced with <code>role="switch"</code>, so a
    screen reader says on or off rather than ticked — which is the whole reason it is not a
    checkbox.
  </p>

  <h2 id="the-choice">Switch, or checkbox</h2>
  <p>
    A switch acts at once; a checkbox states an intention that a submit will carry out. If the
    change needs a Save button, it is a checkbox.
  </p>
  <DocsDemo stack>
    <VSwitch v-model="reducedMotion">Respect reduced motion</VSwitch>
    <VSwitch v-model="notes" label-position="start" spread>Send me release notes</VSwitch>
    <VSwitch disabled>Beta channel (unavailable on this plan)</VSwitch>
  </DocsDemo>
  <p>
    <code>spread</code> pushes the label and the switch to opposite ends — the usual shape for a
    settings list, where the switches then line up down one edge.
  </p>
  <DocsCode lang="vue" :code="basicCode" />
  <p>
    The label is the DEFAULT SLOT rather than a prop, which is what lets it hold a link or a piece
    of emphasis; it sits inside the wrapping <code>&lt;label&gt;</code>, so clicking the words
    toggles the switch.
  </p>

  <h2 id="how-it-is-built">How it is built</h2>
  <ul>
    <li>
      A real <code>&lt;input type="checkbox"&gt;</code>, hidden with <code>opacity</code> and never
      with <code>display: none</code>, which would take the input out of the tab order and out of
      the form.
    </li>
    <li>The thumb carries <code>shadow-xs</code> — the only shadow in the forms group.</li>
    <li>
      The track is 40 × 20px from the control table, and there is deliberately no
      <code>size</code> prop: a switch is a fixed piece of chrome, not a control on the scale.
    </li>
    <li>
      Disabled greys out through the colour tokens rather than through opacity, so it stays legible
      on any surface.
    </li>
  </ul>

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>v-model</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>labelPosition</code></td>
      <td><code>'start' | 'end'</code></td>
      <td><code>'end'</code></td>
    </tr>
    <tr>
      <td><code>spread</code></td>
      <td><code>boolean</code> — label and switch to opposite ends</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <p>
    The label is the <code>#default</code> slot. <code>name</code>, <code>required</code>,
    <code>value</code> and every other attribute fall through onto the hidden input, so the switch
    submits with the form like any checkbox.
  </p>
</template>
