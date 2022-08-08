// these APIs are auto-imported from @vueuse/core
export const isDark = useDark({
  // selector: 'html',
  // attribute: 'data-doc-theme',
  // valueDark: 'dark',
  // valueLight: 'light',
  // onChanged(dark: boolean) {
  //   document.documentElement.classList.toggle('dark', true)
  // }
})
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
