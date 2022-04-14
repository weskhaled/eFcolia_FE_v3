<script setup lang="ts">
import { isDark } from '~/common/composables'
import { currentUser, siderCollapsed, token } from '~/common/stores'

const { t, availableLocales, locale } = useI18n()
</script>

<template>
  <a-layout-header
    :theme="isDark" class="flex items-center drop-shadow-[0_0px_2px_rgba(0,0,0,0.15)] z-45 h-55px"
    :class="isDark ? '!bg-[#001125]' : '!bg-white'"
  >
    <div>
      <a-badge-ribbon class="!text-10px !-top-2.2 !rounded-2px">
        <template #text>
          by MatiaSat
        </template>
        <span
          class="bg-blue-900 text-light-50 rounded-sm py-2 px-4 font-mono font-bold inline-block flex items-center text-xl leading-5"
        >
          efcolia
        </span>
      </a-badge-ribbon>
    </div>
    <button class="p-2">
      <span
        :class="siderCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
        class="hidden block text-lg text-gray-700" @click="() => (siderCollapsed = !siderCollapsed)"
      />
    </button>
    <div class="flex-grow" />
    <div class="ml-auto flex items-center">
      <DarkSwitch class="hidden sm:block" />
      <a-dropdown class="mx-2">
        <a-button
          type="link" :loading="!currentUser"
          class="!flex justify-between items-center leading-12 px-0.5 dark:text-white dark:hover:text-light-800"
          @click.prevent
        >
          <span v-if="currentUser" class="capitalize mx-0.5">
            {{ currentUser.lastname }}
          </span>
          <div class="!flex items-center">
            <span class="i-ph-user-circle-duotone inline-block text-lg mr-1" />
            <span class="i-ph-caret-down inline-block text-11px" />
          </div>
        </a-button>
        <template v-if="currentUser" #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8">
                <span class="i-ph-user-circle-duotone inline-block mr-1" />
                Profile
              </a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8">
                <span class="i-carbon-settings inline-block mr-1" />
                Settings
              </a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8" @click="() => token = null">
                <span class="i-carbon-logout inline-block mr-1" />
                Logout
              </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown class="mr-0">
        <a-button
          type="link" class="!flex items-center leading-12 px-0.5 dark:text-white dark:hover:text-light-800"
          @click.prevent
        >
          <span class="inline-block text-md uppercase min-w-6">{{ locale }}</span>
          <span class="mx-0.5">
            <img
              :src="`https://api.iconify.design/circle-flags:${locale === 'en' ? 'us' : locale}.svg?width=15px&height=15px`"
              :alt="locale"
            >
          </span>
          <span class="i-ph-caret-down inline-block text-11px" />
        </a-button>
        <template #overlay>
          <a-menu class="max-h-55 overflow-y-auto">
            <a-menu-item v-for="availableLocale in availableLocales" :key="availableLocale" class="min-w-25">
              <a
                href="javascript:;" class="flex items-center text-md pr-2 text-left leading-8"
                @click="() => locale = availableLocale"
              >
                <span class="inline-block mr-2">
                  <img
                    :src="`https://api.iconify.design/circle-flags:${availableLocale === 'en' ? 'us' : availableLocale}.svg?width=16px&height=16px`"
                    :alt="availableLocale"
                  >
                </span>
                <span class="text-md uppercase">
                  {{ availableLocale }}
                </span>
              </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>
