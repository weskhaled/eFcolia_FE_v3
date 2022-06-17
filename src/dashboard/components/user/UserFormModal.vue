<script setup lang="ts">
import dayjs from 'dayjs'
import { Form, message } from 'ant-design-vue'
import { selectedClient } from '~/common/stores'
import { api as apiServices } from '~/common/composables'

interface Props {
  client?: Ref<any>
  countries?: Ref<any>
  clientTypes?: Ref<any>
}
const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm')

const props = withDefaults(defineProps<Props>(), {
  client: () => ref(null),
})
const emit = defineEmits(['addOrUpdateClient'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef = reactive({
  commercialName: '',
  parentId: +selectedClient.value,
  country: null,
  clientType: null,
  clientTypeId: null,
  status: 0,
  description: '',
})
const rulesRef = reactive({
  commercialName: [
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
        commercialName,
        parentId,
        country,
        clientType,
        status,
        description,
      } = toRaw(modelRef)
      const formData = {
        client_id: props.client?.client_id || null,
        commercialName,
        parentId,
        country,
        clientType,
        status,
        description,
      }

      emit('addOrUpdateClient', formData)
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.client) {
    const { commercialname: commercialName, parentclient_id: parentId, clientType, country, clientstatus: status, description } = props.client
    modelRef.commercialName = commercialName
    modelRef.parentId = +parentId || selectedClient.value
    modelRef.clientType = clientType
    modelRef.country = country
    modelRef.status = status || 0
    modelRef.description = description || ''
  }
  else {
    resetFields()
    modelRef.parentId = +selectedClient.value
  }
}
watch(() => props.client, (val) => {
  resetForm()
})

// onMounted(async () => {
// })
</script>

<template>
  <a-modal width="55%" style="top: 70px" destroy-on-close :body-style="{ padding: 0 }" @after-close="resetFields()">
    <template #title>
      <span>
        {{ client?.commercialName ? `Update ${client.commercialName}` : 'Add' }}
      </span>
    </template>
    <div class="min-h-70 max-h-[calc(100vh-300px)] overflow-scroll p-5 pb-1">
      <a-form layout="vertical">
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="Name" v-bind="validateInfos.commercialName">
            <a-input v-model:value="modelRef.commercialName" />
          </a-form-item>
          <a-form-item label="country">
            <a-select v-model:value="modelRef.country" :options="countries" />
          </a-form-item>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="clientType">
            <a-select v-model:value="modelRef.clientType"
              :options="clientTypes" />
          </a-form-item>
          <a-form-item label="status" v-bind="validateInfos.status">
            <a-switch v-model:checked="modelRef.status" :un-checked-value="0" :checked-value="1" />
          </a-form-item>
        </div>

        <div class="grid-cols-1 grid gap-0">
          <a-form-item label="Description" v-bind="validateInfos.description">
            <a-textarea v-model:value="modelRef.description" :auto-size="{ minRows: 2, maxRows: 5 }"
              placeholder="Description" />
          </a-form-item>
        </div>
      </a-form>
    </div>
    <template #footer>
      <a-form-item class="!mb-0">
        <a-button type="primary" danger @click="resetForm">
          Reset
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ client?.commercialName ? 'Update' : 'Create' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
