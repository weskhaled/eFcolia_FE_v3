<script setup lang="ts">
import service from '~/common/services/http'
import { currentUser, isAuthenticated } from '~/common/stores'

const router = useRouter()

onMounted(async() => {
  const { data } = await service.get('/api/request/user')

  data && (currentUser.value = data)
})
watch(
  isAuthenticated,
  async(value: any) => {
    if (!value)
      await router.push('/auth')
  },
  { immediate: true },
)

</script>
<template>
  <a-layout>
    <LayoutHeader />
    <a-layout class="!min-h-[calc(100vh-55px)] relative">
      <LayoutSider class="absolute top-0 md:block md:relative" />
      <a-layout class="relative !flex-col-reverse !md:flex-row !min-h-full !w-auto p-0">
        <router-view />
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<style lang="less">
.ant-menu.ant-menu-vertical.ant-menu-root {
  > .ant-menu-item,
  .ant-menu-submenu.ant-menu-submenu-vertical,
  .ant-menu-vertical .ant-menu-submenu-title {
    &:first-child {
      @apply mt-0;
    }
    height: 55px;
    line-height: 55px;
  }
}
.ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title {
  height: 55px;
  line-height: 55px;
}
.ant-tooltip.ant-menu-inline-collapsed-tooltip {
  .ant-tooltip-inner {
    > span {
      @apply flex items-center;
    }
    .anticon {
      @apply mr-1;
    }
  }
}
.ant-tabs-nav {
  @apply !mb-0;
}
</style>
