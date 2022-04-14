import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { message } from 'ant-design-vue'
import showCodeMessage from './code'
import { token } from '~/common/stores'
import type { instanceObject } from '~/common/utils/format'
import { formatJsonToUrlParams } from '~/common/utils/format'

const BASE_PREFIX = `${import.meta.env.VITE_API_BASEURL}`

// Create instance
export const http: AxiosInstance = axios.create({
  // prefix
  baseURL: BASE_PREFIX,
  // time out
  timeout: 1000 * 30,
  // request header
  headers: {
    'Content-Type': 'application/json',
  },
})

// request interceptor
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // TODO Here you can add the logic you want to process before the request is sent
    // TODO for example loading Wait
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200)
      return response
    message.destroy()
    message.info(JSON.stringify(response.status))
    return response
  },
  (error: AxiosError) => {
    const { response } = error
    if (response) {
      if (response.status === 401)
        token.value = null

      message.destroy()
      message.error(showCodeMessage(response.status))
      return Promise.reject(response.data)
    }
    message.warning('The network connection is abnormal, please try again later!')
    return Promise.reject(error)
  },
)
const service = {
  get: (url: string, data?: object) => http.get(url, { params: data }),
  post: (url: string, data?: object) => http.post(url, data),
  put: (url: string, data?: object) => http.put(url, data),
  patch: (url: string, data?: object) => http.patch(url, data),
  delete: (url: string, data?: object) => http.delete(url, data),
  upload: (url: string, file: FormData) =>
    http.patch(url, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (url: string, data: instanceObject) => {
    const downloadUrl = `${BASE_PREFIX}/${url}?${formatJsonToUrlParams(data)}`
    window.location.href = downloadUrl
  },
}

watch(token, () => {
  http.interceptors.request.use((config: any) => {
    if (token.value && token.value.length)
      config.headers.Authorization = `Bearer ${token.value}`
    else
      delete config.headers.Authorization

    return config
  }, (err) => {
    return Promise.reject(err)
  })
}, { immediate: true })

export default service
