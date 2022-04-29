<script setup lang="ts">
import dayjs from 'dayjs'

interface Props {
  device?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  device: () => ref(null),
})
const emit = defineEmits(['click', 'showDetails', 'showHistory', 'showStatistics', 'update'])

const { t } = useI18n()

// defineExpose({ map, api, mapOptions, centerMapView })
</script>

<template>
  <a-card
    v-if="props.device" :bordered="true" size="small"
    :class="[props.device.selected && 'shadow-sm', props.device.selected && 'bg-blue-200/45 dark:bg-dark-900/60']"
    :body-style="{ padding: 0 }" class="w-full dark:bg-blue-gray-700/90 dark:border-blue-gray-900"
  >
    <template #actions>
      <span key="connected">
        <a-tooltip>
          <template #title>Alimentation externe</template>
          <span
            v-if="props.device.battery2state === 1"
            class="i-ph-plugs-connected-duotone text-base text-green-600 block ant-icon mx-auto my-1"
          />
          <span v-else class="i-ph-plugs-duotone text-base text-red-600 block ant-icon mx-auto my-1" />
        </a-tooltip>
      </span>
      <span key="connected" class="h-full">
        <a-tooltip>
          <template #title>
            {{ (props.device.batteryvoltage / 1000).toFixed(2) }} V -
            {{ ((props.device.batterylevel * 100) / 7).toFixed(0) }} %
          </template>
          <span class="flex items-center h-27px">
            <span
              class="battery" :class="[
                (props.device.batterylevel * 100) / 7 < 10 && 'low',
                !props.device.batteryvoltage && 'inactive',
              ]" :style="{
                '--battery-level': `${(props.device.batterylevel * 100) / 7}%`,
              }"
            />
          </span>
        </a-tooltip>
      </span>
      <span key="enginestate" class="h-full">
        <a-tooltip>
          <template #title>Contact</template>
          <span class="flex items-center h-27px">
            <span class="relative mx-auto">
              <span
                class="i-ph-power-duotone text-base block"
                :class="props.device.enginestate ? (props.device.enginestate === 3 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'"
              />
              <a-badge
                class="!absolute -top-10px -right-10px"
                :status="props.device.enginestate ? (props.device.enginestate === 3 ? 'success' : 'error') : 'default'"
              />
            </span>
          </span>
        </a-tooltip>
      </span>
      <span key="speed" class="h-full">
        <a-tooltip>
          <template #title>Vitesse</template>
          <span class="flex items-center h-27px text-xs dark:text-light">
            <span class="mx-auto">{{ device.speed }} km/h</span>
          </span>
        </a-tooltip>
      </span>
      <span key="connected" class="h-full">
        <a-tooltip>
          <template #title>
            GSM
          </template>
          <span class="flex items-center h-27px">
            <span class="mx-auto">
              <span v-if="!props.device.csq" class="i-ph-wifi-x-thin block text-red-500 text-lg" />
              <span v-else-if="props.device.csq < 11" class="i-ph-wifi-low-thin block text-green-600 text-lg" />
              <span
                v-else-if="props.device.csq > 11 && props.device.csq < 31"
                class="i-ph-wifi-medium-thin block text-green-600 text-lg"
              />
              <span v-else class="i-ph-wifi-high-thin block text-green-600 text-lg" />
            </span>
          </span>
        </a-tooltip>
      </span>
      <span key="gps" class="h-full">
        <a-tooltip>
          <template #title>GPS</template>
          <span class="flex items-center h-27px text-xs">
            <span class="mx-auto dark:text-light">
              <span
                key="ellipsis" class="i-ph-cell-signal-high-duotone text-sm inline-block ant-icon mx-auto mt-1"
                :class="props.device.validitycode ? 'text-green-500' : 'text-red-500'"
              />
              <span v-if="props.device.satsinuse !== null">X{{ props.device.satsinuse }}</span>
            </span>
          </span>
        </a-tooltip>
      </span>
      <span key="settings" class="h-full">
        <a-dropdown>
          <a-button size="small" class="flex items-center justify-center mx-auto" type="text">
            <template #icon>
              <span class="i-ant-design-ellipsis-outlined anticon block text-sm dark:text-light-50" />
            </template>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="() => emit('showDetails')">
                <span class="flex items-center leading-6">
                  <span class="i-ph-info-duotone anticon text-green-600 mr-1" />
                  <span>Details</span>
                </span>
              </a-menu-item>
              <a-menu-item @click="() => emit('showHistory')">
                <span class="flex items-center leading-6">
                  <span class="i-ph-clock-counter-clockwise-duotone anticon text-green-600 mr-1" />
                  <span>Historique</span>
                </span>
              </a-menu-item>
              <a-menu-item @click="() => emit('showStatistics')">
                <span class="flex items-center leading-6">
                  <span class="i-ph-activity anticon text-green-600 mr-1" />
                  <span>Statistics device</span>
                </span>
              </a-menu-item>
              <a-menu-item @click="() => emit('update')">
                <span class="flex items-center leading-6">
                  <span class="i-ph-pencil-thin anticon text-blue-600 mr-1" />
                  <span>Modifier device</span>
                </span>
              </a-menu-item>
              <a-menu-item>
                <span class="flex items-center leading-6">
                  <span class="i-ph-x-duotone anticon text-red-600 mr-1" />
                  <span>Supprimer device</span>
                </span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </span>
    </template>

    <div class="cursor-pointer" @click="emit('click')">
      <div class="p-1.5">
        <div class="flex justify-between items-center mb-1">
          <a-tooltip>
            <template #title>
              <span>{{ props.device?.name }}</span>
            </template>
            <h2 class="text-lg mb-0 dark:text-light-400">
              {{ `${props.device?.name}`.slice(0, 23) }}{{
                `${props.device?.name}`.length > 23 ? '...' : null
              }}
            </h2>
          </a-tooltip>
          <span class="text-xs text-right dark:text-light-400">{{
            props.device.localizationdate &&
              dayjs(props.device.localizationdate).format('DD/MM/YYYY HH:mm:ss')
          }}</span>
        </div>
        <div class="flex items-center text-dark-50 dark:text-light-400 mb-0.5 text-xs">
          <span class="i-ph-map-pin-duotone block mb-1 mr-0.5" />
          {{ props.device.adress || 'Pas d\'adresse pour ce device' }}
        </div>
      </div>
      <div class="bg-gray-200/10 dark:text-light-400 shadow-inner p-1.5">
        <div class="flex text-xs">
          <div class="flex items-center flex-0 mr-0.5">
            <span class="i-ph-info-duotone block text-xs mb-0.5 mr-0.5" />
          </div>
          <div class="flex text-left flex-grow items-center">
            <div>
              <span v-if="props.device.description">{{ props.device.description }}</span>
              <div class="flex-grow mr-auto">
                <span>
                  {{
                    props.device.serialnumber
                  }}{{ props.device.simcardNumber && ' | +' + props.device.simcardNumber }}
                </span>
              </div>
            </div>
          </div>
          <div class="ml-auto text-right">
            <div>
              {{ props.device.latitude || 'null' }}
            </div>
            <div>
              {{ props.device.longitude || 'null' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>
<style lang="less">
.ant-card {
  @apply flex flex-col;

  .ant-card-body {
    @apply flex-grow-1;
  }

  .ant-card-actions {
    @apply bg-white/50 dark:bg-black/30 dark:border-t-dark-500;

    >li {
      @apply  !my-1.5;

      &:not(:last-child) {
        // border-right: 1px solid #f0f0f0;
        @apply border-r-light-500 .dark:border-r-dark-500;
      }
    }
  }
}

.battery {
  display: block;
  position: relative;
  margin: 2px auto;
  width: calc(18px);
  color: #48bb78;
  /* border: calc(1px) solid currentColor; */
  height: calc(9px);
  border-radius: 1px;
  box-shadow: 0px 0px 0px 1px currentColor;

  &:before {
    content: "";
    width: var(--battery-level);
    height: calc(100%);
    left: 0;
    top: 0;
    background: currentColor;
    position: absolute;
    border-radius: 0;
  }

  &:after {
    content: "";
    position: absolute;
    margin-right: calc(-4px);
    right: 0;
    top: 2px;
    width: calc(2px);
    height: calc(100% - 4px);
    background: currentColor;
    border-bottom-right-radius: calc(5px);
    border-top-right-radius: calc(5px);
  }

  &.low {
    color: rgb(255, 38, 0);
  }

  &.inactive {
    color: #969696;
  }
}

.signal {
  width: 10px;
  height: 10px;
  margin: auto;
  position: relative;
  overflow: hidden;
  transform: rotate(45deg) scale(1);
  color: #6e6e6e;

  >div {
    color: #6e6e6e;

    &.active {
      color: #48bb78;
    }

    &:nth-child(1) {
      border-radius: 50%;
      border: 1px solid currentColor;
      position: absolute;
      width: 200%;
      height: 200%;
    }

    &:nth-child(2) {
      border-radius: 50%;
      border: 1px solid currentColor;
      position: absolute;
      right: 0%;
      bottom: 0;
      transform: translate(50%, 50%);
      width: 150%;
      height: 150%;
    }

    &:nth-child(3) {
      border-radius: 50%;
      border: 1px solid currentColor;
      position: absolute;
      right: 0%;
      width: 100%;
      transform: translate(50%, 50%);
      height: 100%;
    }

    &:nth-child(4) {
      border-radius: 50%;
      border: 1px solid currentColor;
      position: absolute;
      bottom: 0;
      background-color: #6e6e6e;
      height: 50%;
      right: 0%;
      width: 50%;
      transform: translate(50%, 50%);

      &.active {
        background-color: #48bb78;
      }
    }
  }
}
</style>
