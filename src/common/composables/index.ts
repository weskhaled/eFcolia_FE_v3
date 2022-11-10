import { useUrlSearchParams } from '@vueuse/core'

export * from './dark'
export * from './api'
export const urlSearchParams = useUrlSearchParams('history', {removeNullishValues: true})
export const flag = useStorage('my-flag', true)
