<script setup lang="ts">
/** The preview's settings form: every input, choice and confirmation control. */
import {
  VButton,
  VCard,
  VCheckbox,
  VColorInput,
  VCombobox,
  VDateInput,
  VDialogAlert,
  VField,
  VFieldset,
  VFileInput,
  VInput,
  VInputGroup,
  VInputOTP,
  VNumberInput,
  VRadio,
  VRating,
  VSelect,
  VSlider,
  VSwitch,
  VTextarea,
  VTimeInput,
  VToggle,
  VToggleItem,
  VTypography,
  snackbar,
} from 'vectis-ui'

const name = ref('Atlas')
const description = ref('Customer portal and billing.')
const region = ref('eu-west')
const regions = [
  { value: 'eu-west', label: 'Europe (Paris)' },
  { value: 'us-east', label: 'United States (Virginia)' },
  { value: 'ap-south', label: 'Asia Pacific (Singapore)' },
]
const owner = ref('grace')
const people = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'alan', label: 'Alan Turing' },
]
const budget = ref<number | null>(1200)
const launch = ref<string | null>('2026-11-02')
const standup = ref<string | null>('09:30')
const brand = ref<string | null>('#4f46e5')
const files = ref<File[]>([])
const protocol = ref('https')
const protocols = [
  { value: 'https', label: 'https://' },
  { value: 'http', label: 'http://' },
]
const domain = ref('atlas.example.com')
const visibility = ref('team')
const alerts = ref(true)
const digest = ref(false)
const threshold = ref(80)
const satisfaction = ref<number | null>(4)
const view = ref('board')
const code = ref('')

const deleteOpen = ref(false)

function save() {
  snackbar({ message: 'Settings saved.', actionText: 'Undo', action: () => {} })
}
</script>

<template>
  <VCard title="Project settings" subtitle="Atlas · Production">
    <div class="tp-form">
      <VField v-slot="{ fieldProps }" label="Name" hint="Shown to everyone in the workspace.">
        <VInput v-bind="fieldProps" v-model="name" />
      </VField>
      <VSelect v-model="region" :options="regions" label="Region" />
      <VTextarea v-model="description" label="Description" :rows="3" class="tp-wide" />
      <VCombobox v-model="owner" :options="people" label="Owner" />
      <VNumberInput v-model="budget" label="Monthly budget (€)" :min="0" :step="100" />
      <VDateInput v-model="launch" label="Launch date" show-picker />
      <VTimeInput v-model="standup" label="Daily standup" />
      <VInputGroup label="Domain">
        <VSelect v-model="protocol" :options="protocols" aria-label="Protocol" />
        <VInput v-model="domain" aria-label="Host" />
      </VInputGroup>
      <VColorInput v-model="brand" label="Brand colour" />
      <VFileInput v-model="files" label="Logo" class="tp-wide" />

      <VFieldset legend="Visibility" hint="Who can open this project.">
        <VRadio v-model="visibility" name="visibility" value="private" label="Only me" />
        <VRadio v-model="visibility" name="visibility" value="team" label="My team" />
        <VRadio
          v-model="visibility"
          name="visibility"
          value="public"
          label="Anyone with the link"
        />
      </VFieldset>

      <div class="tp-choices">
        <VSwitch v-model="alerts">Deployment alerts</VSwitch>
        <VCheckbox v-model="digest">Weekly digest by email</VCheckbox>
        <VToggle v-model="view" label="Default view" mandatory>
          <VToggleItem value="list" label="List" />
          <VToggleItem value="board" label="Board" />
          <VToggleItem value="calendar" label="Calendar" />
        </VToggle>
      </div>

      <VSlider v-model="threshold" label="Budget alert at (%)" />
      <VRating v-model="satisfaction" label="How is Orbit working for you?" />
      <VInputOTP v-model="code" :length="6" label="Confirmation code" class="tp-wide" />
    </div>

    <template #footer>
      <div class="tp-footer">
        <VDialogAlert
          v-model:open="deleteOpen"
          title="Delete Atlas?"
          subtitle="Its deployments and history go with it."
        >
          <template #trigger="{ triggerProps }">
            <VButton v-bind="triggerProps" variant="ghost" tone="danger" icon-start="delete">
              Delete project
            </VButton>
          </template>
          <VTypography>This cannot be undone.</VTypography>
          <template #footer>
            <VButton variant="ghost" tone="neutral" @click="deleteOpen = false">Cancel</VButton>
            <VButton tone="danger" @click="deleteOpen = false">Delete</VButton>
          </template>
        </VDialogAlert>
        <div class="tp-footer-end">
          <VButton variant="outline" tone="neutral">Cancel</VButton>
          <VButton @click="save">Save changes</VButton>
        </div>
      </div>
    </template>
  </VCard>
</template>

<style scoped>
.tp-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--vectis-space-5);
  align-items: start;
}
.tp-wide {
  grid-column: 1 / -1;
}
.tp-choices {
  display: grid;
  gap: var(--vectis-space-3);
  align-content: start;
}
.tp-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--vectis-space-3);
  inline-size: 100%;
}
.tp-footer-end {
  display: flex;
  gap: var(--vectis-space-2);
}
</style>
