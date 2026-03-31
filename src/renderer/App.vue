<template>
  <div class="flex h-screen w-full items-center justify-center p-3">
    <div
      :class="[
        'flex h-full w-full max-h-[580px] max-w-[440px] flex-col rounded-3xl overflow-hidden',
        'border shadow-2xl',
        isDark
          ? 'border-white/10 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white'
          : 'border-black/10 bg-gradient-to-br from-slate-100 via-white to-slate-50 text-gray-900',
      ]"
    >
      <!-- Title bar -->
      <div
        :class="[
          'flex items-center justify-between px-4 py-3 select-none',
          'border-b',
          isDark ? 'border-white/5' : 'border-black/5',
        ]"
        style="-webkit-app-region: drag"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">⏰</span>
          <span
            :class="['text-sm font-semibold', isDark ? 'text-white/80' : 'text-gray-700']"
          >Windows 定时关机</span>
        </div>
        <div class="flex items-center gap-1" style="-webkit-app-region: no-drag">
          <ThemeToggle />
          <button
            class="titlebar-btn"
            :class="isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/5 text-gray-500'"
            title="最小化"
            @click="minimize"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            class="titlebar-btn"
            :class="isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/5 text-gray-500'"
            title="隐藏到托盘"
            @click="hide"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            class="titlebar-btn hover:bg-red-500 hover:text-white"
            :class="isDark ? 'text-white/60' : 'text-gray-500'"
            title="退出"
            @click="quit"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <!-- Status banner -->
        <div
          v-if="store.isScheduled"
          :class="[
            'flex items-center gap-3 rounded-2xl px-4 py-3',
            isDark ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200',
          ]"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
          </span>
          <div class="flex flex-1 items-center justify-between">
            <span :class="['text-sm font-medium', isDark ? 'text-indigo-300' : 'text-indigo-700']">
              已设置关机计划
            </span>
            <span :class="['text-xs', isDark ? 'text-indigo-400' : 'text-indigo-500']">
              {{ store.targetTimeString }} 关机
            </span>
          </div>
        </div>

        <!-- Timer display -->
        <Timer />

        <!-- Error message -->
        <div
          v-if="store.errorMessage"
          :class="[
            'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
            isDark ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-700',
          ]"
        >
          <svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ store.errorMessage }}</span>
          <button class="ml-auto opacity-60 hover:opacity-100" @click="store.clearError">✕</button>
        </div>

        <!-- Controls -->
        <Controls />
      </div>

      <!-- Footer -->
      <div
        :class="[
          'flex items-center justify-center px-5 py-3 text-xs border-t',
          isDark ? 'text-white/30 border-white/5' : 'text-gray-400 border-black/5',
        ]"
      >
        Windows 定时关机 · 系统托盘常驻
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useShutdownStore } from './stores/shutdown'
import Timer from './components/Timer.vue'
import Controls from './components/Controls.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const store = useShutdownStore()
const isDark = ref(true)

provide('isDark', isDark)

let unsubScheduled: (() => void) | null = null
let unsubCancelled: (() => void) | null = null

onMounted(() => {
  if (window.electronAPI) {
    unsubScheduled = window.electronAPI.onShutdownScheduled(({ seconds }) => {
      store.setFromTray(seconds)
    })
    unsubCancelled = window.electronAPI.onShutdownCancelled(() => {
      store.cancelShutdown()
    })
  }
})

onUnmounted(() => {
  unsubScheduled?.()
  unsubCancelled?.()
})

async function minimize() {
  await window.electronAPI?.minimizeWindow()
}

async function hide() {
  await window.electronAPI?.hideWindow()
}

async function quit() {
  await window.electronAPI?.closeWindow()
}
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
}

.titlebar-btn {
  @apply flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150;
}
</style>
