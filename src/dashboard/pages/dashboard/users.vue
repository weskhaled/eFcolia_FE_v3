<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

import { api as apiServices, urlSearchParams } from '~/common/composables'
import { mdAndLarger, selectedClient, sideCollapsed } from '~/common/stores'

const flottes = ref<any>([])
const flottesLoading = ref<any>(true)
const selectedFlotte = ref<any>(null)
const alertDeviceAndFlottes = ref<any>(null)
const alertConditions = ref<any>(null)
const alertActions = ref<any>(null)
const activeTabKey = ref<any>()
const visibleAlertFormModal = ref<any>(false)

const alertsListRef = ref<HTMLElement | null>(null)
const alertDetailsRef = ref<HTMLElement | null>(null)

const { height: windowHeight } = useWindowSize()
const { arrivedState } = useScroll(alertsListRef)
const { top, bottom } = toRefs(arrivedState)
const { height: alertDetailsRefHeight } = useElementSize(alertDetailsRef)

const getFlottes = () => {
  flottesLoading.value = true
  apiServices(`/api/client/${selectedClient.value}/childs`).get().json().then(({ data }) => flottes.value = data.value)

  flottesLoading.value = false
}
watch(() => selectedFlotte.value, (val) => {
  if (!val.id)
    return

  alertDeviceAndFlottes.value = null
  alertConditions.value = null
  alertActions.value = null
  apiServices(`/api/alertDeviceAndFlotte/${val.id}`).get().json().then(({ data }) => alertDeviceAndFlottes.value = data.value)
  apiServices(`/api/alertCondition/${val.id}`).get().json().then(({ data }) => alertConditions.value = data.value)
  apiServices(`/api/alertAction/${val.id}`).get().json().then(({ data }) => alertActions.value = data.value)
})
watch(() => selectedClient.value, (val) => {
  if (!val)
    return

  urlSearchParams.clientId = val || null
  getFlottes()
}, {
  immediate: true,
})

const addOrUpdateAlert = async (formData: any) => {
  if (formData.id !== null) {
    const { error, statusCode } = await apiServices('/api/alert').put(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Updated`)
  }

  else {
    delete formData.id
    const { error, statusCode } = await apiServices('/api/alert').post(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Added`)
  }

  visibleAlertFormModal.value = false
  getFlottes()
}

const deleteAlert = (flotte: any) => {
  const { client_id, name } = flotte

  const flotteIndex = flottes.value.findIndex(f => d?.client_id === client_id)
  Modal.confirm({
    title: h('span', ['Do you want to delete these items? ', h('br'), h('span', { style: 'font-weight: 100;' }, name)]),
    icon: h('span', { class: 'i-ant-design-exclamation-circle-outlined anticon mr-1' }),
    content: 'When clicked the OK button, this device will removed',
    onOk() {
      return apiServices(`/api/alert/${client_id}`, { immediate: false }).delete().execute().then(() => flotteIndex && (delete flottes.value[flotteIndex])).catch(error => message.error(error))
    },
    cancelText: 'Cancel',
    onCancel() {
    },
  })
}
onMounted(() => {
  sideCollapsed.value = false
})
</script>

