import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import './styles/ant.less'
import './styles/main.scss'
import 'uno.css'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  async(ctx) => {
    // install all modules under `modules/`
    await Promise.all(Object.values(import.meta.globEager('./**/modules/*.ts')).map(i => i.install?.(ctx)))
    // Object.values(import.meta.globEager('./**/modules/*.ts')).forEach(i => i.install?.(ctx))
  },
)
