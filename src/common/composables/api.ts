import { createFetch } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { token } from '~/common/stores'
import showCodeMessage from '~/common/services/code'

const BASE_PREFIX = `${import.meta.env.VITE_API_BASEURL}`

const useMyFetch = createFetch({
  baseUrl: BASE_PREFIX,
  options: {
    beforeFetch({ options }: any) {
      token.value && token.value.length
        ? options.headers.Authorization = `Bearer ${token.value}`
        : delete options.headers.Authorization

      return { options }
    },
    async onFetchError(ctx) {
      if (ctx.response?.status === 401) {
        message.error(ctx.data.message || 'Auth error, 401')
        token.value = null
      }
      ctx.error = new Error(showCodeMessage(`${ctx.response?.status}`))

      return ctx
    },

    immediate: true,
  },
})

export const api = useMyFetch
