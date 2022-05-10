<script setup lang="ts">
import { h } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { CustomControl, GoogleMap, Marker, Polygon } from 'vue3-google-map'

const mapRef = ref(null)
const test = () => h(
  'div',
  Array.from({ length: 2 }).map(() => h('button', { class: 'btn', disabled: !name.value, onClick: () => go() }, name.value || 'test')),
)

const router = useRouter()
const { t } = useI18n()

const center = { lat: 24.886, lng: -70.268 }
const newTriangleCoords = ref([])
const newTriangle: Ref<any> = ref()

onMounted(() => {
  // mapRef.value.addListener('click', (e) => {
  //   console.log(e)
  // })
  // mapRef.value.event.addListener(map, 'click', (event) => {
  //   console.log(event)
  // })
  console.log(mapRef.value.map)
  // mapRef.value.maps.addListener('click', (e) => {
  //   console.log(e)
  // })
})
const dragNewTriangle = (e) => {
  console.log(e)
}
const sayHi = () => alert('Hi!')
const onMapClick = (e) => {
  const lat = e.latLng.lat()
  const lng = e.latLng.lng()
  newTriangleCoords.value.push({ lat, lng })
  const isNew = newTriangleCoords.value.length === 4
  newTriangleCoords.value.length > 3 && (newTriangleCoords.value = [])
  newTriangleCoords.value.length > 3 && (newTriangle.value = undefined)

  isNew && (newTriangle.value = undefined)
  console.log(lat, lng)
  console.log(newTriangleCoords.value)
  console.log(isNew)
  // console.log(newTriangle.value)
  if (newTriangleCoords.value.length > 2) {
    newTriangle.value = {
      paths: unref(newTriangleCoords),
      strokeColor: '#ffffff',
      strokeWeight: 3,
      fillColor: '#7b00ff',
      fillOpacity: 0.6,
      zIndex: 99999,
      editable: true,
      draggable: false,
    }
  }
}
</script>

<template>
  <div class="rounded-xl overflow-hidden">
    <GoogleMap ref="mapRef" api-key="AIzaSyDh1lKIYvM-3KlafyGEBortUn6YhVPTaHw" style="width: 100%; height: 600px" :center="center" :zoom="5" @click="onMapClick">
      <Marker :options="{ position: center }" />
      <Polygon v-if="newTriangle" :options="newTriangle" />
      <CustomControl position="RIGHT_CENTER">
        <button class="custom-btn" @click="sayHi">
          <span class="i-ph-polygon-fill inline-block text-xl text-dark-200" />
        </button>
      </CustomControl>
    </GoogleMap>
  </div>
</template>
<style>
#map {
  height: 380px;
}
.custom-btn {
  box-sizing: border-box;
  background: white;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  border: 0px;
  margin: 10px;
  padding: 0px;
  font-size: 1.25rem;
  text-transform: none;
  appearance: none;
  cursor: pointer;
  user-select: none;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  overflow: hidden;
}
</style>
<route lang="yaml">
meta:
  layout: home
</route>
