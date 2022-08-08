<script setup lang="ts">
import generatedRoutes from 'virtual:generated-pages'

import { isDark } from '~/common/composables'
import { mdAndLarger } from '~/common/stores'

const { t } = useI18n()
const route = useRoute()

const selectedKeysSider = ref<string[]>([])
const openKeySider = ref<string[]>([])

onMounted(() => {
  selectedKeysSider.value = [`${route.name}`]
})
</script>

<template>
  <a-layout-sider class="z-42 md:rounded-none rounded-b-sm overflow-hidden" collapsed :trigger="null"
    collapsed-width="60">
    <a-menu v-model:selectedKeys="selectedKeysSider" v-model:openKeys="openKeySider" :theme="isDark ? 'dark' : 'light'"
      :mode="mdAndLarger ? 'inline' : 'horizontal'" :style="{ height: '100%' }"
      class="!dark:border-r-1px !dark:border-white/5">
      <a-menu-item key="dashboard" @click="$router.push({ name: 'dashboard' })">
        <span class>
          <span class="i-ph-car-duotone inline-block anticon text-lg" />
          <span>Devices List</span>
        </span>
      </a-menu-item>
      <a-menu-item key="dashboard-alerts" @click="$router.push({ name: 'dashboard-alerts' })">
        <span class>
          <span class="i-ant-design-alert-twotone inline-block anticon text-lg" />
          <span>Alert</span>
        </span>
      </a-menu-item>
      <a-menu-item key="dashboard-floats" @click="$router.push({ name: 'dashboard-floats' })">
        <span class>
          <span
            :class="selectedKeysSider.includes('dashboard-floats') ? 'i-ant-design-folder-open-twotone' : 'i-ant-design-folder-twotone'"
            class="inline-block anticon text-lg" />
          <span>Liste des Flottes</span>
        </span>
      </a-menu-item>
      <a-menu-item key="dashboard-clients" @click="$router.push({ name: 'dashboard-clients' })">
        <span class>
          <span class="i-carbon-enterprise inline-block anticon text-lg" />
          <span>Liste des sociétés</span>
        </span>
      </a-menu-item>
      <a-menu-item key="dashboard-users" @click="$router.push({ name: 'dashboard-users' })">
        <span class>
          <span class="i-carbon-user-multiple inline-block anticon text-lg" />
          <span>Liste des contacts</span>
        </span>
      </a-menu-item>
      <a-sub-menu key="sub2">
        <template #title>
          <span>
            <span class="i-ph-monitor-duotone inline-block anticon text-lg" />
            <span>POI</span>
          </span>
        </template>
        <a-menu-item key="9">
          POI
        </a-menu-item>
        <a-menu-item key="10">
          Axe
        </a-menu-item>
        <a-menu-item key="11">
          Zone
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>
<style lang="less">
.ant-menu.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  @apply !bg-blue-300/10 relative;

  &:before {
    content: "";
    @apply block absolute w-full rounded-2xl bg-[#007bff];
    top: calc(10%);
    height: calc(80%);
    right: calc(100% - 5px);
  }
}
</style>
