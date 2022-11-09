<script setup lang="ts">
import dayjs from 'dayjs'
import { Modal, message } from 'ant-design-vue'
import { TransitionPresets, clamp, useTransition } from '@vueuse/core'
import { devices, devicesCount, devicesLoading, mdAndLarger, selectedClient, selectedDevice, sideCollapsed, treeDataClients } from '~/common/stores'
import { api as apiServices, urlSearchParams } from '~/common/composables'

const router = useRouter()
const { t } = useI18n()
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen(document.body)

const { coords, isSupported } = useGeolocation()
const [asideCollapsed, toggleAsideCollapsed] = useToggle()

const visibleDeviceFormModal = ref(false)
const visibleDeviceReportingModal = ref(false)
const deviceReportingDuration = ref('1day')
const selectedDeviceForReporting = ref(null)
const handleMapTools = ref(null)
const interval = ref(50000)
const activeKeyDeviceDetails = ref('')
const showDeviceDetails = ref(false)
const devicetypes = ref([])
const simcards = ref([])

const baseNumber = computed(() => showDeviceDetails.value && selectedDevice.value ? 100 : 0)
const transitionNumber = useTransition(baseNumber, {
  duration: 200,
  transition: TransitionPresets.easeInOut,
})

const deviceDetailsDateRange = ref<[Dayjs, Dayjs]>([dayjs(new Date()), dayjs(new Date())])
const dataHistories = ref(null)
const showDevicesInMap = ref(true)

const devicesListRef = ref<HTMLElement | any>(null)
const gmapRef = ref(null)
const mapToolsContainerRef = ref(null)
const mapToolsRef = ref(null)
const { left, right, top, bottom } = useElementBounding(mapToolsContainerRef)
const { width, height } = useElementBounding(handleMapTools)
const { x, y } = useDraggable(handleMapTools, {
  initialValue: { x: 10, y: 10 },
})

const restrictedX = computed(() =>
  clamp(left.value, x.value, right.value - width.value),
)
const restrictedY = computed(() =>
  clamp(top.value - 2, y.value, bottom.value - height.value),
)

const { pause, resume, isActive } = useIntervalFn(async() => {
  if (!selectedClient.value)
    return
  const { data } = await apiServices(`/api/device/synchro/${selectedClient.value}`).get().json()

  const devicesData: any = unref(data)
  if (devicesData)
    devices.value = Array.from([...devices.value, ...devicesData].filter(d => d).reduce((p, c) => p.set(c.id, c), new Map()).values())
}, interval)

const markerClicked = (deviceId) => {
  devices.value.filter(d => d.id !== deviceId).map(d => d.selected = false)
  const device = devices.value.find(d => d.id === deviceId)
  device && (device.selected = !device.selected)
  if (device && device.selected) {
    if (gmapRef.value) {
      gmapRef.value.mapOptions.center = { lat: device.latitude, lng: device.longitude }
      gmapRef.value.mapOptions.zoom = 21
    }
    const indexOfDevice = devices.value.findIndex(d => d.id === deviceId)
    devicesListRef.value?.scrollTo(indexOfDevice)
    selectedDevice.value = device
    if (sideCollapsed.value && showDeviceDetails.value)
      showDeviceDetails.value = false
  }
  else {
    gmapRef.value && gmapRef.value?.centerMapView()
    selectedDevice.value = null
    showDeviceDetails.value = false
  }
}

const onLoadMore = async(refresh = false) => {
  pause()
  const length = devices.value.length
  if (length < devicesCount.value - 1 || refresh) {
    devicesLoading.value = true
    const { data } = await apiServices(`api/device/byClientId/${selectedClient.value}?skip=${refresh ? ~~Math.max(0, length - 20) : length}`).get().json()

    const devicesData: any = unref(data)
    if (devicesData) {
      devices.value = Array.from([...devices.value, ...devicesData.listDevice].filter(d => d && d.id).reduce((p, c) => p.set(c.id, c), new Map()).values())
      devicesCount.value = devicesData.count
    }
    devicesLoading.value = false
  }
  resume()
}

