<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import frFR from 'ant-design-vue/lib/locale/fr_FR.js'
import enUS from 'ant-design-vue/lib/locale/en_US.js'

import { userLang } from '~/common/stores'
import { isDark } from '~/common/composables'

const isMounted = useMounted()

const el: Ref<any> = ref(null)
const color = useCssVar('--color-scheme', el, { initialValue: 'light' })
dayjs.locale('en')
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Efcolia',
  meta: [
    { name: 'description', content: 'Efcolia' },
  ],
})
const {
  load,
  unload,
} = useStyleTag('@import \'https://unpkg.com/ant-design-vue@3.2.11/dist/antd.dark.css\';', { immediate: false })

watch(isDark, (value) => {
  value ? load() : unload()
}, {
  immediate: true,
})
const { locale } = useI18n()

watch(() => locale.value, (val) => {
  userLang.value = val
  val === 'fr' && dayjs.locale(val)
})
const colorState = reactive({
  primaryColor: '#ff0000',
  errorColor: '#ff4d4f',
  warningColor: '#faad14',
  successColor: '#52c41a',
  infoColor: '#1890ff',
})
onMounted(() => {
  el.value = document.documentElement
})
</script>

<template>
  <a-config-provider v-if="isMounted"  :theme="colorState" :locale="locale === 'fr' ? frFR : enUS">
    <router-view />
  </a-config-provider>
</template>
