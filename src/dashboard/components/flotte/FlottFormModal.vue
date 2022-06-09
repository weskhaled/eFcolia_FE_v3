<script setup lang="ts">
import dayjs from 'dayjs'
import { Form, message } from 'ant-design-vue'
import { selectedClient } from '~/common/stores'
import { api as apiServices } from '~/common/composables'

interface Props {
  alert?: Ref<any>
}
const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm')

const props = withDefaults(defineProps<Props>(), {
  alert: () => ref(null),
})
const emit = defineEmits(['addOrUpdateAlert'])

const { t } = useI18n()
const useForm = Form.useForm
const levels = [
  {
    value: '1', label: 'level 1',
  },
  {
    value: '2', label: 'level 2',
  },
  {
    value: '3', label: 'level 3',
  },
]
const devices = ref([])
const ensembles = ref([])
const modelRef = reactive({
  name: '',
  clientId: +selectedClient.value,
  level: "1",
  devices: [],
  flotte: [],
  status: 0,
  condition: {},
  action: [],
  rangeTimePicker: [null, null],
  description: '',
})
const rulesRef = reactive({
  name: [
    {
      required: true,
      message: 'Please input name',
    },
  ],
  rangeTimePicker: [
    {
      asyncValidator: (__rule, value) => {
        return new Promise((resolve, reject) => {
          if (!value[0] || !value[1]) {
            reject('Please select time!')
          } else {
            resolve(true);
          }
        });
      },
      type: 'array' as const, required: true, message: 'Please select time!',
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
        devices,
        status,
        flotte,
        level,
        condition,
        action,
        rangeTimePicker,
        description,
      } = toRaw(modelRef)
      const formData = {
        id: props.alert?.id || null,
        name,
        clientId,
        devices,
        status,
        level,
        flotte,
        condition,
        action,
        from: rangeTimePicker[0],
        to: rangeTimePicker[1],
        description,
      }

      emit('addOrUpdateAlert', formData)
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.alert) {
    const { name, clientId, level, status, description } = props.alert
    modelRef.name = name
    modelRef.clientId = +clientId || selectedClient.value
    modelRef.level = level
    modelRef.status = status || 0
    modelRef.description = description || ''
  }
  else {
    resetFields()
    modelRef.clientId = +selectedClient.value
    modelRef.level = '1'
  }
}
watch(() => props.alert, (val) => {
  resetForm()
})

watch(() => selectedClient.value, async (val) => {
  if (!val)
    return

  apiServices(`api/device/byClientId/${val}?skip=0${selectedClient.value}`).get().json().then(({ data }) => devices.value = data.value.listDevice.map(d => ({ value: d.id, label: d.name })) || [])
  apiServices(`api/ensemble/byClientId/${val}`).get().json().then(({ data }) => ensembles.value = data.value.map(e => ({ value: e.ensembleId, label: e.name })) || [])

}, { immediate: true })

const onSearchDevice = useDebounceFn(async (text) => {
  // do something
  console.log(text)
  if (text.length < 3) {
    message.destroy()
    message.warn('Please input more than 3 chars')
    return
  }

  const { data } = await apiServices(`/api/device/byClientId/${selectedClient.value}/${text}/?skip=0`).get().json()
  if (data?.value) {
    devices.value = data.value.map(d => ({ value: d.id, label: d.name }))
  }
}, 1000)

// onMounted(async () => {
// })
</script>

<template>
  <a-modal width="55%" style="top: 70px" destroy-on-close :body-style="{ padding: 0 }" @after-close="resetFields()">
    <template #title>
      <span>
        {{ alert?.name ? `Update ${alert.name}` : 'Add' }}
      </span>
    </template>
    <div class="min-h-70 max-h-[calc(100vh-300px)] overflow-scroll p-5 pb-1">
      <a-form layout="vertical">
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="Name" v-bind="validateInfos.name">
            <a-input v-model:value="modelRef.name" />
          </a-form-item>
          <a-form-item label="level">
            <a-select v-model:value="modelRef.level" :options="levels" />
          </a-form-item>
        </div>
        <div class="grid-cols-2 grid gap-4">
          <a-form-item label="devices">
            <a-select mode="multiple" @search="onSearchDevice" :filter-option="false" v-model:value="modelRef.devices"
              :options="devices" />
          </a-form-item>
          <a-form-item label="status" v-bind="validateInfos.status">
            <a-switch v-model:checked="modelRef.status" :un-checked-value="0" :checked-value="1" />
          </a-form-item>
        </div>

        <div class="grid-cols-2 grid gap-2">
          <a-form-item label="Flotte">
            <a-select mode="multiple" v-model:value="modelRef.flotte" :options="ensembles" />
          </a-form-item>
          <a-form-item label="Temps d'activité" v-bind="validateInfos.rangeTimePicker">
            <a-range-picker v-model:value="modelRef['rangeTimePicker']" :allow-empty="[false, false]"
              :show-time="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
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
          {{ alert.name ? 'Update' : 'Create' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
