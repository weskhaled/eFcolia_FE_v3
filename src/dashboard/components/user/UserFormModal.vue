<script setup lang="ts">
import dayjs from 'dayjs'
import { Form, message } from 'ant-design-vue'
import { selectedClient, mdAndLarger } from '~/common/stores'
import { api as apiServices } from '~/common/composables'

interface Props {
  user?: Ref<any>
  clients?: Ref<any[]>
  objectTypes?: Ref<any[]>
}
const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm')

const props = withDefaults(defineProps<Props>(), {
  user: () => ref(null),
  clients: () => ref([]),
  objectTypes: () => ref([]),
})
const emit = defineEmits(['addOrUpdateUser'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef: any = reactive({
  id: null,
  firstname: '',
  lastname: '',
  clientId: null,
  login: '',
  password: '',
  begindate: null,
  permissions: []
})
const rulesRef = reactive({
  lastname: [
    {
      required: true,
      message: 'Please input name',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      const {
        id,
        firstname,
        lastname,
        login,
        clientId,
        password,
        permissions
      } = toRaw(modelRef)
      const formData = {
        id,
        clientId: clientId || +selectedClient.value,
        firstname,
        lastname,
        login,
        password,
        permissions: permissions.map((p) => ({
          objectType: p.objecttype,
          permission: convertToPermission(p.r, p.n, p.m, p.d),
        }))
      }

      emit('addOrUpdateUser', formData)
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.user) {
    const { user_id, firstname, lastname, client_id: clientId, login, begindate, permissions } = props.user
    modelRef.id = user_id
    modelRef.firstname = firstname
    modelRef.lastname = lastname
    modelRef.begindate = begindate
    modelRef.clientId = clientId
    modelRef.login = login
    modelRef.permissions = permissions.map((o) => ({
      objecttype: o.objecttype,
      r:
        permissions
          .find((p) => p.objecttype === o.objecttype)
          ?.permission?.indexOf('r') > -1,
      n:
        permissions
          .find((p) => p.objecttype === o.objecttype)
          ?.permission?.indexOf('n') > -1,
      m:
        permissions
          .find((p) => p.objecttype === o.objecttype)
          ?.permission?.indexOf('m') > -1,
      d:
        permissions
          .find((p) => p.objecttype === o.objecttype)
          ?.permission?.indexOf('d') > -1,
      allPermissions:
        permissions
          .find((p) => p.objecttype === o.objecttype)
          ?.permission?.indexOf('rnmd') > -1,
    }))
  }
  else {
    resetFields()
    modelRef.id = null
    modelRef.clientId = +selectedClient.value

    modelRef.permissions = props.objectTypes.map((o) => ({
      objecttype: o.objecttype,
      r: false,
      n: false,
      m: false,
      d: false,
      allPermissions: false,
    }))
  }
}
const convertToPermission = (r, n, m, d) => {
  let s = ''

  r && (s += 'r')
  n && (s += 'n')
  m && (s += 'm')
  d && (s += 'd')

  return s
}
watch(() => props.user, () => {
  resetForm()
})
watch(() => props.objectTypes, (value) => {
  if (!value) return

  modelRef.permissions = value.map((o) => ({
    objecttype: o.objecttype,
    r: false,
    n: false,
    m: false,
    d: false,
    allPermissions: false,
  }))
})

const changePermissions = (__val, objectType) => {
  const valueobjectType = modelRef.permissions.find(p => p.objecttype === objectType)

  valueobjectType.allPermissions = valueobjectType.r && valueobjectType.n && valueobjectType.m && valueobjectType.d
}
const toggleAllPremission = (value, objectType) => {
  const valueobjectType = modelRef.permissions.find(p => p.objecttype === objectType)

  valueobjectType.r = value
  valueobjectType.n = value
  valueobjectType.m = value
  valueobjectType.d = value
  valueobjectType.allPermissions = value
}
// onMounted(async () => {
//   console.log(props.objectTypes)
// })
</script>

<template>
  <a-modal :width="mdAndLarger ? '65%' : '95%'" :style="{ top: mdAndLarger ? '70px' : '45px' }" destroy-on-close :body-style="{ padding: 0 }"
    @after-close="resetFields()">
    <template #title>
      <span>
        {{ user?.firstname ? `Update ${user.firstname}` : 'Add' }}
      </span>
    </template>
    <div class="min-h-70 max-h-[calc(100vh-300px)] overflow-scroll p-5 pb-1">
      <a-form layout="vertical">
        <div class="sm:grid-cols-2 grid gap-4">
          <a-form-item label="First Name">
            <a-input v-model:value="modelRef.firstname" />
          </a-form-item>
          <a-form-item label="Last Name" v-bind="validateInfos.lastname">
            <a-input v-model:value="modelRef.lastname" />
          </a-form-item>
        </div>
        <div class="sm:grid-cols-2 grid gap-4">
          <a-form-item label="Login" v-bind="validateInfos.login">
            <a-input v-model:value="modelRef.login" />
          </a-form-item>
          <a-form-item label="Password" v-bind="validateInfos.password">
            <a-input v-model:value="modelRef.password" />
          </a-form-item>
        </div>

        <div class="grid-cols-1 grid gap-4">
          <a-form-item label="Client" v-bind="validateInfos.clientId">
            <a-tree-select v-model:value="modelRef.clientId" show-search class="w-full md:min-w-70"
              tree-node-filter-prop="title" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="Please select a client" :tree-default-expand-all="false" tree-data-simple-mode
              :disabled="!clients" :tree-data="clients" :height="235" virtual>
              <template #title="{ title }">
                {{ title }}
              </template>
            </a-tree-select>
          </a-form-item>
        </div>
        <div>
          <a-tabs>
            <a-tab-pane key="1" tab="Permissions">
              <a-table :scroll="{ x: 450, y: 340 }" size="small" :loading="!objectTypes"
                :data-source="modelRef.permissions || []" :pagination="false" :columns="[{
                  title: 'Fonction',
                  dataIndex: 'objecttype',
                  key: 'objecttype',
                },
                {
                  title: 'Consulter',
                  dataIndex: 'r',
                  key: 'r',
                },
                {
                  title: 'Créer',
                  dataIndex: 'n',
                  key: 'n',
                },
                {
                  title: 'Modifier',
                  dataIndex: 'm',
                  key: 'm',
                },
                {
                  title: 'Supprimer',
                  dataIndex: 'd',
                  key: 'd',
                },
                {
                  title: 'Tous',
                  dataIndex: 'allPermissions',
                  key: 'allPermissions',
                },
                ]">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'r'">
                    <a-switch v-model:checked="record.r" size="small"
                      @change="(val) => changePermissions(val, record.objecttype)" />
                  </template>
                  <template v-else-if="column.key === 'n'">
                    <a-switch v-model:checked="record.n" size="small"
                      @change="(val) => changePermissions(val, record.objecttype)" />
                  </template>
                  <template v-else-if="column.key === 'm'">
                    <a-switch v-model:checked="record.m" size="small"
                      @change="(val) => changePermissions(val, record.objecttype)" />
                  </template>
                  <template v-else-if="column.key === 'd'">
                    <a-switch v-model:checked="record.d" size="small"
                      @change="(val) => changePermissions(val, record.objecttype)" />
                  </template>
                  <template v-else-if="column.key === 'allPermissions'">
                    <a-switch v-model:checked="record.allPermissions"
                      @change="(value) => toggleAllPremission(value, record.objecttype)" size="small" />
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-form>
    </div>
    <template #footer>
      <a-form-item class="!mb-0">
        <a-button type="primary" danger @click="resetForm">
          Reset
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ user?.firstname ? 'Update' : 'Create' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
