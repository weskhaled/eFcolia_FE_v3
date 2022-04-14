<script setup lang="ts">
import { CustomControl, GoogleMap, Marker, Polygon } from 'vue3-google-map'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import trees from './trees.json'

const GMAPS_KEY = `${import.meta.env.VITE_GMAPS_KEY}`

interface Position {
  lat: number
  lng: number
}

interface Props {
  center?: Ref<Position>
  devices?: Ref<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ref(({ lat: 24.886, lng: -70.268 })),
  devices: () => ref([]),
})

const { t } = useI18n()

const mapRef = ref(null)
const center = { lat: 24.886, lng: -70.268 }
const newTriangleCoords = ref([])
const markers = ref([])
const newTriangle: Ref<any> = ref()
let markerCluster: any = null
async function deleteMarkers() {
  if (markerCluster && markers.value.length)
    await markerCluster.clearMarkers()

  for (let i = 0; i < markers.value.length; i++)
    markers.value[i].setMap(null)

  markers.value = []
}
const reinsertMarkers = () => {
  if (markerCluster) {
    markerCluster.clearMarkers()
    markerCluster.addMarkers(unref(markers))
  }
}

watch(() => mapRef.value?.ready, async(val) => {
  if (!val) return

  await nextTick()
  console.log(mapRef.value)

  markers.value = trees.map(
    ({ geometry }) =>
      new mapRef.value.api.Marker({
        position: {
          lat: geometry.coordinates[1],
          lng: geometry.coordinates[0],
        },
      }),
  )

  markerCluster = new MarkerClusterer({
    markers: unref(markers),
  })

  markerCluster.setMap(unref(mapRef)?.map)
  unref(mapRef)?.map.addListener('zoom_changed', reinsertMarkers)
})

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
  <GoogleMap
    ref="mapRef"
    :api-key="GMAPS_KEY"
    style="width: 100%; height: 100%"
    :center="center"
    :zoom="5"
    @click="onMapClick"
  >
    <Polygon v-if="newTriangle" :options="newTriangle" />
    <CustomControl position="LEFT_TOP">
      <slot name="leftTop" />
    </CustomControl>
  </GoogleMap>
</template>
<style>
#map {
  height: 380px;
}
</style>
