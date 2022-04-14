<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import frFR from 'ant-design-vue/es/locale/fr_FR.js'
import enUS from 'ant-design-vue/es/locale/en_US.js'

import { userLang } from '~/common/stores'

dayjs.locale('en')
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Vitesse',
  meta: [
    { name: 'description', content: 'Opinionated Vite Starter Template' },
  ],
})

const { locale } = useI18n()

watch(() => locale.value, (val) => {
  userLang.value = val
  val === 'fr' && dayjs.locale(val)
})
</script>

<template>
  <a-config-provider :locale="locale === 'fr' ? frFR : enUS">
    <router-view />
  </a-config-provider>
</template>