<template>
  <div class="h-full" :class="mdAndLarger ? 'flex' : 'flex-col'">
    <div class="bg-white dark:bg-dark-800 relative max-h-[calc(100vh-50px)] md:max-h-full md:h-full"
      :class="flottes.length ? 'w-full md:w-370px' : 'w-full'">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center">
        <h3 class="pl-15 md:pl-0 text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          {{ flottes.length }} Alerts
        </h3>
        <a-button class="flex items-center justify-center ml-0 flex-grow-0 ml-2" type="primary" size="small"
          @click="() => visibleAlertFormModal = true">
          <template #icon>
            <span class="anticon i-carbon-add block text-base" />
          </template>
        </a-button>
      </div>
      <div v-if="flottes.length" :class="!top ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute top-12 z-20 w-full h-5 transition-all"
        style="box-shadow: inset 0px 10px 8px -8px rgba(0,0,0,0.2);" />
      <div ref="alertsListRef" class="overflow-y-scroll max-h-[calc(100vh-155px)]"
        :style="[`max-height: calc(${mdAndLarger ? (alertDetailsRefHeight > windowHeight ? alertDetailsRefHeight + 15 + 'px' : windowHeight - 105 + 'px') : '100vh - 155px'})`]">
        <div v-for="(flotte, index) in flottes.filter(f => f.client_id)" :key="flotte.client_id"
          class="mb-1 p-2 flex items-center mx-1 rounded-sm cursor-pointer"
          :class="[index === 0 && 'mt-1', (selectedFlotte && (selectedFlotte.client_id === flotte.client_id)) ? 'bg-light-900 dark:bg-dark-400' : 'bg-light-500 dark:bg-dark-700']"
          @click="selectedFlotte = flotte">
          <span class="i-carbon-warning-alt-filled text-yellow-500 text-sm block mr-1 flex-grow-0 items-center" />
          <span class="capitalize text-sm">
            {{ flotte.commercialname }}
          </span>
          <a-button danger class="flex items-center justify-center ml-auto flex-grow-0 ml-2" type="primary" size="small"
            @click.stop="deleteAlert(flotte)">
            <template #icon>
              <span class="anticon i-carbon-close-outline block text-base" />
            </template>
          </a-button>
        </div>
      </div>
      <div v-if="flottesLoading"
        class="w-full h-full bg-dark-500/10 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex">
        <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-200 text-2xl anticon-spin" />
      </div>
      <a-result v-if="!flottes.length && !flottesLoading" status="404" title="No alerts for this Client"
        sub-title="Sorry, the page you visited does not exist.">
        <template #extra>
          <a-button type="primary">
            Back Home
          </a-button>
        </template>
      </a-result>
      <div v-if="flottes.length" :class="!bottom ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute bottom-0 z-21 w-full h-5 transition-all"
        style="box-shadow: inset 0px -8px 8px -8px rgba(0,0,0,1);" />
    </div>
    <div v-show="flottes.length && selectedFlotte"
      class="w-full md:w-[calc(100%-370px)] bg-white border-l-1px border-light-600 dark:bg-dark-800 dark:border-dark-900">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center">
        <h3 class="text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          Details
        </h3>
      </div>
      <div ref="alertDetailsRef" class="p-0">
        <a-descriptions v-if="flottes.length && selectedFlotte" class="p-2">
          <a-descriptions-item label="Name">
            {{ selectedFlotte.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Description">
            {{ selectedFlotte.description }}
          </a-descriptions-item>
          <a-descriptions-item label="Active">
            <a-badge :status="selectedFlotte.status === 1 ? 'processing' : 'error'"
              :text="selectedFlotte.status === 1 ? 'Yes' : 'No'" />
          </a-descriptions-item>
          <a-descriptions-item label="From">
            {{ selectedFlotte.begindate }}
          </a-descriptions-item>
          <a-descriptions-item label="To">
            {{ selectedFlotte.enddate }}
          </a-descriptions-item>
          <a-descriptions-item label="Importance">
            {{
                selectedFlotte.level === 3
                  ? 'Danger'
                  : selectedFlotte.level === 2
                    ? 'Warning'
                    : 'Normal'
            }}
          </a-descriptions-item>
        </a-descriptions>
        <div>
          <a-tabs v-model:activeKey="activeTabKey">
            <a-tab-pane key="1" tab="Alertes et flottes">
              <a-table :scroll="{ x: 450, y: windowHeight - 362 }" size="small" :loading="!alertDeviceAndFlottes"
                :data-source="alertDeviceAndFlottes || []" :columns="[{
                  title: 'Nom alerte',
                  dataIndex: 'alertName',
                  key: 'alertName',
                },
                {
                  title: 'Nom device',
                  dataIndex: 'deviceName',
                  key: 'deviceName',
                },
                {
                  title: 'Nom flotte',
                  dataIndex: 'flotteName',
                  key: 'flotteName',
                },
                {
                  title: 'Type d\'objet',
                  dataIndex: 'objectType',
                  key: 'objectType',
                },]">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'objectType'">
                    <span class="flex items-center">
                      <span :class="record.objectType === 'device' ? 'i-carbon-copy-file' : 'i-carbon-folder-details'"
                        class="inline-block text-sm mr-1" /> {{ record.objectType }}
                    </span>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="Exigences">
              <a-table size="small" :loading="!alertConditions" :data-source="alertConditions || []" :columns="[{
                title: 'Relation',
                dataIndex: 'relation',
                key: 'relation',
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
              },
              {
                title: 'Cible',
                dataIndex: 'target',
                key: 'target',
              },
              {
                title: 'Operateur',
                dataIndex: 'operator',
                key: 'operator',
              },
              {
                title: 'Valeur',
                dataIndex: 'value',
                key: 'value',
              },]" />
            </a-tab-pane>
            <a-tab-pane key="3" tab="Action">
              <a-table size="small" :loading="!alertActions" :data-source="alertActions || []" :columns="[{
                title: 'Name',
                dataIndex: 'alertName',
                key: 'alertName',
              },
              {
                title: 'deviceName',
                dataIndex: 'deviceName',
                key: 'deviceName',
              },
              {
                title: 'objectId',
                dataIndex: 'objectId',
                key: 'objectId',
              },]" />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
  <AlertFormModal v-model:visible="visibleAlertFormModal" @addOrUpdateAlert="addOrUpdateAlert" />
</template>
<style lang="less">
.ant-tabs-tab {
  @apply  !px-1;
}

.ant-table-pagination.ant-pagination {
  @apply m-2;
}
</style>
<route lang="yaml">
meta:
  layout: admin
</route>
