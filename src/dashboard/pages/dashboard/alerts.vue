<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

import { api as apiServices, urlSearchParams } from '~/common/composables'
import { mdAndLarger, selectedClient, sideCollapsed } from '~/common/stores'

const alerts = ref<any>([])
const alertsLoading = ref<any>(true)
const selectedAlert = ref<any>(null)
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

const getAlerts = async() => {
  alertsLoading.value = true
  const { data } = await apiServices(`/api/alert/byClientId/${selectedClient.value}`).get().json()
  if (data.value) {
    alerts.value = data.value
    if (alerts.value.length)
      selectedAlert.value = alerts.value[0]
  }
  alertsLoading.value = false
}
watch(() => selectedAlert.value, (val) => {
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
  getAlerts()
}, {
  immediate: true,
})
const addAlert = async(alertData) => {
  console.log(alertData)
}
const deleteAlert = (alert) => {
  const { id, name } = alert

  const alertIndex = alerts.value.findIndex(d => d?.id === id)
  Modal.confirm({
    title: h('span', ['Do you want to delete these items? ', h('br'), h('span', { style: 'font-weight: 100;' }, name)]),
    icon: h('span', { class: 'i-ant-design-exclamation-circle-outlined anticon mr-1' }),
    content: 'When clicked the OK button, this device will removed',
    onOk() {
      return apiServices(`/api/alert/${id}`, { immediate: false }).delete().execute().then(() => alertIndex && (delete alerts.value[alertIndex])).catch(error => message.error(error))
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
    <div
      class="bg-white dark:bg-dark-800 relative max-h-[calc(100vh-50px)] md:max-h-full md:h-full"
      :class="alerts.length ? 'w-full md:w-370px' : 'w-full'"
    >
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center"
      >
        <h3 class="pl-15 md:pl-0 text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          {{ alerts.length }} Alerts
        </h3>
        <a-button
          v-if="mdAndLarger" class="flex items-center justify-center ml-0 flex-grow-0 ml-2" type="primary"
          size="small" @click="() => visibleAlertFormModal = true"
        >
          <template #icon>
            <span class="anticon i-carbon-add block text-base" />
          </template>
        </a-button>
      </div>
      <div
        v-if="alerts.length" :class="!top ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute top-12 z-20 w-full h-5 transition-all"
        style="box-shadow: inset 0px 10px 8px -8px rgba(0,0,0,0.2);"
      />
      <div
        ref="alertsListRef" class="overflow-y-scroll max-h-[calc(100vh-155px)]"
        :style="[`max-height: calc(${mdAndLarger ? (alertDetailsRefHeight > windowHeight ? alertDetailsRefHeight + 15 + 'px' : windowHeight - 105 + 'px') : '100vh - 155px'})`]"
      >
        <div
          v-for="(alert, index) in alerts.filter(a => a.id)" :key="alert.id" class="mb-1 p-2 flex items-center mx-1 rounded-sm cursor-pointer"
          :class="[index === 0 && 'mt-1', (selectedAlert && (selectedAlert.id === alert.id)) ? 'bg-light-900 dark:bg-dark-400' : 'bg-light-500 dark:bg-dark-700']"
          @click="selectedAlert = alert"
        >
          <span class="i-carbon-warning-alt-filled text-yellow-500 text-sm block mr-1 flex-grow-0 items-center" />
          <span class="capitalize text-sm">
            {{ alert.name }}
          </span>
          <a-button
            danger
            class="flex items-center justify-center ml-auto flex-grow-0 ml-2" type="primary"
            size="small" @click.stop="deleteAlert(alert)"
          >
            <template #icon>
              <span class="anticon i-carbon-close-outline block text-base" />
            </template>
          </a-button>
        </div>
      </div>
      <div
        v-if="alertsLoading"
        class="w-full h-full bg-dark-500/10 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex"
      >
        <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-200 text-2xl anticon-spin" />
      </div>
      <a-result
        v-if="!alerts.length && !alertsLoading" status="404" title="No alerts for this Client"
        sub-title="Sorry, the page you visited does not exist."
      >
        <template #extra>
          <a-button type="primary">
            Back Home
          </a-button>
        </template>
      </a-result>
      <div
        v-if="alerts.length" :class="!bottom ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute bottom-0 z-21 w-full h-5 transition-all"
        style="box-shadow: inset 0px -8px 8px -8px rgba(0,0,0,1);"
      />
    </div>
    <div
      v-show="alerts.length && selectedAlert"
      class="w-full md:w-[calc(100%-370px)] bg-white border-l-1px border-light-600 dark:bg-dark-800 dark:border-dark-900"
    >
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center"
      >
        <h3 class="text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          Details
        </h3>
      </div>
      <div ref="alertDetailsRef" class="p-0">
        <a-descriptions v-if="alerts.length && selectedAlert" class="p-2">
          <a-descriptions-item label="Name">
            {{ selectedAlert.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Description">
            {{ selectedAlert.description }}
          </a-descriptions-item>
          <a-descriptions-item label="Active">
            <a-badge
              :status="selectedAlert.status === 1 ? 'processing' : 'error'"
              :text="selectedAlert.status === 1 ? 'Yes' : 'No'"
            />
          </a-descriptions-item>
          <a-descriptions-item label="From">
            {{ selectedAlert.begindate }}
          </a-descriptions-item>
          <a-descriptions-item label="To">
            {{ selectedAlert.enddate }}
          </a-descriptions-item>
          <a-descriptions-item label="Importance">
            {{
              selectedAlert.level === 3
                ? 'Danger'
                : selectedAlert.level === 2
                  ? 'Warning'
                  : 'Normal'
            }}
          </a-descriptions-item>
        </a-descriptions>
        <div>
          <a-tabs v-model:activeKey="activeTabKey">
            <a-tab-pane key="1" tab="Alertes et flottes">
              <a-table
                :scroll="{ x: 450, y: windowHeight - 362 }" size="small" :loading="!alertDeviceAndFlottes"
                :data-source="alertDeviceAndFlottes || []"
                :columns="[{
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
                           },]"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'objectType'">
                    <span class="flex items-center">
                      <span
                        :class="record.objectType === 'device' ? 'i-carbon-copy-file' : 'i-carbon-folder-details'"
                        class="inline-block text-sm mr-1"
                      /> {{ record.objectType }}
                    </span>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="Exigences">
              <a-table
                size="small" :loading="!alertConditions" :data-source="alertConditions || []" :columns="[{
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
                                                                                                         },]"
              />
            </a-tab-pane>
            <a-tab-pane key="3" tab="Action">
              <a-table
                size="small" :loading="!alertActions" :data-source="alertActions || []" :columns="[{
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
                                                                                                   },]"
              />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
  <AlertFormModal
    v-model:visible="visibleAlertFormModal" :selected-client="selectedClient" @addAlert="addAlert"
  />
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
