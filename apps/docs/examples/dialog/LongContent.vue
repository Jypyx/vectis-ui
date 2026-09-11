<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDialog, VTypography } from 'vectis-ui'

const open = ref(false)

const CLAUSES = [
  'The service is provided as it stands, and the clauses below say what that means in practice. Read them once: they are short, and every one of them is there because someone asked.',
  'An account belongs to one person. Sharing credentials is what makes an audit trail useless, and an audit trail is the only thing that can tell us who changed what when something goes wrong.',
  'Content you upload stays yours. We store it, serve it back to you, and nothing else happens to it: it is not read, not indexed for anyone but you, and never used to train anything.',
  'Backups are kept for thirty days. After that a deletion is final and cannot be appealed, so export anything you may want before you remove it rather than after.',
  'Usage limits are published on the pricing page and apply per organisation rather than per seat. Going past one slows requests down; it never drops them.',
  'We announce a breaking change at least ninety days before it ships, by email to every administrator and in the changelog. A deprecation keeps working for the whole of that period.',
  'Support is answered within one working day, Monday to Friday, in English and in French. An incident affecting availability is answered whatever the day.',
  'Either side may end the agreement with thirty days of notice, in writing. Ending it does not delete anything: the export stays available for the thirty days that follow.',
  'A refund covers the unused remainder of a period, counted in whole days, and is paid back by the route the payment came in on.',
  'Availability is measured monthly and published. A month below the figure we commit to is credited without your having to ask for it.',
  'Personal data is processed in the European Union. The list of subprocessors is public, and a new one is announced thirty days before it is used.',
  'Security reports are welcome at the address on the security page. We answer within two working days and never take action against a reporter acting in good faith.',
  'An account inactive for two years is closed after three warnings sent a month apart, the last of them naming the date.',
  'The API is versioned in its path. A version stays supported for at least eighteen months after its successor ships.',
  'Rate limits are returned in the response headers rather than documented in one place and forgotten. What the headers say is what applies.',
  'You may resell what you build on the service. You may not resell the service itself as if it were yours.',
  'Trademarks stay with whoever owns them. Using our name to say what your product integrates with is fine; using it as if it were your own is not.',
  'A price change applies at the next renewal and never in the middle of a period, with sixty days of notice.',
  'Taxes are added where they are owed, worked out from the billing address you give us.',
  'An invoice disputed in writing within sixty days is looked at; past that it is taken as accepted.',
  'These terms are governed by French law, and disputes that cannot be settled between us are heard in Paris.',
  'A clause a court sets aside is removed and the rest stands, rather than the whole agreement falling with it.',
  'Nothing here removes a right the law gives you, whichever of the two says otherwise.',
  'The version that applies is the one published on the day you agreed to it, and every version is kept and dated.',
]
</script>

<template>
  <VDialog v-model:open="open" title="Terms of service" subtitle="Scroll to read all of it.">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Read the terms</VButton>
    </template>

    <VTypography v-for="(clause, index) in CLAUSES" :key="clause" class="clause">
      {{ index + 1 }}. {{ clause }}
    </VTypography>

    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="open = false">Decline</VButton>
      <VButton @click="open = false">Accept</VButton>
    </template>
  </VDialog>
</template>

<style scoped>
.clause {
  margin-block-end: var(--vectis-space-3);
}
</style>
