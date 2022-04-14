<script setup lang="ts">
import type Dayjs from 'dayjs'
import { dayjs } from 'dayjs'
import { TransitionPresets, useTransition } from '@vueuse/core'
import type { TreeSelectProps } from 'ant-design-vue'

import { currentUser, mdAndLarger, siderCollapsed } from '~/common/stores'
import service from '~/common/services/http'

const router = useRouter()
const { t } = useI18n()

const { coords, isSupported } = useGeolocation()

const treeDataClients = ref<TreeSelectProps['treeData'] | null>(null)
const selectedClient = ref()
const devices = ref([])
const selectedDevice = ref(null)
const activeKeyDeviceDetails = ref('details')
const showDeviceDetails = ref(false)
const baseNumber = computed(() => showDeviceDetails.value && selectedDevice.value ? 100 : 0)
const transitionNumber = useTransition(baseNumber, {
  duration: 200,
  transition: TransitionPresets.easeInOut,
})
const devicesCount = ref<number>(0)
const devicesLoading = ref(false)

const deviceDetailsDateRange = ref<[Dayjs, Dayjs]>()
const dataHistories = ref(null)

const mapToolsRef = ref(null)
const devicesListRef = ref<HTMLElement | any>(null)
const gmapRef = ref(null)
const positionMapTools = useStorage('position-map-tools', { x: 10, y: 55 })
const mapContainerRef = ref(null)
const { elementX, elementY, isOutside } = useMouseInElement(mapContainerRef)

const onLoadMore = async() => {
  const length = devices.value.length
  if (length < devicesCount.value - 1) {
    devicesLoading.value = true
    const { data } = await service.get(`api/device/byClientId/${selectedClient.value}?skip=${length}`)

    if (data) {
      devices.value = Array.from([...devices.value, ...data.listDevice].reduce((p, c) => p.set(c.id, c), new Map()).values())
      devicesCount.value = data.count
    }
    devicesLoading.value = false
  }
}
watch([selectedDevice, showDeviceDetails, deviceDetailsDateRange], async() => {
  const dateRange = unref(deviceDetailsDateRange)
  let from = null
  let to = null
  if (dateRange && dateRange?.length > 1) {
    from = dateRange[0].format('YYYY-MM-DD 00:00:00')
    to = dateRange[1].format('YYYY-MM-DD 23:59:59')
  }
  if (selectedDevice.value && showDeviceDetails.value) {
    dataHistories.value = null
    const { data } = await service.get(`/api/history/${selectedDevice.value.id}?from=${from}&to=${to}`)

    data && (dataHistories.value = data)
  }
})
onMounted(async() => {
  const { data } = await service.get('/api/client')

  data && (treeDataClients.value = data)
  selectedClient.value = currentUser.value?.client_id
})
watch(selectedClient, async(val) => {
  devicesLoading.value = true
  showDeviceDetails.value = false
  selectedDevice.value = null
  const { data } = await service.get(`api/device/byClientId/${val}?skip=0`)

  if (data) {
    devices.value = data.listDevice
    devicesCount.value = data.count
  }
  devicesLoading.value = false
})
const markerClicked = (deviceId) => {
  devices.value.filter(d => d.id !== deviceId).map(d => d.selected = false)
  const device = devices.value.find(d => d.id === deviceId)
  device && (device.selected = !device.selected)
  if (device && device.selected) {
    if (gmapRef.value) {
      gmapRef.value.mapOptions.center = { lat: device.latitude, lng: device.longitude }
      gmapRef.value.mapOptions.zoom = 18
    }
    const scrollDiv = document.getElementById(`device-id-${device.id}`)?.offsetTop
    scrollDiv && devicesListRef.value?.listScrollRef?.scrollTo({ top: scrollDiv - 50, behavior: 'smooth' })
    selectedDevice.value = device
    if (siderCollapsed.value && showDeviceDetails.value)
      showDeviceDetails.value = false
  }
  else {
    gmapRef.value && gmapRef.value?.centerMapView()
    selectedDevice.value = null
    showDeviceDetails.value = false
  }
}
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
        gmapRef.value.mapOptions.center = { lat: device.latitude, lng: device.longitude }
        gmapRef.value.mapOptions.zoom = 18
        selectedDevice.value = device
      }
    }
  }
}
</script>

