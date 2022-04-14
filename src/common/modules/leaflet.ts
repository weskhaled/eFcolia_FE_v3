import 'leaflet/dist/leaflet.css'
import type { UserModule } from '~/types'

export const install: UserModule = async({ app, isClient }) => {
  if (!isClient) return
  const Leaflet = await import('leaflet')
  app.provide(Leaflet.default || Leaflet, {})
  // provide('Leaflet', Leaflet)
}
