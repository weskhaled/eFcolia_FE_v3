import { useUrlSearchParams } from '@vueuse/core'
// import type { TreeSelectProps } from 'ant-design-vue'

import leaflet from 'leaflet'

export const urlSearchParams = useUrlSearchParams('history')
export * from './dark'
export const useLeaflet = leaflet
export const flag = useStorage('my-flag', true)
