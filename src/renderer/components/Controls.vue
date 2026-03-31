<template>
  <div class="flex flex-col gap-3">
    <!-- Quick presets -->
    <div>
      <p :class="['mb-2 text-xs font-medium', isDark ? 'text-white/40' : 'text-gray-400']">快速选择</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in presets"
          :key="preset.seconds"
          :class="[
            'flex flex-col items-center justify-center rounded-xl py-3 px-2 text-center',
            'transition-all duration-200 border',
            'hover:scale-105 active:scale-95',
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              : 'bg-black/5 border-black/10 hover:bg-black/10 text-gray-800',
            store.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]"
          :disabled="store.isLoading"
          @click="schedulePreset(preset.seconds)"
        >
          <span class="text-xl mb-0.5">{{ preset.icon }}</span>
          <span class="text-xs font-semibold">{{ preset.label }}</span>
        </button>
      </div>
    </div>

    <!-- Custom time input -->
    <div>
      <p :class="['mb-2 text-xs font-medium', isDark ? 'text-white/40' : 'text-gray-400']">自定义时间</p>
      <div class="flex gap-2 items-end">
        <div class="flex flex-1 gap-1.5">
          <div class="flex flex-1 flex-col items-center gap-1">
            <input
              v-model.number="hours"
              type="number"
              min="0"
              max="23"
              placeholder="0"
              :class="[
                'w-full rounded-xl border px-2 py-2.5 text-center text-lg font-bold',
                'transition-all duration-200 focus:outline-none',
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-indigo-400 focus:bg-white/10'
                  : 'bg-black/5 border-black/10 text-gray-800 placeholder-gray-300 focus:border-indigo-400 focus:bg-white',
              ]"
            />
            <span :class="['text-xs', isDark ? 'text-white/30' : 'text-gray-400']">时</span>
          </div>
          <span :class="['self-center pb-4 text-xl font-light', isDark ? 'text-white/30' : 'text-gray-300']">:</span>
          <div class="flex flex-1 flex-col items-center gap-1">
            <input
              v-model.number="minutes"
              type="number"
              min="0"
              max="59"
              placeholder="0"
              :class="[
                'w-full rounded-xl border px-2 py-2.5 text-center text-lg font-bold',
                'transition-all duration-200 focus:outline-none',
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-indigo-400 focus:bg-white/10'
                  : 'bg-black/5 border-black/10 text-gray-800 placeholder-gray-300 focus:border-indigo-400 focus:bg-white',
              ]"
            />
            <span :class="['text-xs', isDark ? 'text-white/30' : 'text-gray-400']">分</span>
          </div>
          <span :class="['self-center pb-4 text-xl font-light', isDark ? 'text-white/30' : 'text-gray-300']">:</span>
          <div class="flex flex-1 flex-col items-center gap-1">
            <input
              v-model.number="seconds"
              type="number"
              min="0"
              max="59"
              placeholder="0"
              :class="[
                'w-full rounded-xl border px-2 py-2.5 text-center text-lg font-bold',
                'transition-all duration-200 focus:outline-none',
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-indigo-400 focus:bg-white/10'
                  : 'bg-black/5 border-black/10 text-gray-800 placeholder-gray-300 focus:border-indigo-400 focus:bg-white',
              ]"
            />
            <span :class="['text-xs', isDark ? 'text-white/30' : 'text-gray-400']">秒</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2 pt-1">
      <button
        class="btn-primary flex-1"
        :disabled="store.isLoading || totalInputSeconds <= 0"
        @click="scheduleCustom"
      >
        <svg v-if="store.isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        {{ store.isScheduled ? '重新设置' : '设置关机' }}
      </button>

      <button
        v-if="store.isScheduled"
        class="btn-danger flex-1"
        :disabled="store.isLoading"
        @click="cancel"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        取消关机
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { useShutdownStore } from '../stores/shutdown'

const store = useShutdownStore()
const isDark = inject<Ref<boolean>>('isDark', ref(true))

const hours = ref(0)
const minutes = ref(30)
const seconds = ref(0)

const presets = [
  { label: '5 分钟', seconds: 5 * 60, icon: '⚡' },
  { label: '30 分钟', seconds: 30 * 60, icon: '☕' },
  { label: '1 小时', seconds: 60 * 60, icon: '🕐' },
  { label: '2 小时', seconds: 2 * 60 * 60, icon: '🕑' },
  { label: '4 小时', seconds: 4 * 60 * 60, icon: '🕓' },
  { label: '8 小时', seconds: 8 * 60 * 60, icon: '🌙' },
]

const totalInputSeconds = computed(() =>
  (hours.value || 0) * 3600 + (minutes.value || 0) * 60 + (seconds.value || 0)
)

async function schedulePreset(secs: number) {
  if (store.isLoading) return
  await store.scheduleShutdown(secs)
}

async function scheduleCustom() {
  if (store.isLoading || totalInputSeconds.value <= 0) return
  await store.scheduleShutdown(totalInputSeconds.value)
}

async function cancel() {
  if (store.isLoading) return
  await store.cancelShutdown()
}
</script>