<template>
  <a-layout-sider
    v-model:collapsed="siderCollapsed"
    class="!max-h-1/2 !md:max-h-full bg-light-200 dark:bg-blue-gray-800"
    :width="mdAndLarger ? (showDeviceDetails && selectedDevice ? '55%' : 370) : '100%'"
    :trigger="null"
    :collapsible="mdAndLarger" :collapsed-width="!mdAndLarger ? '100%' : 80"
  >
    <div class="p-2 flex relative items-center z-10 shadow-sm bg-light-300 dark:bg-blue-gray-900">
      <template v-if="siderCollapsed">
        <a-button
          class="flex items-center justify-center mx-auto" type="primary"
          @click="() => (siderCollapsed = !siderCollapsed)"
        >
          <template #icon>
            <span
              :class="siderCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
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
              type="text" class="flex items-center justify-center mr-1"
              @click="() => { showDeviceDetails = false }"
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
            <span class="text-md dark:text-light-400">{{ `${selectedDevice?.name}`.slice(0, 10) }}{{
              `${selectedDevice.name}`.length > 10 ? '...' : null
            }}</span>
          </a-tooltip>
        </div>
        <h3 v-else-if="!showDeviceDetails" class="text-gray-800 dark:text-light-400 text-base leading-8 my-auto ml-0 mr-auto">
          <span v-if="devices.length" class="text-sm leading-15px">{{ devices.length }}/{{ devicesCount }} {{
            t('common.devices.devices')
          }}</span>
          <span v-else class="text-sm leading-15px dark:text-light-400">{{ t('common.devices.notFound') }}</span>
        </h3>
        <div class="hidden md:flex">
          <a-button class="flex items-center justify-center flex-grow-0 mr-0" type="primary">
            <template #icon>
              <span class="i-ant-design-reload-outlined anticon block text-white" />
            </template>
          </a-button>
          <a-button
            class="flex items-center justify-center mx-auto flex-grow-0 ml-2" type="primary"
            @click="() => (siderCollapsed = !siderCollapsed)"
          >
            <template #icon>
              <span
                :class="siderCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
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
          ref="devicesListRef" :devices="devices" :devices-count="devicesCount"
          :devices-loading="devicesLoading" @device-clicked="deviceClicked" @on-load-more="onLoadMore" @show-details="(device) => {
            selectedDevice = device;
            showDeviceDetails = true;
            activeKeyDeviceDetails = 'details'
          }" @show-history="(device) => {
            selectedDevice = device;
            showDeviceDetails = true;
            activeKeyDeviceDetails = 'histories'
          }"
        />
      </div>
      <div class="block w-full absolute top-0 h-full" :style="{ transform: `translateX(${-transitionNumber + 100}%)` }">
        <div v-if="siderCollapsed" class="h-full">
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
                    @click="siderCollapsed = false"
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
            <a-tab-pane key="details">
              <template #tab>
                <span class="px-2">Details</span>
              </template>
              Content of tab 2
            </a-tab-pane>
            <a-tab-pane key="histories" class="h-full">
              <template #tab>
                <span class="px-2">History</span>
              </template>
              <div class="bg-gray-50 h-full">
                <DeviceHistory :data-histories="dataHistories" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="stats">
              <template #tab>
                <span class="px-2">Statistics</span>
              </template>
              Content of tab 2
            </a-tab-pane>
            <template v-if="activeKeyDeviceDetails !== 'details'" #rightExtra>
              <div class="bg-white mr-3px rounded-2px">
                <a-range-picker
                  v-model:value="deviceDetailsDateRange" format="YYYY-MM-DD"
                  class="flex-grow max-w-sm mr-0 ml-auto" :bordered="false"
                />
              </div>
            </template>
          </a-tabs>
        </div>
      </div>
    </div>
  </a-layout-sider>
  <a-layout-content class="!h-1/2 !md:h-full !w-full !md:w-auto">
    <div ref="mapContainerRef" class="overflow-hidden !h-full !w-full relative">
      <div class="w-full h-full">
        <GMapDevices
          ref="gmapRef" :devices="devices.filter(d => d.latitude && d.longitude)" class="h-full w-full"
          @marker-clicked="markerClicked"
        />
      </div>
      <div
        ref="mapToolsRef" class="hidden md:block m-0 select-none absolute z-40 drop-shadow-sm rounded-sm overflow-hidden"
        :style="{ top: `${positionMapTools.y}px`, left: `${positionMapTools.x}px` }"
      >
        <div class="min-w-35 p-3 bg-white flex">
          <a-button
            class="flex items-center justify-center mr-1" type="primary"
            @click="() => (siderCollapsed = !siderCollapsed)"
          >
            <template #icon>
              <span
                :class="siderCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
                class="anticon block text-sm"
              />
            </template>
          </a-button>
          <a-button
            class="flex items-center justify-center mr-1" type="primary" :disabled="!isSupported" @click="() => {
              if (gmapRef) {
                gmapRef.mapOptions.center = { lat: coords.latitude, lng: coords.longitude }
                gmapRef.mapOptions.zoom = 9
              }
            }"
          >
            <template #icon>
              <span class="i-carbon-airport-location anticon block text-sm" />
            </template>
          </a-button>
          <a-button class="flex items-center justify-center mr-1" type="primary" @click="() => (siderCollapsed = true)">
            <template #icon>
              <span class="i-carbon-area-custom anticon block text-sm" />
            </template>
          </a-button>
          <a-button class="flex items-center justify-center mr-1" type="primary" @click="() => (siderCollapsed = true)">
            <template #icon>
              <span class="i-carbon-circle-dash anticon block text-sm" />
            </template>
          </a-button>
          <a-button class="flex items-center justify-center" type="primary" @click="() => (siderCollapsed = true)">
            <template #icon>
              <span class="i-carbon-map-center anticon block text-sm" />
            </template>
          </a-button>
        </div>
        <span
          draggable="false"
          class="absolute z-50 -top-0 -left-0 bg-gray-200 rounded-br-md w-18px h-18px cursor-move p-px select-none"
          :class="'bg-gray-800 text-light-100'" @drag.prevent="() => {
            if (!isOutside) {
              positionMapTools.x = elementX - 9;
              positionMapTools.y = elementY - 9;
            }
          }" @dragover.prevent @dragend.prevent
        >
          <span class="i-carbon-move inline-block text-12px" />
        </span>
      </div>
      <div class="ml-16 md:ml-2.4 mt-2.5 min-w-34 md:min-w-40 p-1 bg-white text-gray-700 dark:bg-[#001628] dark:text-light-50 flex rounded-sm absolute top-0 left-0 z-40">
        <span class="mr-2 leading-5 my-auto">{{ t('common.client') }}:</span>
        <a-tree-select
          v-model:value="selectedClient" show-search class="w-65 max-w-full" tree-node-filter-prop="title"
          :tree-default-expanded-keys="[1]" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="Please select a client" :tree-default-expand-all="false" tree-data-simple-mode
          :disabled="!treeDataClients" :tree-data="treeDataClients || []" :height="233" virtual
        >
          <template #title="{ title }">
            {{ title }}
          </template>
        </a-tree-select>
        <a-badge-ribbon v-if="siderCollapsed" class="absolute !-top-4 !-right-4 !leading-20px">
          <template #text>
            <span v-if="devices.length" class="text-12px leading-15px">{{ devices.length }}/{{ devicesCount }} {{
              t('common.devices.devices')
            }}</span>
            <span v-else class="text-12px leading-15px">{{ t('common.devices.notFound') }}</span>
          </template>
        </a-badge-ribbon>
      </div>
    </div>
  </a-layout-content>
</template>
<style lang="less">
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

.vue-map-container {
  width: 100%;
  height: 100%;
}

.device-history-table {
  .ant-tabs-nav {
    @apply bg-zinc-100;
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
