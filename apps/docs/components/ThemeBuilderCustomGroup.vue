<script setup lang="ts">
/**
 * One colour group in the custom mode: a base colour per scheme, the contrast pairs that fall
 * short, and every role of the group for setting by hand.
 */
import { VAccordion, VAccordionItem, VChip, VColorInput, VTypography } from 'vectis-ui'
import { warning } from 'vectis-ui/icons'

import { formatOklch } from '~/theme-builder/color'
import {
  GROUP_ROLES,
  SCHEMES,
  customGroupColors,
  type ColorGroup,
  type ContrastIssue,
  type Scheme,
} from '~/theme-builder/model'

const props = defineProps<{
  group: ColorGroup
  /** The contrast pairs of this group below WCAG AA. */
  issues: ContrastIssue[]
}>()

const { t } = useI18n()
const { config } = useThemeBuilder()

const schemeLabel = (scheme: Scheme) => t(`themeBuilder.${scheme}`)

function base(scheme: Scheme) {
  return config.value.colors.custom[props.group][scheme].base
}
function setBase(scheme: Scheme, value: string | null) {
  if (!value) return
  config.value.colors.custom[props.group][scheme].base = value
  config.value.colors.edited = true
}

const derived = computed(
  () =>
    Object.fromEntries(
      SCHEMES.map((scheme) => [scheme, customGroupColors(config.value, props.group, scheme)]),
    ) as Record<Scheme, Record<string, { l: number; c: number; h: number }>>,
)

function override(scheme: Scheme, role: string) {
  return config.value.colors.custom[props.group][scheme].overrides[role] ?? null
}
function setOverride(scheme: Scheme, role: string, value: string | null) {
  const overrides = config.value.colors.custom[props.group][scheme].overrides
  if (value) overrides[role] = value
  else delete overrides[role]
  config.value.colors.edited = true
}

const issueText = (issue: ContrastIssue) =>
  `${schemeLabel(issue.scheme)} · ${issue.foreground} / ${issue.background} ` +
  `${issue.ratio.toFixed(1)}:1 (${issue.required}:1 ${t('themeBuilder.contrastNeeded')})`
</script>

<template>
  <div class="vd-tb-group">
    <VTypography variant="label" as="h4" class="vd-tb-group-title">
      {{ t(`themeBuilder.groups.${group}`) }}
    </VTypography>

    <div class="vd-tb-pair">
      <VColorInput
        v-for="scheme in SCHEMES"
        :key="scheme"
        :model-value="base(scheme)"
        format="oklch"
        size="sm"
        :label="`${t('themeBuilder.baseColor')} · ${schemeLabel(scheme)}`"
        @update:model-value="setBase(scheme, $event)"
      />
    </div>

    <ul v-if="issues.length > 0" class="vd-tb-issues">
      <li v-for="issue in issues" :key="`${issue.scheme}-${issue.foreground}-${issue.background}`">
        <VChip tone="warning" size="xs" :icon-start="warning">{{ issueText(issue) }}</VChip>
      </li>
    </ul>

    <VAccordion compact>
      <VAccordionItem :title="t('themeBuilder.advanced')">
        <div class="vd-tb-stack">
          <VTypography variant="caption" tone="muted">{{
            t('themeBuilder.advancedHint')
          }}</VTypography>
          <div v-for="role in GROUP_ROLES[group]" :key="role" class="vd-tb-pair">
            <VColorInput
              v-for="scheme in SCHEMES"
              :key="scheme"
              :model-value="override(scheme, role)"
              format="oklch"
              size="sm"
              clearable
              :label="`${role} · ${schemeLabel(scheme)}`"
              :placeholder="formatOklch(derived[scheme][role]!)"
              @update:model-value="setOverride(scheme, role, $event)"
            />
          </div>
        </div>
      </VAccordionItem>
    </VAccordion>
  </div>
</template>
