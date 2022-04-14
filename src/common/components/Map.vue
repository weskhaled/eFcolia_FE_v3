<script setup lang="ts">
import { h } from 'vue'
import { Button } from 'ant-design-vue'
// import { useLeaflet } from '~/common/composables'
import leaflet from 'leaflet'
const props = defineProps<{
  name: string
}>()

const Comp = defineComponent({
  props: ['nameValue'],
  setup(props) {
    const isActive = ref(true)
    return {
      props,
      isActive,
    }
  },
  render() {
    return h('div', {}, `wes ${this.isActive} ${this.nameValue}`)
  },
})

const { t } = useI18n()
const mapbox: any = ref()
const compRef: any = ref()

const CompA = () => h('h1', { calss: 'text-3xl' }, props.name ? props.name : 'test', [
  [
    h(Button, { type: 'danger', class: 'ml-1' }, 'asdfasd'),
  ],
])

const onMapClick = async(e) => {
  console.log(e)
  const popup = L.popup()
  popup
    .setLatLng(e.latlng)
    .setContent(compRef.value)
    // .setContent(ins.$el)
    // .setContent(CompA.name)
    // .setContent('html')
    .openOn(mapbox.value)
}
onMounted(async() => {
  const { map, marker, tileLayer } = leaflet
  mapbox.value = map('map').setView([46.05, 11.05], 5)
  tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, '
      + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
  }).addTo(mapbox.value)
  // use a mix of renderers
  const customPane = mapbox.value.createPane('customPane')
  // const canvasRenderer = L.canvas({ pane: 'customPane' })
  customPane.style.zIndex = '399' // put just behind the standard overlay pane which is at 400
  marker([50, 14]).addTo(mapbox.value)

  marker([53, 20]).addTo(mapbox.value)
  mapbox.value.on('click', onMapClick)
})

</script>

<template>
  <Teleport to="body">
    <div class="hidden">
      <comp-a ref="compRef" />
    </div>
  </Teleport>
  <Comp />
  <a-button type="primary">
    Primary Button
  </a-button>
  <div id="map" class="rounded-xl" />
</template>
<style>
#map {
  height: 380px;
}
</style>
