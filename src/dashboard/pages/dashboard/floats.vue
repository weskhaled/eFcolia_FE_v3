<script setup lang="ts">
import { api as apiServices, urlSearchParams } from '~/common/composables'
import { mdAndLarger, selectedClient, sideCollapsed } from '~/common/stores'

const { height: windowHeight } = useWindowSize()
const flottesLoading = ref<any>(false)
const selectedFloat = ref<any>(null)
const flottes = ref<any>(null)

const getFloats = async() => {
  flottesLoading.value = true
  const { data } = await apiServices(`/api/float/byClientId/${selectedClient.value}`).get().json()
  if (data.value)
    flottes.value = data.value

  flottesLoading.value = false
}

watch(() => selectedClient.value, (val) => {
  if (!val)
    return

  urlSearchParams.clientId = val || null
  getFloats()
}, {
  immediate: true,
})

onMounted(() => {
  sideCollapsed.value = false
})
</script>

<template>
  <div class="h-full" :class="mdAndLarger ? 'flex' : 'flex-col'">
    <div class="w-full bg-white dark:bg-dark-800">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center"
      >
        <h3 class="text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          Flottes List
        </h3>
      </div>
      <div class="p-0">
        <div>
          <a-table
            size="small"
            row-key="ensemble_id"
            :scroll="{ x: 450, y: windowHeight - 200 }" :columns="[{
              title: 'Nom',
              dataIndex: 'name',
              key: 'name',
            },{
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
            },{
              title: 'Total',
              dataIndex: 'countDevice',
              key: 'countDevice',
            }]" :data-source="flottes ? flottes.listFlot : []" :loading="flottesLoading" class="components-table-demo-nested"
          >
            <template #bodyCell="{ column }">
              <template v-if="column.key === 'operation'">
                <a>Publish</a>
              </template>
            </template>
            <template #expandedRowRender="{ record }">
              <a-table
                row-key="id"
                size="small" :columns="[{
                  title: 'Nom',
                  dataIndex: 'name',
                  key: 'name',
                },{
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                }]" :data-source="record.listDevices" :pagination="false"
              >
                <template #bodyCell="{ column }">
                  <template v-if="column.key === 'state'">
                    <span>
                      <a-badge status="success" />
                      Finished
                    </span>
                  </template>
                  <template v-else-if="column.key === 'operation'">
                    <span class="table-operation">
                      <a>Pause</a>
                      <a>Stop</a>
                      <a-dropdown>
                        <template #overlay>
                          <a-menu>
                            <a-menu-item>Action 1</a-menu-item>
                            <a-menu-item>Action 2</a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </span>
                  </template>
                </template>
              </a-table>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.ant-tabs-tab {
  @apply px-1;
}

.ant-table-pagination.ant-pagination {
  @apply m-2;
}
</style>
<route lang="yaml">
meta:
  layout: admin
</route>
