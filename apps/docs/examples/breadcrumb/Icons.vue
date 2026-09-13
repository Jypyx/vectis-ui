<script setup lang="ts">
import { VBreadcrumb } from 'vectis-ui'
import {
  cloud_upload as cloudUpload,
  picture_as_pdf as pictureAsPdf,
  table_chart as tableChart,
} from 'vectis-ui/icons'

const items = [
  { label: 'Uploads', href: '/app/files', icon: cloudUpload },
  { label: 'Reports', href: '/app/files/reports', icon: tableChart },
  { label: 'Third quarter', href: '/app/files/reports/q3', icon: pictureAsPdf },
]
</script>

<template>
  <VBreadcrumb :items="items" current-path="/app/files/reports/q3" />
</template>
