<script setup lang="ts">
import FusionCharts from 'fusioncharts'
import TimeSeries from 'fusioncharts/fusioncharts.timeseries'
import ExcelExport from 'fusioncharts/fusioncharts.excelexport'
import { promiseTimeout } from '@vueuse/core'
import dayjs from 'dayjs'
import { siderCollapsed } from '~/common/stores'

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
onMounted(async() => {
  await nextTick()
})
// const isTogelSider = computed()
watch([siderCollapsed, dataFormatter, chartRef], async([valSiderCollapsed, valData]) => {
  console.log(valSiderCollapsed)
  console.log(dataFormatter.value)
  if (valData.length && chartRef.value)
    initChart()
}, {
  immediate: true,
})
defineExpose({ chart })
</script>

<template>
  <div ref="wrapperTableStatsRef" class="min-h-full bg-white pt-2">
    <div ref="chartRef" />
  </div>
</template>
<style lang="less">
</style>