const onSearchDevice = async(term: string) => {
  pause()
  devicesLoading.value = true
  if (term.length > 3) {
    try {
      const { data } = await apiServices(`api/device/byClientId/${selectedClient.value}/${term}`).get().json()
      const devicesData: any = unref(data)
      devices.value = devicesData
      devicesCount.value = devicesData.length
      devicesListRef.value?.containerProps?.ref?.value.scrollTo(0, 0)
      devicesLoading.value = false
    }
    catch (error) {
      console.log(error)
    }
  }
  else {
    const { data } = await apiServices(`api/device/byClientId/${selectedClient.value}?skip=0`).get().json()

    const devicesData: any = unref(data)
    if (devicesData) {
      devices.value = Array.from([...devices.value, ...devicesData.listDevice].reduce((p, c) => p.set(c.id, c), new Map()).values())
      devicesCount.value = devicesData.count
    }
  }
  devicesLoading.value = false
  resume()
}

watch([showDeviceDetails, activeKeyDeviceDetails], ([valShowDeviceDetails, valActiveKeyDeviceDetails]) => {
  urlSearchParams.showDeviceDetails = valShowDeviceDetails || null
  urlSearchParams.activeKeyDeviceDetails = valActiveKeyDeviceDetails || null
})

watch([selectedDevice, showDeviceDetails, deviceDetailsDateRange], async() => {
  urlSearchParams.deviceId = selectedDevice.value?.id || null

  const dateRange = unref(deviceDetailsDateRange)
  let from = null
  let to = null
  if (dateRange && dateRange?.length > 1) {
    from = dateRange[0].format('YYYY-MM-DD 00:00:00')
    to = dateRange[1].format('YYYY-MM-DD 23:59:59')
  }
  if (selectedDevice.value && showDeviceDetails.value) {
    pause()
    showDevicesInMap.value = false
    dataHistories.value = null
    const { data } = await apiServices(`/api/history/${selectedDevice.value.id}?from=${from}&to=${to}`).get().json()

    data.value && (dataHistories.value = data.value)
  }
  else if (!showDeviceDetails.value) {
    resume()
    showDevicesInMap.value = true
    dataHistories.value = null
  }
})

watch(selectedClient, async(val) => {
  if (!val)
    return

  urlSearchParams.clientId = val || null

  if (devicesListRef.value) {
    const { containerProps } = unref(devicesListRef)
    containerProps?.ref?.value?.scroll(0, 0)
  }
  devicesLoading.value = true
  showDeviceDetails.value = false
  selectedDevice.value = null
  const { data } = await apiServices(`api/device/byClientId/${val}?skip=0`).get().json()
  const devicesData: any = unref(data)
  if (devicesData) {
    devices.value = devicesData.listDevice
    devicesCount.value = devicesData.count
  }
  if (urlSearchParams.deviceId) {
    // const { data: dataDevice } = await service.get(`/api/device/byClientId/${val}/${+urlSearchParams.deviceId}`)
    // console.log(dataDevice)
    const findedDevice = devices.value.find(d => +d.id === +urlSearchParams.deviceId)
    await nextTick()
    if (findedDevice) {
      findedDevice.selected = true

      const indexOfDevice = devices.value.findIndex(d => d.id === findedDevice.id)
      devicesListRef.value?.scrollTo(indexOfDevice)
      selectedDevice.value = findedDevice
      useTimeoutFn(() => {
        urlSearchParams.activeKeyDeviceDetails && (activeKeyDeviceDetails.value = urlSearchParams.activeKeyDeviceDetails)
        showDeviceDetails.value = !!urlSearchParams.showDeviceDetails

        if (gmapRef.value) {
          gmapRef.value.mapOptions.center = { lat: findedDevice.latitude, lng: findedDevice.longitude }
          gmapRef.value.mapOptions.zoom = 21
        }
      }, 500)
    }
  }

  devicesLoading.value = false
  apiServices('/api/deviceType').get().json().then(({ data }) => devicetypes.value = data.value || [])
  apiServices(`/api/simcard/${selectedClient.value}`).get().json().then(({ data }) => simcards.value = data.value || [])
}, { immediate: true })

const deviceClicked = (deviceCard) => {
  devices.value.filter(d => d.id !== deviceCard.id).map(d => d.selected = false)
  const device = devices.value.find(d => d.id === deviceCard.id)
  // device && (device.selected = !device.selected)
  if (device) {
    if (gmapRef.value) {
      if (device.selected) {
        device.selected = false
        gmapRef.value?.centerMapView()
        selectedDevice.value = null
      }
      else {
        device.selected = true
        const { latitude: lat, longitude: lng } = device
        if (lat && lng) {
          gmapRef.value.mapOptions.center = { lat: device.latitude, lng: device.longitude }
          gmapRef.value.mapOptions.zoom = 21
          selectedDevice.value = device
        }
      }
    }
  }
}

