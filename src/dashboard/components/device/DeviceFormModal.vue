<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import dayjs from 'dayjs'
import { Form } from 'ant-design-vue'
import { selectedClient } from '~/common/stores'
import { api as apiServices } from '~/common/composables'

const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm')
// const { setupContext } = getCurrentInstance()
interface Props {
  device?: Ref<any>
  clients: Ref<any[]>
  devicetypes: Ref<any[]>
  simcards: Ref<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  device: () => ref(null),
  clients: () => ref([]),
  devicetypes: () => ref([]),
  simcards: () => ref([]),
})
const emit = defineEmits(['addOrUpdateDevice'])

const { t } = useI18n()
const useForm = Form.useForm
const privacies = [
  {
    value: 'aucun', label: 'Aucun',
  },
  {
    value: 'input1', label: 'Input 1',
  },
  {
    value: 'input2', label: 'Input 2',
  },
]
const modelRef = reactive({
  name: '',
  clientId: +selectedClient.value,
  devicetype_id: undefined,
  devicesubtype_id: null,
  device_id2: '',
  privacy: 'aucun',
  findAddress: 0,
  simcard_id: '',
  imei: '',
  status: false,
  serialNumber: '',
  rangeTimePicker: [dayjs().format('YYYY-MM-DD HH:mm:ss'), null],
  description: '',
})
const deviceSubTypes = ref([])
const rulesRef = reactive({
  name: [
    {
      required: true,
      message: 'Please input name',
    },
  ],
  clientId: [
    {
      required: true,
      message: 'Please Select A Client',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      const {
        name,
        clientId,
        devicetype_id,
        devicesubtype_id,
        device_id2,
        privacy,
        findAddress,
        simcard_id,
        imei,
        status,
        serialNumber,
        rangeTimePicker,
        description,
      } = toRaw(modelRef)
      const formData = {
        id: props.device?.id || null,
        name,
        clientId,
        devicetype_id,
        devicesubtype_id,
        device_id2,
        privacy,
        findAddress,
        simcard_id,
        imei,
        status,
        serialNumber,
        begindate: rangeTimePicker[0],
        enddate: rangeTimePicker[1],
        description,
      }

      emit('addOrUpdateDevice', formData)
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.device) {
    const { name, clientId, devicetype_id, status, devicesubtype_id, simcard_id, device_id2, findaddress, imei, privacy, serialnumber, description, begindate, enddate } = props.device
    modelRef.name = name
    modelRef.clientId = +clientId || selectedClient.value
    modelRef.devicetype_id = devicetype_id
    modelRef.devicesubtype_id = devicesubtype_id || null
    modelRef.device_id2 = device_id2 || ''
    modelRef.simcard_id = simcard_id ? `${simcard_id}` : ''
    modelRef.imei = imei || ''
    modelRef.privacy = privacy || 'aucun'
    modelRef.serialNumber = serialnumber || ''
    modelRef.status = status || 0
    modelRef.findAddress = findaddress || 0
    modelRef.description = description || ''
    modelRef.rangeTimePicker = [begindate ? dayjs(begindate).format('YYYY-MM-DD HH:mm:ss') : null, enddate ? dayjs(enddate).format('YYYY-MM-DD HH:mm:ss') : null]
  }
  else {
    resetFields()
    modelRef.clientId = +selectedClient.value
  }
}
watch(() => props.device, () => {
  resetForm()
})
watch(() => modelRef.devicetype_id, async(val) => {
  if (!val)
    return

  val !== props.device?.devicetype_id && (modelRef.devicesubtype_id = null)
  deviceSubTypes.value = []

  const { data } = await apiServices(`api/deviceSubType/${val}`).get().json()
  data.value && (deviceSubTypes.value = data.value)
}, { immediate: true })

</script>

<template>
  <a-modal width="55%" style="top: 70px" destroy-on-close :body-style="{ padding: 0 }" @after-close="resetFields()">
    <template #title>
      <span>
        {{ device ? `Update ${device.name}` : 'Add' }}
      </span>
    </template>
    <div class="min-h-70 max-h-[calc(100vh-300px)] overflow-scroll p-5 pb-1">
      <a-form layout="vertical">
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="Name" v-bind="validateInfos.name">
            <a-input v-model:value="modelRef.name" />
          </a-form-item>
          <a-form-item label="Client" v-bind="validateInfos.clientId">
            <a-tree-select
              v-model:value="modelRef.clientId" show-search
              class="w-full md:min-w-70" tree-node-filter-prop="title" :tree-default-expanded-keys="[1]"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="Please select a client"
              :tree-default-expand-all="false" tree-data-simple-mode :disabled="!clients" :tree-data="clients || []"
              :height="235" virtual
            >
              <template #title="{ title }">
                {{ title }}
              </template>
            </a-tree-select>
          </a-form-item>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="deviceTypeId" v-bind="validateInfos.devicetype_id">
            <a-select
              v-model:value="modelRef.devicetype_id"
              :options="devicetypes.map(dt => ({ value: dt.devicetype_id, label: dt.name }))"
            />
          </a-form-item>
          <a-form-item label="deviceSubtypeId" v-bind="validateInfos.devicesubtype_id">
            <a-select
              v-model:value="modelRef.devicesubtype_id" allow-clear
              :options="deviceSubTypes.map(dst => ({ value: dst.devicesubtype_id, label: dst.name }))"
            />
          </a-form-item>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="Identifiant" v-bind="validateInfos.device_id2">
            <a-input v-model:value="modelRef.device_id2" />
          </a-form-item>
          <a-form-item label="Serial Number" v-bind="validateInfos.serialNumber">
            <a-input v-model:value="modelRef.serialNumber" />
          </a-form-item>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="IMEI" v-bind="validateInfos.imei">
            <a-input v-model:value="modelRef.imei" />
          </a-form-item>
          <div class="grid-cols-2 grid gap-2">
            <a-form-item label="status" v-bind="validateInfos.status">
              <a-switch v-model:checked="modelRef.status" :un-checked-value="0" :checked-value="1" />
            </a-form-item>
            <a-form-item label="Find address" v-bind="validateInfos.findAddress">
              <a-switch v-model:checked="modelRef.findAddress" :un-checked-value="0" :checked-value="1" />
            </a-form-item>
          </div>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="Du / Au" v-bind="validateInfos.serialNumber">
            <a-range-picker
              v-model:value="modelRef['rangeTimePicker']" :allow-empty="[true, true]"
              :show-time="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item label="Description" v-bind="validateInfos.description">
            <a-textarea
              v-model:value="modelRef.description" :auto-size="{ minRows: 2, maxRows: 5 }"
              placeholder="Description"
            />
          </a-form-item>
        </div>
        <hr class="border-gray-500/20 mb-3">
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="simcard_id" v-bind="validateInfos.simcard_id">
            <a-select
              v-model:value="modelRef.simcard_id"
              :options="props.simcards.map(dt => ({ value: dt.simcard_id, label: `${dt.sim}` }))"
            />
          </a-form-item>
          <a-form-item label="privacy" v-bind="validateInfos.privacy">
            <a-select v-model:value="modelRef.privacy" :options="privacies" />
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
          {{ device ? 'Update' : 'Create' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
