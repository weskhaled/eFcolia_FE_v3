<script setup lang="ts">
import FusionCharts from 'fusioncharts'
import TimeSeries from 'fusioncharts/fusioncharts.timeseries'
import ExcelExport from 'fusioncharts/fusioncharts.excelexport'
import { promiseTimeout } from '@vueuse/core'
import dayjs from 'dayjs'
import { sideCollapsed } from '~/common/stores'

interface Props {
  dataHistories?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  dataHistories: () => ref(null),
})
// const excelExport = ExcelExport
ExcelExport(FusionCharts)
TimeSeries(FusionCharts)
const emit = defineEmits(['click', 'showDetails', 'showHistory'])
const { t } = useI18n()

const wrapperTableStatsRef = ref(null)
const chartRef = ref(null)
const chart = ref(null)
const { height } = useElementSize(wrapperTableStatsRef)

const dataFormatter = computed(() => props.dataHistories?.length ? props.dataHistories.map(d => ([dayjs(d.appdate).format('MM/DD/YYYY HH:mm:ss'), +d.temperature1, +d.csq])) : [])

const initChart = () => {
  const data = dataFormatter.value
  const schema = [
    {
      name: 'Time',
      type: 'date',
      format: '%-m/%-d/%Y %H:%M:%S',
    },
    {
      name: 'Temp 1',
      type: 'number',
    },
    {
      name: 'GSM',
      type: 'number',
    },
  ]

  const dataStore = new FusionCharts.DataStore().createDataTable(data, schema)

  new FusionCharts({
    type: 'timeseries',
    renderAt: chartRef.value,
    width: '100%',
    height: '500',
    dataSource: {
      chart: {
        multiCanvas: true,
        canvasHeightProportion: '1:3',
      },
      caption: {
        text: 'Temperature vs Niveau GSM',
      },
      yAxis: [{
        plot: {
          value: 'Temp 1',
          type: 'column',
        },
        title: 'Temp 1',
      }, {
        plot: {
          value: 'GSM',
          type: 'column',
        },
        title: 'GSM',
      }],
      data: dataStore,
    },
  }).render()
}
// onMounted(async() => {
//   await nextTick()
//   initChart()
// })

watch([sideCollapsed, dataFormatter, chartRef], async() => {
  if (dataFormatter.value.length && chartRef.value) {
    await nextTick()
    initChart()
  }
}, {
  immediate: true,
})
defineExpose({ chart })
</script>

<template>
  <div ref="wrapperTableStatsRef" class="min-h-full bg-white dark:bg-dark-700 pt-2 relative">
    <div ref="chartRef" :class="(!dataFormatter.length || !props.dataHistories) && 'hidden'" />
    <a-result v-if="!dataFormatter.length" title="No statistics" sub-title="Sorry, this device have no statistics">
      <template #icon>
        <div
          v-if="!props.dataHistories"
          class="w-full h-full bg-dark-500/15 dark:bg-light-500/35 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
        >
          <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-500 text-2xl anticon-spin" />
        </div>
        <div v-else>
          <img class="mx-auto max-w-80% h-200px" src="https://api.iconify.design/fxemoji:ghost.svg">
        </div>
      </template>
      <template #extra />
    </a-result>
  </div>
</template>
<style lang="less">
</style>
