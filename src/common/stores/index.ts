import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { TreeSelectProps } from 'ant-design-vue'

export const token: Ref<string | null> = useStorage('token', null)
export const currentUser: Ref<any | null> = ref(null)
export const isAuthenticated = computed(() => token.value && token.value?.length)
export const sideCollapsed: Ref<boolean> = useStorage('side-collapsed', true)
export const userLang: Ref<boolean> = useStorage('user-lang', 'en')
export const breakpoints = useBreakpoints(breakpointsTailwind)
export const mdAndLarger = breakpoints.greater('md')

export const treeDataClients = ref<TreeSelectProps['treeData'] | null>(null)
export const selectedClient = ref()
export const devices = ref([])
export const selectedDevice = ref(null)
export const devicesCount = ref<number>(0)
export const devicesLoading = ref(false)
