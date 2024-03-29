<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import type { UseFuseOptions } from '@vueuse/integrations/useFuse'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useVirtualList } from '@vueuse/core'
import { message } from 'ant-design-vue'

import { currentUser, selectedClient, sideCollapsed } from '~/common/stores'
import { hasPermission } from '~/dashboard/utils'
import { api as apiServices } from '~/common/composables'

interface Props {
  devices?: Ref<any[]>
  devicesCount?: Ref<number>
  devicesLoading?: Ref<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  devices: () => ref([]),
  devicesCount: () => ref(0),
  devicesLoading: () => ref(false),
})
const emit = defineEmits(['update:devices', 'update:devicesCount', 'update:devicesLoading', 'deviceClicked', 'onLoadMore', 'showDetails', 'showHistory', 'deviceReporting', 'addNewDevice', 'updateDevice', 'deleteDevice', 'onSearchDevice'])
const { devices, devicesCount, devicesLoading } = useVModels(props, emit)

const { t } = useI18n()

const search = ref('')
const searchText = computed(() => `'${search.value}`)
const filterBy = ref('both')
const keys = computed(() => {
  if (filterBy.value === 'name')
    return ['name']
  else if (filterBy.value === 'simcardNumber')
    return ['simcardNumber']
  else return ['name', 'simcardNumber']
})
const resultLimit = ref<number | undefined>(undefined)
const resultLimitString = ref<string>('')
watch(resultLimitString, () => {
  if (resultLimitString.value === '') {
    resultLimit.value = undefined
  }
  else {
    const float = parseFloat(resultLimitString.value)
    if (!isNaN(float)) {
      resultLimit.value = Math.round(float)
      resultLimitString.value = resultLimit.value.toString()
    }
  }
})
const exactMatch = ref(true)
const isCaseSensitive = ref(false)
const matchAllWhenSearchEmpty = ref(false)
const options = computed<UseFuseOptions<any>>(() => ({
  fuseOptions: {
    keys: keys.value,
    isCaseSensitive: isCaseSensitive.value,
    threshold: exactMatch.value ? 0 : undefined,
    includeMatches: false,
    minMatchCharLength: 4,
    findAllMatches: false,
    useExtendedSearch: true,
  },
  resultLimit: resultLimit.value,
  matchAllWhenSearchEmpty: matchAllWhenSearchEmpty.value,
}))

// const filteredList = computed(() => props.devices.filter(i => i.name))

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
  devices,
  {
    itemHeight: 115,
    overscan: 10,
  },
)

const { results: resultsFilteredDevices } = useFuse(searchText, devices, options)

watchDebounced(
  search,
  async(val) => {
    if (val.length > 4) {
      // emit('onSearchDevice', val)
      // console.log(resultsFilteredDevices.value)
      devicesLoading.value = true
      // if (resultsFilteredDevices.value.length) {
      //   const index = resultsFilteredDevices.value[0].refIndex
      //   scrollTo(index)
      // }
      const { data } = await apiServices(`api/device/byClientId/${selectedClient.value}/${search.value}`).get().json()
      const devicesData: any = unref(data)
      if (!devicesData.length)
        message.info('No devices founded')
      if (resultsFilteredDevices.value.length === devicesData.length) {
        const index = resultsFilteredDevices.value[0]?.refIndex
        index && scrollTo(index)
      }
      if (devicesData && devicesData.length > resultsFilteredDevices.value.length) {
        devices.value = Array.from([...devicesData, ...devices.value].reduce((p, c) => p.set(c.id, c), new Map()).values())
        // devicesCount.value = data.length
        containerProps?.ref?.value.scrollTo(0, 0)
      }
      devicesLoading.value = false
    }
  },
  { debounce: 300 },
)
defineExpose({ scrollTo, containerProps })
</script>

