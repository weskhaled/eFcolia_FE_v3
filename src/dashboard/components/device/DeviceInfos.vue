<script setup lang="ts">
import dayjs from 'dayjs'

interface Props {
  device?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  device: () => ref(null),
})
const emit = defineEmits(['updateDevice'])

const { t } = useI18n()

// defineExpose({ map, api, mapOptions, centerMapView })
</script>

<template>
  <div class="p-2 flex flex-col justify-between min-h-full">
    <a-descriptions title="Device Details:" class="!dark:text-light-50">
      <a-descriptions-item label="Name">
        {{ device?.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Telephone">
        {{ device?.simcardNumber }}
      </a-descriptions-item>
      <a-descriptions-item label="Battery Voltage">
        {{ device?.batteryvoltage }}
      </a-descriptions-item>
      <a-descriptions-item label="csq">
        {{ device?.csq }}
      </a-descriptions-item>
      <a-descriptions-item label="App date">
        {{ device?.appdate }}
      </a-descriptions-item>
      <a-descriptions-item label="Serial number">
        {{ device?.serialnumber }}
      </a-descriptions-item>
      <a-descriptions-item label="Simcard number">
        {{ device?.simcardNumber }}
      </a-descriptions-item>
      <a-descriptions-item label="Satsinuse">
        {{ device?.satsinuse }}
      </a-descriptions-item>
      <a-descriptions-item label="imei">
        {{ device?.imei }}
      </a-descriptions-item>
      <a-descriptions-item label="Address" :span="2">
        {{ device?.adress || 'Pas d\'adresse pour ce device' }}
      </a-descriptions-item>
    </a-descriptions>
    <div class="flex justify-end">
      <a-button type="primary" class="flex items-center" @click="emit('updateDevice', device.id)">
        <span class="i-carbon-edit inline-block text-white text-md mr-1" />
        Update
      </a-button>
    </div>
  </div>
</template>
<style lang="less">
.ant-descriptions-item-container {
  .ant-descriptions-item-label {
    @apply !font-bold;
  }
  .ant-descriptions-item-content {
    @apply !font-thin !text-gray-700;
  }
}
</style>
