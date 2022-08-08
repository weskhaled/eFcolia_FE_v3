<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

import { api as apiServices, urlSearchParams } from '~/common/composables'
import { mdAndLarger, selectedClient, sideCollapsed, treeDataClients } from '~/common/stores'

// import { devices, devicesCount, devicesLoading, mdAndLarger, selectedClient, selectedDevice, sideCollapsed, treeDataClients } from '~/common/stores'

const users = ref<any>([])
const usersLoading = ref<any>(true)
const isNewUser = ref<any>(true)
const objectTypes = ref<any>(null)
const selectedUser = ref<any>(null)
const userDetails = ref<any>(null)

const activeTabKey = ref<any>()
const visibleUserFormModal = ref<any>(false)

const usesListRef = ref<HTMLElement | null>(null)
const userDetailsRef = ref<HTMLElement | null>(null)

const { height: windowHeight } = useWindowSize()
const { arrivedState } = useScroll(usesListRef)
const { top, bottom } = toRefs(arrivedState)
const { height: alertDetailsRefHeight } = useElementSize(userDetailsRef)

const getUsers = () => {
  usersLoading.value = true
  apiServices(`/api/contact/${selectedClient.value}`).get().json().then(({ data }) => {
    users.value = data.value

    if (users.value.length)
      selectedUser.value = users.value[0]
  })

  usersLoading.value = false
}

watch(() => selectedClient.value, (val) => {
  if (!val)
    return

  urlSearchParams.clientId = val || null
  getUsers()
}, {
  immediate: true,
})

watch(() => selectedUser.value, async (val) => {
  if (!val)
    return

  userDetails.value = null
  const { data } = await apiServices(`/api/user/${val.id}`).get().json()
  data.value && (userDetails.value = data.value)
}, {
  immediate: true,
})



