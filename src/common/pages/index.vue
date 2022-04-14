<script setup lang="ts">
import { h } from 'vue'
import { get } from '@vueuse/core'
import { GoogleMap, Marker } from 'vue3-google-map'
// import 'leaflet/dist/leaflet.css'
// import { map, marker, tileLayer } from 'leaflet'
import { useUserStore } from '../../hi/stores/user'

const user = useUserStore()
const name = ref(user.savedName)
const testRef: any = ref()
const test = () => h(
  'div',
  Array.from({ length: 2 }).map(() => h('button', { class: 'btn', disabled: !name.value, onClick: () => go() }, name.value || 'test')),
)

const router = useRouter()
const { t } = useI18n()

const go = () => {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}
const onMapClick = (e) => {
  console.log(e)
}
const center = { lat: 40.689247, lng: -74.044502 }
</script>

<template>
  <!-- <component
    :is="test"
    ref="testRef"
  /> -->
  <div>
    <div text-4xl>
      <div i-carbon-campsite inline-block />
    </div>
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse" target="_blank">
        Vitesse</a>
    </p>
    <p>
      <em text-sm opacity-75>{{ t('intro.desc') }}</em>
    </p>

    <div py-4 />

    <input
      id="input"
      v-model="name"
      :placeholder="t('intro.whats-your-name')"
      :aria-label="t('intro.whats-your-name')"
      type="text"
      autocomplete="false"
      p="x4 y2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
      @keydown.enter="go"
    >
    <label class="hidden" for="input">{{ t('intro.whats-your-name') }}</label>

    <div>
      <button btn m-3 text-sm :disabled="!name" @click="go">
        {{ t('button.go') }}
      </button>
    </div>
  </div>
</template>
<style>
#map {
  height: 380px;
}
.leaflet-popup-content {
  /* @apply !w-auto; */
}
</style>
<route lang="yaml">
meta:
  layout: home
</route>
