<template>
  <div class="flex flex-col items-center gap-4">
    <!-- Main countdown display -->
    <div
      :class="[
        'relative flex w-full flex-col items-center justify-center rounded-2xl py-6',
        isDark
          ? 'bg-white/5 border border-white/10'
          : 'bg-black/5 border border-black/10',
      ]"
    >
      <!-- Progress ring -->
      <div class="relative mb-4 flex items-center justify-center">
        <svg class="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
          <!-- Background circle -->
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            :stroke="isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
            stroke-width="8"
          />
          <!-- Progress circle -->
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            class="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color: rgb(99, 102, 241)" />
              <stop offset="100%" style="stop-color: rgb(139, 92, 246)" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Time display inside ring -->
        <div class="absolute flex flex-col items-center">
          <div
            v-if="store.isScheduled"
            class="flex items-baseline gap-0.5"
          >
            <span :class="['text-3xl font-bold tabular-nums', isDark ? 'text-white' : 'text-gray-900']">
              {{ store.formattedTime.hours }}
            </span>
            <span :class="['text-xl font-light mx-0.5', isDark ? 'text-white/40' : 'text-gray-400']">:</span>
            <span :class="['text-3xl font-bold tabular-nums', isDark ? 'text-white' : 'text-gray-900']">
              {{ store.formattedTime.minutes }}
            </span>
            <span :class="['text-xl font-light mx-0.5', isDark ? 'text-white/40' : 'text-gray-400']">:</span>
            <span :class="['text-3xl font-bold tabular-nums', isDark ? 'text-white' : 'text-gray-900']">
              {{ store.formattedTime.seconds }}
            </span>
          </div>
          <div v-else class="flex flex-col items-center gap-1">
            <span class="text-4xl">⏱️</span>
            <span :class="['text-xs font-medium', isDark ? 'text-white/40' : 'text-gray-400']">未设置</span>
          </div>
        </div>
      </div>

      <!-- Labels -->
      <div v-if="store.isScheduled" class="flex gap-6 text-xs">
        <span :class="isDark ? 'text-white/40' : 'text-gray-400'">时</span>
        <span :class="isDark ? 'text-white/40' : 'text-gray-400'">分</span>
        <span :class="isDark ? 'text-white/40' : 'text-gray-400'">秒</span>
      </div>

      <!-- Status text -->
      <p :class="['mt-2 text-xs', isDark ? 'text-white/30' : 'text-gray-400']">
        {{ store.isScheduled ? `剩余 ${store.remainingSeconds} 秒后关机` : '点击下方按钮开始设置' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, type Ref } from 'vue'
import { useShutdownStore } from '../stores/shutdown'

const store = useShutdownStore()
const isDark = inject<Ref<boolean>>('isDark', ref(true))

const circumference = 2 * Math.PI * 52

const dashOffset = computed(() => {
  const pct = store.progress / 100
  return circumference - pct * circumference
})
</script>
