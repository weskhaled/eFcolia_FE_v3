import leaflet from 'leaflet'
export * from './dark'
export const useLeaflet = leaflet
export const flag = useStorage('my-flag', true)
