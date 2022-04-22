<script setup lang="ts">
import type { LoaderOptions } from '@googlemaps/js-api-loader'
import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { Button } from 'ant-design-vue'

const GMAPS_KEY = `${import.meta.env.VITE_GMAPS_KEY}`
const LOADER_OPTIONS: LoaderOptions = {
  apiKey: GMAPS_KEY,
  version: 'weekly',
  libraries: ['places', 'drawing'],
}

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
const emit = defineEmits(['markerClicked'])

const { t } = useI18n()

const mapRef: Ref<HTMLElement | null> = ref(null)
const compRef: Ref<HTMLElement | null> = ref(null)

const map: any = ref(null)
const api: any = ref(null)
let infoWindow: any = null
let latlngbounds: any = null
let markers: any = []
let markerClusterer: any = null
const CompA = () => h('div', { calss: 'text-3xl', ref: 'compRef' }, [
  [
    h(Button, { type: 'danger', class: 'ml-1' }, 'asdfasd'),
  ],
])

const mapOptions: any = reactive({
  center: { lat: 40.7128, lng: -73.85 },
  zoom: 4,
  mapTypeId: null,
})
watch(mapOptions, (val) => {
  map.value && map.value.setOptions(val)
})
const deleteMarkers = () => {
  for (let i = 0; i < markers.length; i++)
    markers[i].setMap(null)

  markers = []
}
const reinsertMarkers = () => {
  if (markerClusterer) {
    markerClusterer.clearMarkers()
    markerClusterer.addMarkers(markers)
  }
}
const centerMapView = () => {
  // Center map and adjust Zoom based on the position of all markers.
  if (map.value && markers.length) {
    map.value.setCenter(latlngbounds.getCenter())
    map.value.fitBounds(latlngbounds)
  }
}

watch(() => props.devices, (val) => {
  if (!map.value)
    return
  if (!val.length) {
    deleteMarkers()
    reinsertMarkers()
    return
  }

  let selectedDevice = null
  // Add some markers to the map.
  markers = val.map(({ id, latitude: lat, longitude: lng, name, gprsstate: gprsState, selected }) => {
    selected && (selectedDevice = { id, latitude: lat, longitude: lng, name, gprsstate: gprsState, selected })
    const marker = new google.maps.Marker({
      position: { lat, lng },
      icon: `https://api.iconify.design/ic:sharp-directions-car.svg?width=25px&height=25px&color=%23${gprsState ? '00aa00' : 'aa0000'}`,
      label: {
        text: `${name}`,
        className: 'bg-white relative -top-6 p-1 text-sm rounded-sm',
      },
    })
    latlngbounds.extend(marker.position)
    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    marker.addListener('click', () => {
      // infoWindow.setContent(`${device.label}`)
      // infoWindow.open(map.value, marker)
      emit('markerClicked', id)
    })

    return marker
  })

  !selectedDevice && centerMapView()

  if (!markerClusterer) {
    markerClusterer = new MarkerClusterer({ markers })
    markerClusterer.setMap(map.value)
  }
  else {
    reinsertMarkers()
  }
})
const addDrawingManager = () => {
  const drawingManager = new api.value.drawing.DrawingManager({
    drawingMode: api.value.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: api.value.ControlPosition.TOP_CENTER,
      drawingModes: [
        api.value.drawing.OverlayType.MARKER,
        api.value.drawing.OverlayType.CIRCLE,
        api.value.drawing.OverlayType.POLYGON,
        api.value.drawing.OverlayType.POLYLINE,
        api.value.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    },
    circleOptions: {
      fillColor: '#ffff00',
      fillOpacity: 0.5,
      strokeWeight: 2,
      clickable: false,
      editable: true,
      draggable: true,
      zIndex: 1,
    },
  })

  drawingManager.setMap(map.value)
}
  ; (async() => {
  await until(mapRef).not.toBeNull()

  await new Loader(LOADER_OPTIONS).load()

  api.value = google.maps
  map.value = new google.maps.Map(mapRef.value as HTMLElement, unref(mapOptions))
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  })
  latlngbounds = new google.maps.LatLngBounds()
  mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP
})()

; (async() => {
  await until(map).not.toBeNull()

  markers = []
  addDrawingManager()
  // map.value.addListener('zoom_changed', reinsertMarkers)
  // map.value.addListener('zoom_changed', () => markerClusterer && markerClusterer.redraw())
  // markerCluster.value = new MarkerClusterer({
  //   markers: markers(props.devices, map.value),
  // })
})()
const addRectangle = (bounds = {
  north: 44.599,
  south: 44.49,
  east: -78.443,
  west: -78.649,
}) => {
  // Define a rectangle and set its editable property to true.
  const rectangle = new api.value.Rectangle({
    bounds,
    editable: true,
  })

  rectangle.setMap(map.value)
}

defineExpose({ map, api, mapOptions, centerMapView, addRectangle })
</script>

<template>
  <div ref="mapRef" style="width: 100%; height: 100%" />
</template>
<style>
#map {
  height: 380px;
}

div[title="Stop drawing"] {
  content: url(https://cdn4.iconfinder.com/data/icons/whsr-january-flaticon-set/128/compass.png) !important;
  height: 28px;
  width: 28px;
  cursor: pointer;
}

div[title="Draw a circle"] {
  content: url(http://www.pngmart.com/files/4/Moon-PNG-Transparent.png) !important;
  height: 28px;
  width: 28px;
  cursor: pointer;
}

div[title="Draw a rectangle"] {
  content: url(https://www.shareicon.net/data/32x32/2015/07/04/64183_rectangle_256x256.png) !important;
  height: 28px;
  width: 28px;
  cursor: pointer;
}
</style>
