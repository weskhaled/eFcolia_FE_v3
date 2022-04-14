<script setup lang="ts">
import { toggleDark } from '~/common/composables'

</script>

<template>
  <div>
    <button
      class="vt-switch vt-switch-appearance" type="button" role="switch" aria-label="toggle dark mode"
      @click="toggleDark()"
    >
      <span class="vt-switch-check">
        <span class="vt-switch-icon">
          <span class="i-carbon-moon vt-switch-appearance-moon text-xs block" />
          <span class="i-carbon-sun vt-switch-appearance-sun text-xs block" />
        </span>
      </span>
    </button>
  </div>
</template>
<style lang="less">
.vt-switch {
  position: relative;
  border-radius: 11px;
  display: block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  @apply bg-dark-500/30 dark: bg-gray-500/20 border-1px border-light-900/60 dark:border-light-500/50;
  transition: border-color 0.25s, background-color 0.25s;
}

.vt-switch:hover {
  @apply border-dark-500/60 dark: border-gray-500/40;
}

.vt-switch-check {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  @apply bg-gray-100/90 shadow-sm;
  transition: background-color 0.25s, transform 0.25s;
}

.dark .vt-switch-check {
  @apply bg-dark-500/80;
}

.vt-switch-icon {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
}

.vt-switch-icon>span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  color: rgb(0, 0, 0);
}

.dark .vt-switch-icon>span {
  color: white;
  transition: opacity 0.25s;
}

.vt-switch-appearance-sun {
  opacity: 1;
}

.vt-switch-appearance-moon,
.dark .vt-switch-appearance-sun {
  opacity: 0;
}

.dark .vt-switch-appearance-moon {
  opacity: 1;
}

.dark .vt-switch-appearance .vt-switch-check {
  transform: translate(18px);
}
</style>
