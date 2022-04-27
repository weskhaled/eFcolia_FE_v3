<script setup lang="ts">
import { isDark } from '~/common/composables'
import { mdAndLarger } from '~/common/stores'

const { t, availableLocales, locale } = useI18n()

const selectedKeysSider = ref<string[]>(['1'])
const openKeySider = ref<string[]>(['sub1'])
</script>

<template>
  <a-layout-sider class="z-42 min-h-12.5 md:rounded-none rounded-b-sm overflow-hidden" collapsed :trigger="null" collapsed-width="60">
    <a-menu
      v-model:selectedKeys="selectedKeysSider"
      v-model:openKeys="openKeySider"
      :theme="isDark ? 'dark' : 'light'"
      :mode="mdAndLarger ? 'inline': 'horizontal'"
      :style="{ height: '100%' }"
      class=""
    >
      <a-menu-item key="1">
        <span class>
          <span class="i-ph-car-duotone inline-block anticon text-lg" />
          <span>Devices List</span>
        </span>
      </a-menu-item>
      <a-menu-item key="2">
        <span class>
          <span class="i-ant-design-alert-twotone inline-block anticon text-lg" />
          <span>Alert</span>
        </span>
      </a-menu-item>
      <a-menu-item key="3">
        <span class>
          <span
            :class="selectedKeysSider.includes('3') ? 'i-ant-design-folder-open-twotone' : 'i-ant-design-folder-twotone'"
            class="inline-block anticon text-lg"
          />
          <span>nav 1</span>
        </span>
      </a-menu-item>
      <a-sub-menu key="sub2">
        <template #title>
          <span>
            <span class="i-ph-monitor-duotone inline-block anticon text-lg" />
            <span>nav 3</span>
          </span>
        </template>
        <a-menu-item key="9">
          option9
        </a-menu-item>
        <a-menu-item key="10">
          option10
        </a-menu-item>
        <a-menu-item key="11">
          option11
        </a-menu-item>
        <a-menu-item key="12">
          option12
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>
<style lang="less">
.ant-menu.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  @apply !bg-blue-300/5 relative;

  &:before {
    content: "";
    @apply block absolute w-full rounded-2xl bg-[#007bff];
    top: calc(10%);
    height: calc(80%);
    right: calc(100% - 5px);
  }
}
</style>
