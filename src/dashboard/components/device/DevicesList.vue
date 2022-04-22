<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { useVirtualList } from '@vueuse/core'
import { mdAndLarger, siderCollapsed } from '~/common/stores'

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
const emit = defineEmits(['deviceClicked', 'onLoadMore', 'showDetails', 'showHistory', 'addNewDevice', 'updateDevice'])

const { t } = useI18n()

const filteredList = computed(() => props.devices.filter(i => i.name))

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
  filteredList,
  {
    itemHeight: 159,
    overscan: 10,
  },
)

defineExpose({ scrollTo, containerProps })
</script>

<template>
  <div
    v-if="props.devicesLoading"
    class="w-full h-full bg-dark-500/10 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
  >
    <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-200 text-2xl anticon-spin" />
  </div>
  <div
    v-else-if="!props.devicesLoading && !props.devicesCount"
    class="w-full h-full bg-light-500/20 dark:bg-[#001125] transition-colors text-white z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
  >
    <div>
      <span class="i-ph-warning text-red-600 text-4xl block mx-auto" />
      <span class="block text-red-400">No devices</span>
    </div>
  </div>
  <div
    v-infinite-scroll="[() => emit('onLoadMore'), { 'distance': 160 }]"
    v-bind="containerProps"
    class="w-full overflow-y-auto overflow-x-hidden min-h-500px h-[calc(50vh-78px)] md:max-h-[calc(100vh-103px)] md:min-h-[calc(100vh-103px)] relative"
  >
    <div
      class="pt-0 px-2 flex -top-0 items-center sticky flex z-44 items-center justify-center font-semibold bg-slate-50/80 dark:bg-blue-gray-900/80 backdrop-blur-sm ring-1 ring-slate-900/10 transition-all duration-100"
    >
      <div
        class="flex items-center"
        :class="siderCollapsed ? 'h-10 w-12 rounded-full justify-center' : 'h-10 w-full justify-center'"
      >
        <div v-if="!siderCollapsed" class="flex flex-grow items-center mr-auto">
          <a-input-search
            placeholder="input search loading with enterButton"
            :loading="props.devicesLoading" :disabled="props.devicesCount === 0" enter-button
            class="flex-grow max-w-full mr-2"
          />
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
                <a-menu-item @click.prevent="emit('addNewDevice')">
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
                <a-menu-item>
                  <span class="flex items-center leading-6">
                    <span class="i-ph-plus-circle-duotone anticon text-gray-700 mr-1" />
                    <span>Add New Device</span>
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
        v-for="{ index, data: item } in list" :id="`device-id-${item.id}`" :key="index"
        class="py-1 px-1 flex items-center" :class="siderCollapsed ? 'justify-center' : 'justify-start'"
      >
        <template v-if="siderCollapsed">
          <a-tooltip :color="item.gprsstate === 1 ? 'green' : 'red'" placement="right">
            <template #title>
              <span>{{ `${item.name}` }}</span>
            </template>

            <div
              class="block group flex items-center justify-center transition-all cursor-pointer ease-in duration-100 h-151px w-full rounded-sm text-dark-800 relative"
              :class="item.selected ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'"
              @click="emit('deviceClicked', item)"
            >
              <span
                v-if="item.selected"
                class="i-ant-design-caret-left-filled text-sm absolute -right-1.3 top-4 block ease-in duration-100 transition-all text-white"
              />
              <a-badge
                :text="false" :status="item.gprsstate === 1 ? 'success' : 'error'"
                class="absolute -top-2.5 -right-0 w-1 h-1"
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
            :device="item"
            @click="emit('deviceClicked', item)"
            @show-details="emit('showDetails', item)"
            @show-history="emit('showHistory', item)"
            @update="emit('updateDevice', item)"
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
