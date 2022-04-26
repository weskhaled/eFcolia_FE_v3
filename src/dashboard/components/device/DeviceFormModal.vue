<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import dayjs from 'dayjs'
import { Form } from 'ant-design-vue'

const { setupContext } = getCurrentInstance()
interface Props {
  device?: Ref<any>
  clients: Ref<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  device: () => ref(null),
  clients: () => ref([]),
})
const emit = defineEmits(['updateDevice'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef = reactive({
  name: '',
  clientId: undefined,
})
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
      console.log(toRaw(modelRef))
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.device) {
    const { name, clientId } = props.device
    modelRef.name = name
    modelRef.clientId = clientId
  }
  else {
    resetFields()
  }
}
watch(() => props.device, () => {
  resetForm()
})
// defineExpose({ map, api, mapOptions, centerMapView })
</script>

<template>
  <a-modal width="55%" destroy-on-close @after-close="resetFields()">
    <template #title>
      <span>
        {{ device ? `Update ${device.name}` : 'add' }}
      </span>
    </template>
    <a-form layout="vertical">
      <div class="grid-cols-2 grid gap-4">
        <a-form-item label="Name" v-bind="validateInfos.name">
          <a-input v-model:value="modelRef.name" />
        </a-form-item>
        <a-form-item label="Client" v-bind="validateInfos.clientId">
          <a-tree-select
            v-model:value="modelRef.clientId" show-search class="w-full md:min-w-70"
            tree-node-filter-prop="title" :tree-default-expanded-keys="[1]"
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
    </a-form>
    <template #footer>
      <a-form-item class="m-0">
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
