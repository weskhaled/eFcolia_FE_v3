<script setup lang="ts">
import { Comment } from 'vue'
import type { LoaderOptions } from '@googlemaps/js-api-loader'
import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

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
  showDevices?: Ref<Boolean>
  selectedDevice?: Ref<any>
  dataHistories?: Ref<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ref(({ lat: 24.886, lng: -70.268 })),
  devices: () => ref([]),
  showDevices: () => ref(true),
  selectedDevice: () => ref(null),
  dataHistories: () => ref([]),
})
const emit = defineEmits(['markerClicked'])

const slots = useSlots()
const { t } = useI18n()

const mapRef: Ref<HTMLElement | null> = ref(null)
const compRef: Ref<HTMLElement | null> = ref(null)
const controlRefTOPCENTER: Ref<HTMLElement | null> = ref(null)
const showContentControlRefTOPCENTER = ref(true)

const map: any = ref(null)
const api: any = ref(null)
let infoWindow: any = null
let historyPath: any = null
const historyPaths: any = []
let latlngbounds: any = null
let markers: any = []
let markerClusterer: any = null

const mapOptions: any = reactive({
  center: { lat: 40.7128, lng: -73.85 },
  zoom: 4,
  mapTypeId: null,
  disableDefaultUI: true,
  zoomControl: true,
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
const histories = computed(() => props.showDevices?.value
  ? []
  : props.dataHistories
    ?.filter(p => p.latitude && p.longitude)?.filter((__position, index, selfArray) =>
      selfArray[index]?.latitude !== selfArray[index + 1]?.latitude && selfArray[index]?.longitude !== selfArray[index + 1]?.longitude,
    )
    ?.map(({
      latitude: lat,
      longitude: lng,
      speed,
      localizationdate,
      adress,
      temperature1,
      enginestate,
    }) => {
      const position = {
        lat,
        lng,
        speed,
        localizationdate,
        adress,
        temperature1,
        enginestate,
      }

      return position as google.maps.LatLngLiteral
    }) || [])

watch(() => histories.value, async(val) => {
  if (!map.value)
    return

  historyPaths.forEach(element => element.setMap(null))
  if (markerClusterer)
    markerClusterer.clearMarkers()

  if (!val.length)
    return

  markers = []
  if (val.length > 2) {
    markers.push(
      new google.maps.Marker({
        position: val[0],
        icon: 'https://api.iconify.design/ph:map-pin-duotone.svg?width=25px&height=25px&color=%2300ff00',
        label: {
          text: 'Start',
          className: 'bg-white text-black dark:bg-dark-600 !dark:text-light-300 relative -top-6 p-1 text-sm rounded-sm',
        },
        opacity: 1,
        map: map.value,
      }),
      new google.maps.Marker({
        position: val[val.length - 1],
        icon: 'https://api.iconify.design/ph:map-pin-duotone.svg?width=25px&height=25px&color=%23ff0000',
        label: {
          text: 'End',
          className: 'bg-white text-black dark:bg-dark-600 !dark:text-light-300 relative -top-6 p-1 text-sm rounded-sm',
        },
        opacity: 1,
        map: map.value,
      }))
    for (let i = 0; i < val.length - 1; i++) {
      historyPaths.push(new google.maps.Polyline({
        path: [val[i], val[i + 1]],
        strokeColor: (val[i].speed + val[i + 1].speed) / 2 > 50 ? '#FF0000' : '#00AAFF',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map.value,
      }))
      if (i > 0 && +val[i].speed === 0) {
        const marker = new google.maps.Marker({
          position: val[i],
          icon: 'https://api.iconify.design/openmoji:stop-sign.svg?width=25px&height=25px&color=%2300ff00',
          opacity: 1,
          map: map.value,
        })
        marker.addListener('click', () => {
          infoWindow.setContent(`
          <h3 class="text-xs text-gray-700 mb-1"><span class="text-gray-500">Date: </span>${val[i].localizationdate}</h3>
          <h3 class="text-xs text-gray-700 mb-1"><span class="text-gray-500">Adress: </span>${val[i].adress}</h3>
          <h3 class="text-xs text-gray-700 mb-1"><span class="text-gray-500">Temperature: </span>${val[i].temperature1}</h3>
          <h3 class="text-xs text-gray-700 mb-1"><span class="text-gray-500">EngineState: </span>${val[i].enginestate}</h3>
          <h3 class="text-xs text-gray-700"><span class="text-gray-500">Speed: </span>${val[i].speed}</h3>
        `)
          infoWindow.open({
            anchor: marker,
            map: map.value,
            shouldFocus: false,
          })
        })
        markers.push(marker)
      }
      latlngbounds?.extend(val[i + 1])
    }
    // await nextTick()
    map.value.setCenter(latlngbounds.getCenter())
    map.value.fitBounds(latlngbounds)
  }

  if (!markerClusterer) {
    markerClusterer = new MarkerClusterer({ markers })
    markerClusterer.setMap(map.value)
  }
  else {
    markerClusterer.clearMarkers()
    markerClusterer.addMarkers(markers)
  }
})
watch(() => [props.devices, props.showDevices], ([valDevices, valShowDevices]) => {
  if (!map.value)
    return

  markers.forEach(marker => marker.setMap(null))

  if (!valDevices.length || !valShowDevices) {
    deleteMarkers()
    return
  }

  // Add markers to the map.
  markers = valDevices.map(({ id, latitude: lat, longitude: lng, name, gprsstate: gprsState, selected }) => {
    // selected && (selectedDevice.value = { id, latitude: lat, longitude: lng, name, gprsstate: gprsState, selected })
    const marker = new api.value.Marker({
      position: { lat, lng },
      icon: `https://api.iconify.design/ic:sharp-directions-car.svg?width=25px&height=25px&color=%23${gprsState ? '00aa00' : 'aa0000'}`,
      label: {
        text: `${name}`,
        className: 'bg-white text-black dark:bg-dark-600 !dark:text-light-300 relative -top-6 p-1 text-sm rounded-sm',
      },
      opacity: id === unref(props.selectedDevice)?.id ? 1 : 0.65,
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

  !unref(props.selectedDevice) && centerMapView()

  if (!markerClusterer && valShowDevices) {
    markerClusterer = new MarkerClusterer({ markers })
    markerClusterer.setMap(map.value)
  }
  else {
    reinsertMarkers()
  }
})
const addDrawingManager = () => {
  const drawingManager = new api.value.drawing.DrawingManager({
    drawingMode: null,
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
      icon: 'https://api.iconify.design/carbon:flag-filled.svg?width=25px&height=25px&color=%2300aaff',
      draggable: true,
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
    polylineOptions: {
      editable: true,
      draggable: true,
    },
    rectangleOptions: {
      editable: true,
      draggable: true,
    },
    polygonOptions: {
      editable: true,
      draggable: true,
    },
  })

  drawingManager.setMap(map.value)
}

(async() => {
  await until(mapRef).not.toBeNull()

  await new Loader(LOADER_OPTIONS).load()

  api.value = google.maps
  map.value = new google.maps.Map(mapRef.value as HTMLElement, unref(mapOptions))
  infoWindow = new google.maps.InfoWindow({
    content: 'infoWindow',
    disableAutoPan: true,
  })
  historyPath = new google.maps.Polyline()
  latlngbounds = new google.maps.LatLngBounds()
  mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP
  markerClusterer = new MarkerClusterer({
    map: map.value,
    markers: [],
  })
  deleteMarkers()
  addDrawingManager()
  if (slots.default && slots.default().findIndex(o => o.type !== Comment) !== -1) {
    showContentControlRefTOPCENTER.value = true
    map.value.controls[api.value.ControlPosition.TOP_CENTER].push(controlRefTOPCENTER.value)
  }
})()

// (async() => {
//   await until(map).not.toBeNull()

//   deleteMarkers()
//   addDrawingManager()

//   if (slots.default && slots.default().findIndex(o => o.type !== Comment) !== -1) {
//     showContentControlRefTOPCENTER.value = true
//     map.value.controls[api.value.ControlPosition.TOP_CENTER].push(controlRefTOPCENTER.value)
//   }
//   // map.value.addListener('zoom_changed', reinsertMarkers)
//   // map.value.addListener('zoom_changed', () => markerClusterer && markerClusterer.redraw())
//   // markerClusterer.value = new MarkerClusterer({
//   //   markers: markers(props.devices, map.value),
//   // })
// })()
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
  <div>
    <div ref="mapRef" style="width: 100%; height: 100%" />
    <div v-show="showContentControlRefTOPCENTER" ref="controlRefTOPCENTER">
      <slot v-bind="{ map, api }" name="default" />
    </div>
  </div>
</template>
<style>
#map {
  height: 380px;
}
</style>
