<script setup lang="ts">
import dayjs from 'dayjs'
import { exportFile } from '../../utils/export'

interface Props {
  dataHistories?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  dataHistories: () => ref(null),
})
const emit = defineEmits(['click', 'showDetails', 'showHistory'])
const { t } = useI18n()

const wrapperTableHistoryRef = ref(null)
const { height } = useElementSize(wrapperTableHistoryRef)

const visibleDropdownColumnsDeviceHistories = ref(false)
const columnsDeviceHistories: any = useStorage('columnsDeviceHistory', [
  {
    isHidden: false,
    title: 'Date serveur',
    width: 170,
    dataIndex: 'appdate',
    key: 'appdate',
    fixed: 'left',
  },
  {
    isHidden: false,
    title: 'Date de localisation',
    width: 250,
    dataIndex: 'localizationdate',
    key: 'localizationdate',
  },
  {
    isHidden: false,
    title: 'Latitude',
    dataIndex: 'latitude',
    key: 'latitude',
    width: 150,
  },
  {
    isHidden: false,
    title: 'Longitude',
    width: 190,
    dataIndex: 'longitude',
    key: 'longitude',
  },
  {
    isHidden: false,
    title: 'Altitude',
    width: 190,
    dataIndex: 'altitude',
    key: 'altitude',
  },
  {
    isHidden: false,
    title: 'Vitesse',
    width: 190,
    dataIndex: 'speed',
    key: 'speed',
  },
  {
    isHidden: false,
    title: 'GPS',
    width: 190,
    dataIndex: 'satsinuse',
    key: 'satsinuse',
  },
  {
    isHidden: false,
    title: 'Etat moteur',
    width: 130,
    dataIndex: 'enginestate',
    key: 'enginestate',
  },
  {
    isHidden: false,
    title: 'Etat acceleromètre',
    width: 280,
    dataIndex: 'accelerostate',
    key: 'accelerostate',
  },
  {
    isHidden: false,
    title: 'Odomètre',
    width: 190,
    dataIndex: 'totaldistance',
    key: 'totaldistance',
  },
  {
    isHidden: false,
    title: 'Input',
    width: 190,
    dataIndex: 'sensors',
    key: 'sensors',
  },
  {
    isHidden: false,
    title: 'Temp 1',
    width: 100,
    dataIndex: 'temperature1',
    key: 'temperature1',
  },
  {
    isHidden: false,
    title: 'Temp 2',
    width: 100,
    dataIndex: 'temperature2',
    key: 'temperature2',
  },
  {
    isHidden: false,
    title: 'Temp 3',
    width: 100,
    dataIndex: 'temperature3',
    key: 'temperature3',
  },
  {
    isHidden: false,
    title: 'Niveau GSM',
    width: 100,
    dataIndex: 'csq',
    key: 'csq',
  },
  {
    isHidden: false,
    title: 'Voltage batterie',
    width: 160,
    dataIndex: 'batteryvoltage',
    key: 'batteryvoltage',
  },
  {
    isHidden: false,
    title: 'Voltage batterie Ext.',
    width: 190,
    dataIndex: 'battery2voltage',
    key: 'battery2voltage',
  },
  {
    isHidden: false,
    title: 'Firmware',
    width: 130,
    dataIndex: 'firmware',
    key: 'firmware',
  },
  {
    isHidden: false,
    title: 'Conducteur',
    width: 130,
    dataIndex: 'driver_id2',
    key: 'driver_id2',
  },
  {
    isHidden: false,
    width: 250,
    title: 'Adresse',
    dataIndex: 'adress',
    key: 'adress',
  },
  {
    title: 'Actions',
    key: 'operation',
    fixed: 'right',
    width: 130,
  },
])
</script>

<template>
  <div ref="wrapperTableHistoryRef" class="h-full">
    <a-table
      :loading="!props.dataHistories" size="small" :pagination="{
        size: 'small',
        pageSize: 100,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
      }" :columns="columnsDeviceHistories.filter(col => !col.isHidden)" :data-source="props.dataHistories || []"
      :scroll="{ x: columnsDeviceHistories.filter(col => !col.isHidden).length > 7 ? 3500 : 1000, y: height - 97 }"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'operation'">
          <a-dropdown-button v-model:visible="visibleDropdownColumnsDeviceHistories" size="small">
            <template #overlay>
              <a-menu class="max-h-45 overflow-scroll" @click="() => false">
                <a-sub-menu key="sub1">
                  <template #title>
                    <span class="inline-block">
                      <span class="flex items-center">
                        <span class="i-ph-table-light anticon text-sm mr-2" />
                        Selected columns
                      </span>
                    </span>
                  </template>
                  <div class="max-h-45 min-w-200px overflow-scroll">
                    <a-menu-item
                      v-for="columnsDevice in columnsDeviceHistories.filter(col => !(['operation', 'appdate'].includes(col.key)))"
                      :key="columnsDevice.key" @click="() => columnsDevice.isHidden = !columnsDevice.isHidden"
                    >
                      <a-checkbox :checked="!columnsDevice.isHidden">
                        {{ columnsDevice.title }}
                      </a-checkbox>
                    </a-menu-item>
                  </div>
                </a-sub-menu>
                <a-menu-item
                  key="2"
                  :disabled="!props.dataHistories?.length"
                  @click="exportFile(props.dataHistories, columnsDeviceHistories)"
                >
                  <span class="flex items-center">
                    <span class="i-ph-file-xls-light anticon text-sm block mr-2" /> Export
                  </span>
                </a-menu-item>
              </a-menu>
            </template>
            {{ column.title }}
            <template #icon>
              <span class="i-ant-design-down-outlined anticon !text-10px block text-blue" />
            </template>
          </a-dropdown-button>
        </template>
      </template>
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'operation'">
          <span class="i-ph-map-pin-duotone anticon text-sm block text-blue" />
        </template>
      </template>
    </a-table>
  </div>
</template>
<style lang="less">
.ant-table-pagination.ant-pagination {
  margin: 0;
  padding: 0.5rem;
}

// .ant-table-placeholder {
//   height: calc(v-bind('height') - 45px);
// }
.ant-table-placeholder {
  height: calc(100vh - 232px) !important;
}
</style>