const deleteDevice = (device) => {
  const { id: deviceId, name } = device
  const deviceIndex = devices.value.findIndex(d => d.id === deviceId)

  Modal.confirm({
    title: h('span', ['Do you want to delete these items? ', h('br'), h('span', { style: 'font-weight: 100;' }, name)]),
    icon: h('span', { class: 'i-ant-design-exclamation-circle-outlined anticon mr-1' }),
    content: 'When clicked the OK button, this device will removed',
    onOk() {
      pause()
      return apiServices(`/api/device/${deviceId}`, { immediate: false }).delete().execute().then(() => deviceIndex && (delete devices.value[deviceIndex])).catch(error => message.error(error)).finally(() => { onLoadMore(true); resume() })
    },
    cancelText: 'Cancel',
    onCancel() {
    },
  })
}

const exportDeviceReporting = async() => {
  const { data, error } = await apiServices(`/api/rapport/${selectedDeviceForReporting.value}/${deviceReportingDuration.value}`).get().json()

  if (data?.value?.url)
    window && window.open(`${data.value.url}`, '_blank')?.focus()

  else if (error.value)
    message.error(`${error.value}`)

  visibleDeviceReportingModal.value = false
}

const addOrUpdateDevice = async(formData: any) => {
  if (formData.id !== null) {
    const { error, statusCode } = await apiServices('/api/device').put(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Device: ${formData.name} Updated`)
  }

  else {
    delete formData.id
    const { error, statusCode } = await apiServices('/api/device').post(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Device: ${formData.name} Added`)
  }

  visibleDeviceFormModal.value = false
  onLoadMore(true)
}
</script>

