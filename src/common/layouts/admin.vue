<script setup lang="ts">
// import service from '~/common/services/http'
import { api as apiServices } from '~/common/composables'
import { currentUser, isAuthenticated, selectedClient, treeDataClients } from '~/common/stores'
import { urlSearchParams } from '~/common/composables'

const router = useRouter()

onMounted(async () => {
  const { data: dataUser, error } = await apiServices('/api/request/user').get().json()

  if (error.value) {
    await router.push('/auth')
  } else if (dataUser.value) {
    currentUser.value = dataUser.value
    const { data: DataClients } = await apiServices('/api/client').get().json()

    DataClients.value && (treeDataClients.value = DataClients.value)
    selectedClient.value = urlSearchParams.clientId || currentUser.value?.client_id
  }
})

watch(
  isAuthenticated,
  async (value: any) => {
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
      <LayoutSider class="!absolute !top-0 !md:block !md:relative" />
      <a-layout>
        <router-view />
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<style lang="less">
.ant-menu.ant-menu-vertical.ant-menu-root {

  >.ant-menu-item,
  .ant-menu-submenu.ant-menu-submenu-vertical,
  .ant-menu-vertical .ant-menu-submenu-title,
  .ant-menu-vertical>.ant-menu-submenu>.ant-menu-submenu-title {
    &:first-child {
      @apply mt-0;
    }

    @apply  !h-55px !leading-55px;
  }
}

.ant-menu-vertical>.ant-menu-submenu>.ant-menu-submenu-title {
  @apply  !h-55px !leading-55px;
}

.ant-tooltip.ant-menu-inline-collapsed-tooltip {
  .ant-tooltip-inner {
    >span {
      @apply flex items-center;
    }

    .anticon {
      @apply mr-1;
    }
  }
}

.ant-tabs-nav {
  @apply  !mb-0;
}
</style>
