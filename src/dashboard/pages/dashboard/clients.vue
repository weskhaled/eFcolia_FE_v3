<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

import { api as apiServices, urlSearchParams } from '~/common/composables'
import { mdAndLarger, selectedClient, sideCollapsed, currentUser } from '~/common/stores'
import { hasPermission } from '~/dashboard/utils'

const flottes = ref<any>([])
const flottesLoading = ref<any>(true)
const selectedFlotte = ref<any>(null)
const clientDetails = ref<any>(null)
const clientDetailsLoading = ref<any>(true)
const updateClient = ref<any>(false)
const countries = ref<any>([])
const clientTypes = ref<any>(null)
const visibleAlertFormModal = ref<any>(false)

const alertsListRef = ref<HTMLElement | null>(null)
const alertDetailsRef = ref<HTMLElement | null>(null)

const { height: windowHeight } = useWindowSize()
const { arrivedState } = useScroll(alertsListRef)
const { top, bottom } = toRefs(arrivedState)
const { height: alertDetailsRefHeight } = useElementSize(alertDetailsRef)

const newOrUpdateClient = computed(() => updateClient.value ? (clientDetails.value || null) : null)
const getClients = () => {
  flottesLoading.value = true
  apiServices(`/api/client/${selectedClient.value}/childs`).get().json().then(({ data }) => {
    flottes.value = data.value

    if (flottes.value.length)
      selectedFlotte.value = flottes.value[0]
  })

  flottesLoading.value = false
}
watch(() => selectedFlotte.value, (val) => {
  if (!val.client_id)
    return

  clientDetailsLoading.value = true
  clientDetails.value = null
  apiServices(`/api/client/${val.client_id}`).get().json().then(({ data }) => {
    clientDetails.value = data.value
    clientDetailsLoading.value = false
  })
})
watch(() => selectedClient.value, (val) => {
  if (!val)
    return

  urlSearchParams.clientId = val || null
  getClients()
}, {
  immediate: true,
})

const addOrUpdateClient = async (formData: any) => {
  if (formData.id !== null) {
    const { error, statusCode } = await apiServices('/api/client').put(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Updated`)
  }

  else {
    delete formData.id
    const { error, statusCode } = await apiServices('/api/client').post(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Added`)
  }

  visibleAlertFormModal.value = false
  getClients()
}

const deleteClient = (flotte: any) => {
  const { client_id, name } = flotte

  const flotteIndex = flottes.value.findIndex(d => d?.client_id === client_id)
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
  countries.value = []
  clientTypes.value = []
  apiServices(`/api/country`).get().json().then(({ data }) => countries.value = data.value.map(c => ({ label: `${c.name} "${c.lang_id}"`, value: `${c.country_id}#${c.lang_id}` })))
  apiServices(`/api/clientType`).get().json().then(({ data }) => clientTypes.value = data.value.map(ct => ({ label: ct.type, value: ct.clienttype_id })))
})
</script>

<template>
  <div class="h-full" :class="mdAndLarger ? 'flex' : 'flex-col'">
    <div class="bg-white dark:bg-dark-800 relative max-h-[calc(100vh-50px)] md:max-h-full md:h-full"
      :class="flottes.length ? 'w-full md:w-370px' : 'w-full'">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center">
        <h3 class="pl-15 md:pl-0 text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          {{ flottes.length }} Clients
        </h3>
        <a-button v-if="currentUser" :disabled="!hasPermission(currentUser.permissions, 'client', 'n')" class="flex items-center justify-center ml-0 flex-grow-0 ml-2" type="primary" size="small"
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
          <a-button :disabled="!hasPermission(currentUser.permissions, 'client', 'd')" danger class="flex items-center justify-center ml-auto flex-grow-0 ml-2" type="primary" size="small"
            @click.stop="deleteClient(flotte)">
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
      <div ref="alertDetailsRef" class="p-0 h-[calc(100%-50px)]">
        <a-skeleton v-if="clientDetailsLoading" active />
        <div v-else-if="flottes.length && selectedFlotte && clientDetails"
          class="flex flex-col justify-between min-h-full">
          <a-descriptions class="p-2">
            <a-descriptions-item label="Nom commercial">
              {{ clientDetails.commercialname }}
            </a-descriptions-item>
            <a-descriptions-item label="Description">
              {{ clientDetails.description }}
            </a-descriptions-item>
            <a-descriptions-item label="Date de début">
              {{ clientDetails.begindate }}
            </a-descriptions-item>
            <a-descriptions-item label="Active">
              <a-badge :status="clientDetails.clientstatus === 1 ? 'processing' : 'error'"
                :text="clientDetails.clientstatus === 1 ? 'Active' : 'Inactive'" />
            </a-descriptions-item>
            <a-descriptions-item label="Pays">
              {{ countries.find(c => c.value.split('#')[0] === clientDetails.country)?.label || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label="Type de client">
              {{ clientTypes.find(ct => ct.value === clientDetails.clientType)?.label || '--' }}
            </a-descriptions-item>
          </a-descriptions>
          <div class="flex justify-end p-3">
            <a-button :disabled="!hasPermission(currentUser.permissions, 'client', 'm')" type="primary" class="flex items-center" @click="() => {
              updateClient = true
              visibleAlertFormModal = true
            }">
              <span class="i-carbon-edit inline-block text-white text-md mr-1" />
              Update
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ClientFormModal v-model:visible="visibleAlertFormModal" :client="newOrUpdateClient" :countries="countries"
    :clientTypes="clientTypes" @addOrUpdateClient="addOrUpdateClient" />
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