<template>
  <div
    v-if="devicesLoading"
    class="w-full h-full bg-dark-500/10 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
  >
    <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-200 text-2xl anticon-spin" />
  </div>
  <div
    v-else-if="(!devicesLoading && !devicesCount)"
    class="w-full h-full bg-light-500/20 dark:bg-[#001125] transition-colors text-white z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
  >
    <div>
      <span class="i-ph-warning text-red-600 text-4xl block mx-auto" />
      <span class="block text-red-400">No devices</span>
    </div>
  </div>
  <div
    v-infinite-scroll="[() => emit('onLoadMore'), { 'distance': 160 }]" v-bind="containerProps"
    class="w-full overflow-y-auto overflow-x-hidden min-h-500px h-[calc(50vh-78px)] md:max-h-[calc(100vh-103px)] md:min-h-[calc(100vh-103px)] relative"
  >
    <div
      class="pt-0 px-2 flex -top-0 items-center sticky flex z-44 items-center justify-center font-semibold bg-slate-50/80 dark:bg-blue-gray-900/80 backdrop-blur-sm ring-1 ring-slate-900/10 transition-all duration-100"
    >
      <div
        class="flex items-center"
        :class="sideCollapsed ? 'h-10 w-12 rounded-full justify-center' : 'h-10 w-full justify-center'"
      >
        <div v-if="!sideCollapsed" class="flex flex-grow items-center mr-auto">
          <a-input-search
            v-model:value="search" allow-clear placeholder="input search loading with enterButton"
            :loading="devicesLoading" :disabled="!search.length && devicesCount === 0" enter-button
            class="flex-grow max-w-full mr-2"
          >
            <template v-if="resultsFilteredDevices.length" #suffix>
              <a-tooltip title="scroll to device">
                <a-button type="link" size="small" @click="scrollTo(resultsFilteredDevices[0].refIndex)">
                  <template #icon>
                    <span class="i-carbon-auto-scroll anticon block text-sm text-opacity-10" />
                  </template>
                </a-button>
              </a-tooltip>
            </template>
          </a-input-search>
        </div>
        <div>
          <a-dropdown>
            <a-button class="flex items-center justify-center flex-grow-0 mr-0" type="link">
              <template #icon>
                <span class="i-ant-design-ellipsis-outlined anticon block text-blue-500" />
              </template>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item
                  :disabled="!hasPermission(currentUser.permissions, 'device', 'n')"
                  @click.prevent="emit('addNewDevice')"
                >
                  <span class="flex items-center leading-6">
                    <span class="i-ph-plus-circle-duotone anticon text-gray-700 mr-1" />
                    <span>Add New Device</span>
                  </span>
                </a-menu-item>
                <a-menu-item>
                  <span class="flex items-center leading-6">
                    <span class="i-carbon-filter-edit anticon text-gray-700 mr-1" />
                    <span>Edit filter</span>
                  </span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>
    <div v-bind="wrapperProps">
      <div
        v-for="{ index, data: item } in list" :id="`device-id-${item.id}`" :key="index" draggable="true"
        class="flex items-start h-115px p-1"
        :class="[sideCollapsed ? 'justify-center' : 'justify-start', resultsFilteredDevices.length && !resultsFilteredDevices.map(r => r.refIndex).includes(index) ? 'opacity-35' : '!opacity-100']"
      >
        <template v-if="sideCollapsed">
          <a-tooltip :color="item.gprsstate === 1 ? 'green' : 'red'" placement="right">
            <template #title>
              <span>{{ `${item.name}` }}</span>
            </template>

            <div
              class="block group flex items-center justify-center transition-all cursor-pointer ease-in duration-100 h-full w-full rounded-sm text-dark-800 relative"
              :class="item.selected ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'"
              @click="emit('deviceClicked', item)"
            >
              <span
                v-if="item.selected"
                class="i-ant-design-caret-left-filled text-sm absolute -right-1.3 top-4 block ease-in duration-100 transition-all text-white dark:text-blue-gray-800"
              />
              <a-badge
                :text="false" :status="item.gprsstate === 1 ? 'success' : 'error'"
                class="!absolute -top-2.5 -right-0 w-1 h-1"
              />
              <span class="inline-block text-xs uppercase">{{ `${item.name}`.slice(0, 6) }}{{
                `${item.name}`.length > 6
                  ? '...' : null
              }}</span>
            </div>
          </a-tooltip>
        </template>
        <template v-else>
          <DeviceCard
            :device="item" @click="emit('deviceClicked', item)" @show-details="emit('showDetails', item)"
            @show-history="emit('showHistory', item)" @show-reporting="emit('deviceReporting', item)"
            @update="emit('updateDevice', item)" @delete="emit('deleteDevice', item)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<style>
#map {
  height: 380px;
}
</style>
