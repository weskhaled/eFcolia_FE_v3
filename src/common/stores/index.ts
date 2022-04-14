import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
export const token: Ref<string | null> = useStorage('token', null)
export const currentUser: Ref<any | null> = ref(null)
export const isAuthenticated = computed(() => token.value && token.value?.length)
export const siderCollapsed: Ref<boolean> = useStorage('sider-collapsed', true)
export const userLang: Ref<boolean> = useStorage('user-lang', 'en')
export const breakpoints = useBreakpoints(breakpointsTailwind)
export const mdAndLarger = breakpoints.greater('md')