<template>
  <div class="flex w-full relative !flex-col-reverse !md:flex-row p-0 min-h-55">
    <a-layout-sider
      v-model:collapsed="sideCollapsed" class="!md:max-h-full bg-white dark:bg-blue-gray-800"
      :class="asideCollapsed ? '!max-h-50px' : '!max-h-1/2'"
      :width="mdAndLarger ? (showDeviceDetails && selectedDevice ? 'calc(60% - 60px)' : 370) : '100%'" :trigger="null"
      :collapsible="mdAndLarger" :collapsed-width="!mdAndLarger ? '100%' : 80"
    >
      <div class="p-2 flex relative items-center !h-auto z-10 shadow-sm bg-light-300 dark:bg-blue-gray-900">
        <template v-if="sideCollapsed">
          <a-button
            class="flex items-center justify-center mx-auto" type="primary"
            @click="() => (sideCollapsed = !sideCollapsed)"
          >
            <template #icon>
              <span
                :class="sideCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
                class="anticon block text-base"
              />
            </template>
          </a-button>
        </template>
        <template v-else>
          <div v-if="selectedDevice && showDeviceDetails" class="flex items-center px-1 mr-auto">
            <a-tooltip>
              <template #title>
                <span>{{ t('common.back') }}</span>
              </template>
              <a-button
                type="text" class="flex items-center justify-center mr-1" @click="() => {
                  showDeviceDetails = false
                }"
              >
                <template #icon>
                  <span class="i-carbon-arrow-left anticon block text-blue" />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip>
              <template #title>
                <span>{{ selectedDevice?.name }}</span>
              </template>
              <span class="text-md dark:text-light-400">{{ `${selectedDevice?.name}`.slice(0, 20) }}{{
                `${selectedDevice.name}`.length > 20 ? '...' : null
              }}</span>
            </a-tooltip>
          </div>
          <h3
            v-else-if="!showDeviceDetails"
            class="text-gray-800 dark:text-light-400 text-base leading-8 my-auto ml-0 mr-auto"
          >
            <span v-if="devices.length" class="text-sm leading-15px">{{ devices.length }}/{{ devicesCount }} {{
              t('common.devices.devices')
            }}</span>
            <span v-else class="text-sm leading-15px dark:text-light-400">{{ t('common.devices.notFound') }}</span>
          </h3>
          <div class="flex">
            <a-button
              v-if="!mdAndLarger" class="flex items-center justify-center flex-grow-0 mr-0" type="primary"
              @click="toggleAsideCollapsed()"
            >
              <template #icon>
                <span
                  :class="asideCollapsed ? 'i-ant-design-arrow-up-outlined' : 'i-ant-design-arrow-down-outlined'"
                  class="anticon block text-white"
                />
              </template>
            </a-button>
            <a-button
              v-if="mdAndLarger" class="flex items-center justify-center mx-auto flex-grow-0 ml-2"
              type="primary" @click="() => sideCollapsed = !sideCollapsed"
            >
              <template #icon>
                <span
                  :class="sideCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
                  class="anticon block text-base"
                />
              </template>
            </a-button>
          </div>
        </template>
      </div>
      <div class="relative z-9 flex flex-nowrap overflow-hidden">
        <div class="block w-full top-0" :style="{ transform: `translateX(-${transitionNumber}%)` }">
          <DevicesList
            ref="devicesListRef" v-model:devices="devices" v-model:devices-count="devicesCount"
            v-model:devices-loading="devicesLoading" @on-search-device="onSearchDevice" @device-clicked="deviceClicked"
            @on-load-more="onLoadMore" @show-details="(device) => {
              selectedDevice = device;
              showDeviceDetails = true;
              urlSearchParams.deviceId = selectedDevice.value?.id || '';
              activeKeyDeviceDetails = 'details';
            }" @show-history="(device) => {
              selectedDevice = device;
              showDeviceDetails = true;
              activeKeyDeviceDetails = 'histories'
            }" @update-device="(device) => {
              selectedDevice = device;
              visibleDeviceFormModal = true;
            }" @add-new-device="() => {
              selectedDevice = null;
              visibleDeviceFormModal = true;
            }" @delete-device="deleteDevice" @device-reporting="(device) => {
              selectedDeviceForReporting = device.id;
              visibleDeviceReportingModal = true;
            }"
          />
        </div>
        <div
          class="block w-full absolute top-0 h-full"
          :style="{ transform: `translateX(${-transitionNumber + 100}%)` }"
        >
          <div v-if="sideCollapsed" class="h-full">
            <div class="h-full">
              <div
                class="flex items-center p-2 justify-center relative z-40 items-center justify-center font-semibold bg-light-500/90 backdrop-blur-sm ring-0 ring-slate-900/10 transition-all duration-100 shadow-sm"
              >
                <a-tooltip>
                  <template #title>
                    <span>{{ t('common.back') }}</span>
                  </template>
                  <a-button
                    type="text" class="flex items-center justify-center flex-grow-0 mr-1"
                    @click="() => { showDeviceDetails = false }"
                  >
                    <template #icon>
                      <span class="i-carbon-arrow-left anticon block text-blue" />
                    </template>
                  </a-button>
                </a-tooltip>
              </div>
              <div class="w-full h-full flex justify-center items-center text-center">
                <span class="">
                  <a-tooltip>
                    <template #title>
                      <span>{{ t('common.expande') }}</span>
                    </template>
                    <a-button
                      type="text" class="flex items-center justify-center mt-5 mx-auto"
                      @click="sideCollapsed = false"
                    >
                      <template #icon>
                        <span class="i-ph-arrow-line-right anticon block text-blue" />
                      </template>
                    </a-button>
                  </a-tooltip>
                </span>
              </div>
            </div>
          </div>
          <div v-else class="h-full">
            <!-- content Not collapsed -->
            <a-tabs v-model:activeKey="activeKeyDeviceDetails" size="small" class="h-full device-history-table">
              <a-tab-pane key="details" class="overflow-auto">
                <template #tab>
                  <span class="px-2">Details</span>
                </template>
                <DeviceInfos :device="selectedDevice" />
              </a-tab-pane>
              <a-tab-pane key="histories" class="h-full overflow-auto">
                <template #tab>
                  <span class="px-2">History</span>
                </template>
                <div class="bg-gray-50 dark:bg-dark-600 h-full">
                  <DeviceHistory
                    :data-histories="dataHistories"
                    @clickPosition="(point) => {
                      if (gmapRef) {
                        gmapRef.mapOptions.center = { lat: point.latitude, lng: point.longitude }
                        gmapRef.mapOptions.zoom = 25
                      }}
                    "
                  />
                </div>
              </a-tab-pane>
              <a-tab-pane key="stats" class="overflow-auto">
                <template #tab>
                  <span class="px-2">Statistics</span>
                </template>
                <DeviceHistoryStatistics :data-histories="dataHistories" />
              </a-tab-pane>
              <template v-if="activeKeyDeviceDetails !== 'details'" #rightExtra>
                <div class="bg-white dark:bg-dark-300 mr-3px rounded-2px">
                  <a-range-picker
                    v-model:value="deviceDetailsDateRange"
                    :show-time="false"
                    :disabled-date="(current) => current && current > dayjs().endOf('day')"
                    format="YYYY-MM-DD"
                    class="flex-grow max-w-sm mr-0 ml-auto" :bordered="false"
                  />
                </div>
              </template>
            </a-tabs>
          </div>
        </div>
      </div>
    </a-layout-sider>
    <a-layout-content class="!min-h-1/2 !md:h-full !w-full !md:w-auto">
      <div class="overflow-hidden !h-full !w-full relative">
        <div ref="mapToolsContainerRef" class="w-full h-full relative">
          <GMapDevices
            ref="gmapRef" :selected-device="selectedDevice"
            :devices="devices.filter(d => d.latitude && d.longitude)" class="h-full w-full"
            :show-devices="showDevicesInMap" :data-histories="dataHistories" @marker-clicked="markerClicked"
          />
          <div
            ref="mapToolsRef"
            class="m-0 z-10 fixed select-none drop-shadow-sm rounded-sm overflow-hidden m-2"
            :style="{ top: `${restrictedY}px`, left: `${restrictedX}px`}"
          >
            <div class="min-w-35 p-3 bg-white flex">
              <a-button
                size="small" class="flex items-center justify-center mr-1" type="primary"
                @click="() => (sideCollapsed = !sideCollapsed)"
              >
                <template #icon>
                  <span
                    :class="sideCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
                    class="anticon block text-sm"
                  />
                </template>
              </a-button>
              <a-button
                size="small" class="flex items-center justify-center mr-1" type="primary" :disabled="!isSupported"
                @click="() => {
                  if (gmapRef) {
                    gmapRef.mapOptions.center = { lat: coords.latitude, lng: coords.longitude }
                    gmapRef.mapOptions.zoom = 10
                  }
                }"
              >
                <template #icon>
                  <span class="i-carbon-airport-location anticon block text-sm" />
                </template>
              </a-button>
              <a-button size="small" class="flex items-center justify-center mr-1" type="primary">
                <template #icon>
                  <span class="i-carbon-area-custom anticon block text-sm" />
                </template>
              </a-button>
              <a-button
                size="small" class="flex items-center justify-center mr-1" type="primary"
                @click="() => (sideCollapsed = true)"
              >
                <template #icon>
                  <span class="i-carbon-circle-dash anticon block text-sm" />
                </template>
              </a-button>
              <a-button
                size="small" class="flex items-center justify-center mr-1" type="primary"
                @click="() => { sideCollapsed = true; gmapRef.value?.addRectangle() }"
              >
                <template #icon>
                  <span class="i-carbon-center-square anticon block text-sm" />
                </template>
              </a-button>
              <a-button size="small" class="flex items-center justify-center" type="primary" @click="toggleFullScreen">
                <template #icon>
                  <span
                    class="anticon block text-sm"
                    :class="isFullscreen ? 'i-ant-design-fullscreen-exit-outlined' : 'i-ant-design-fullscreen-outlined'"
                  />
                </template>
              </a-button>
            </div>
            <span
              ref="handleMapTools"
              class="absolute z-50 -top-0 -left-0 bg-gray-200 rounded-br-md w-18px h-18px cursor-move p-px select-none"
              :class="'bg-gray-800 text-light-100'"
            >
              <span class="i-carbon-move inline-block text-12px" />
            </span>
          </div>
        </div>
      </div>
    </a-layout-content>
  </div>
  <DeviceFormModal
    v-model:visible="visibleDeviceFormModal" :selected-client="selectedClient" :device="selectedDevice"
    :clients="treeDataClients" :devicetypes="devicetypes" :simcards="simcards" @addOrUpdateDevice="addOrUpdateDevice"
  />
  <a-modal v-model:visible="visibleDeviceReportingModal" title="Device Reporting" @ok="exportDeviceReporting">
    <div class="text-center">
      <a-radio-group v-model:value="deviceReportingDuration" button-style="solid">
        <a-radio-button value="1day">
          Un jour
        </a-radio-button>
        <a-radio-button value="3days">
          3 jours
        </a-radio-button>
        <a-radio-button value="1week">
          1 semaine
        </a-radio-button>
        <a-radio-button value="month">
          1 mois
        </a-radio-button>
      </a-radio-group>
    </div>
  </a-modal>
</template>
<style lang="less">
.vue-map-container {
  width: 100%;
  height: 100%;
}

.device-history-table {
  .ant-tabs-nav {
    @apply bg-zinc-100 dark:bg-dark-500;
  }

  .ant-tabs-content {
    @apply h-full;
  }
}
</style>
<route lang="yaml">
meta:
  layout: admin
</route>