const addOrUpdateUser = async (formData: any) => {
  if (formData.id !== null) {
    const { error, statusCode } = await apiServices('/api/user').put(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Updated`)
  }

  else {
    delete formData.id
    const { error, statusCode } = await apiServices('/api/user').post(formData).json()
    if (statusCode.value !== 200)
      message.error(`${error.value}`)
    else
      message.info(`Alert: ${formData.name} Added`)
  }

  visibleUserFormModal.value = false
  getUsers()
}

const deleteUser = (user: any) => {
  const { id: userId, lastname } = user

  const userIndex = users.value.findIndex(u => u?.id === userId)
  Modal.confirm({
    title: h('span', ['Do you want to delete these items? ', h('br'), h('span', { style: 'font-weight: 100;' }, lastname)]),
    icon: h('span', { class: 'i-ant-design-exclamation-circle-outlined anticon mr-1' }),
    content: 'When clicked the OK button, this device will removed',
    onOk() {
      return apiServices(`/api/user/${userId}`, { immediate: false }).delete().execute().then(() => userIndex && (delete users.value[userIndex])).catch(error => message.error(error))
    },
    cancelText: 'Cancel',
    onCancel() {
    },
  })
}
onMounted(() => {
  sideCollapsed.value = false
  apiServices(`/api/objectType`).get().json().then(({ data }) => objectTypes.value = data.value)
})
</script>

<template>
  <div class="h-full" :class="mdAndLarger ? 'flex' : 'flex-col'">
    <div class="bg-white dark:bg-dark-800 relative max-h-[calc(100vh-50px)] md:max-h-full md:h-full"
      :class="users.length ? 'w-full md:w-370px' : 'w-full'">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center">
        <h3 class="pl-15 md:pl-0 text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          {{ users.length }} Users
        </h3>
        <a-button class="flex items-center justify-center ml-0 flex-grow-0 ml-2" type="primary" size="small"
          @click="() => { isNewUser = true; visibleUserFormModal = true }">
          <template #icon>
            <span class="anticon i-carbon-add block text-base" />
          </template>
        </a-button>
      </div>
      <div v-if="users.length" :class="!top ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute top-12 z-20 w-full h-5 transition-all"
        style="box-shadow: inset 0px 10px 8px -8px rgba(0,0,0,0.2);" />
      <div ref="alertsListRef" class="overflow-y-scroll max-h-[calc(100vh-155px)]"
        :style="[`max-height: calc(${mdAndLarger ? (alertDetailsRefHeight > windowHeight ? alertDetailsRefHeight + 15 + 'px' : windowHeight - 105 + 'px') : '100vh - 155px'})`]">
        <div v-for="(user, index) in users.filter(f => f.id)" :key="user.id"
          class="mb-1 p-2 flex items-center mx-1 rounded-sm cursor-pointer"
          :class="[index === 0 && 'mt-1', (selectedUser && (selectedUser.id === user.id)) ? 'bg-light-900 dark:bg-dark-400' : 'bg-light-500 dark:bg-dark-700']"
          @click="selectedUser = user">
          <span class="i-carbon-warning-alt-filled text-yellow-500 text-sm block mr-1 flex-grow-0 items-center" />
          <span class="capitalize text-sm">
            {{ user.firstname }}
            <span class="text-gray-400 dark:text-gray-500">
              {{ user.lastname }}
            </span>
          </span>
          <a-button danger class="flex items-center justify-center ml-auto flex-grow-0 ml-2" type="primary" size="small"
            @click.stop="deleteUser(user)">
            <template #icon>
              <span class="anticon i-carbon-close-outline block text-base" />
            </template>
          </a-button>
        </div>
      </div>
      <div v-if="usersLoading"
        class="w-full h-full bg-dark-500/10 z-44 items-center justify-center absolute top-0 left-0 pointer-events-auto flex">
        <span class="i-ant-design-loading-outlined text-blue-800 dark:text-blue-200 text-2xl anticon-spin" />
      </div>
      <a-result v-if="!users.length && !usersLoading" status="404" title="No alerts for this Client"
        sub-title="Sorry, the page you visited does not exist.">
        <template #extra>
          <a-button type="primary">
            Back Home
          </a-button>
        </template>
      </a-result>
      <div v-if="users.length" :class="!bottom ? 'opacity-100%' : 'opacity-0'"
        class="pointer-events-none absolute bottom-0 z-21 w-full h-5 transition-all"
        style="box-shadow: inset 0px -8px 8px -8px rgba(0,0,0,1);" />
    </div>
    <div v-show="users.length && selectedUser"
      class="w-full md:w-[calc(100%-370px)] bg-white border-l-1px border-light-600 dark:bg-dark-800 dark:border-dark-900">
      <div
        class="flex border-light-600 dark:border-dark-900 border-b text-sm leading-15px p-2 m-0 bg-light-300 dark:bg-dark-700 w-full items-center">
        <h3 class="text-sm leading-32px dark:text-light-400 mr-auto my-auto">
          Details
        </h3>
      </div>
      <div ref="userDetailsRef" class="p-0">
        <a-skeleton class="p-3" v-if="!userDetails" active />
        <a-descriptions v-if="users.length && selectedUser && userDetails" class="p-2">
          <a-descriptions-item label="Firstname">
            {{ userDetails.firstname || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="Lastname">
            {{ userDetails?.lastname || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="Post">
            {{ userDetails?.post || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="Login">
            {{ selectedUser.login }}
          </a-descriptions-item>
          <a-descriptions-item label="Creation Date">
            {{ selectedUser.begindate || '--' }}
          </a-descriptions-item>
        </a-descriptions>
        <div v-if="userDetails">
          <a-tabs v-model:activeKey="activeTabKey">
            <a-tab-pane key="1" tab="Permissions">
              <a-table :scroll="{ x: 450, y: windowHeight - 340 }" size="small" :loading="!userDetails"
                :data-source="userDetails.permissions || []" :pagination="false" :columns="[{
                  title: 'Fonction',
                  dataIndex: 'objecttype',
                  key: 'objecttype',
                },
                {
                  title: 'Consulter',
                  dataIndex: 'permission',
                  key: 'r',
                },
                {
                  title: 'Créer',
                  dataIndex: 'permission',
                  key: 'n',
                },
                {
                  title: 'Modifier',
                  dataIndex: 'permission',
                  key: 'm',
                },
                {
                  title: 'Supprimer',
                  dataIndex: 'permission',
                  key: 'd',
                },
                {
                  title: 'Tous',
                  dataIndex: 'permission',
                  key: 'all',
                },
                ]">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'r'">
                    <a-switch :checkedValue="!(record.permission?.indexOf('r') > -1) || false" size="small" />
                  </template>
                  <template v-else-if="column.key === 'n'">
                    <a-switch :checkedValue="!(record.permission?.indexOf('n') > -1) || false" size="small" />
                  </template>
                  <template v-else-if="column.key === 'm'">
                    <a-switch :checkedValue="!(record.permission?.indexOf('m') > -1) || false" size="small" />
                  </template>
                  <template v-else-if="column.key === 'd'">
                    <a-switch :checkedValue="!(record.permission?.indexOf('d') > -1) || false" size="small" />
                  </template>
                  <template v-else-if="column.key === 'all'">
                    <a-switch :checkedValue="!(record.permission?.indexOf('rnmd') > -1) || false" size="small" />
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
          <div class="flex justify-end p-3">
            <a-button type="primary" class="flex items-center" @click="() => {
              isNewUser = false
              visibleUserFormModal = true
            }">
              <span class="i-carbon-edit inline-block text-white text-md mr-1" />
              Update
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <UserFormModal v-model:visible="visibleUserFormModal" :clients="treeDataClients" :object-types="objectTypes"
    :user="selectedUser && userDetails && !isNewUser ? userDetails : null" @addOrUpdateUser="addOrUpdateUser" />
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
