<script setup lang="ts">
import { api as apiServices, urlSearchParams, isDark, toggleDark } from '~/common/composables'
import { currentUser, mdAndLarger, selectedClient, sideCollapsed } from '~/common/stores'

const activeKey = ref('1')
</script>

<template>
  <div class="h-full" :class="mdAndLarger ? 'flex' : 'flex-col'">
    <div class="w-full bg-white dark:bg-dark-800">
      <h2 class="text-xl p-2 mb-1"> Settings </h2>
      <div class="p-2" v-if="currentUser">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="General information">
            <div class="flex gap-4 p-2 mt-2">
              <div class="flex-none w-41 rounded-sm p-2">
                <a-avatar :size="120" :style="{ backgroundColor: '#7265e6', verticalAlign: 'middle' }">
                  {{ currentUser.lastname }}
                </a-avatar>
              </div>
              <div class="flex-1">
                <div class="bg-gray-100 dark:bg-dark-700 rounded-sm p-2 mb-2">
                  <a-descriptions title="User Infos">
                    <a-descriptions-item label="Firstname">{{ currentUser.firstname }}</a-descriptions-item>
                    <a-descriptions-item label="Lastname">{{ currentUser.lastname }}</a-descriptions-item>
                    <a-descriptions-item label="Lang">{{ currentUser.lang }}</a-descriptions-item>
                    <a-descriptions-item label="Begin Date">{{ currentUser.begindate }}</a-descriptions-item>
                  </a-descriptions>
                </div>
                <div class="bg-gray-100 dark:bg-dark-700 rounded-sm p-2">
                  <a-descriptions title="Appearances"></a-descriptions>
                  <div class="flex gap-2 border-b-gray-200 dark:border-b-dark-900 border-b-1 p-y-2">
                    <div class="w-2/6">Dark Mode / Ligth Mode</div>
                    <div class="w-4/6">
                      <a-switch v-model:checkedValue="isDark" @click="toggleDark()" size="small" />
                    </div>
                  </div>
                  <div class="flex gap-2 border-b-gray-200 dark:border-b-dark-900 border-b-1 p-y-2">
                    <div class="w-2/6">Lang</div>
                    <div class="w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
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
