import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ShutdownMode = 'countdown' | 'scheduled'

export const useShutdownStore = defineStore('shutdown', () => {
  // State
  const isScheduled = ref(false)
  const totalSeconds = ref(0)
  const remainingSeconds = ref(0)
  const mode = ref<ShutdownMode>('countdown')
  const targetTime = ref<Date | null>(null)
  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  // Getters
  const formattedTime = computed(() => {
    const secs = remainingSeconds.value
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
    }
  })

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) * 100
  })

  const targetTimeString = computed(() => {
    if (!targetTime.value) return ''
    return targetTime.value.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  })

  // Actions
  function startCountdown() {
    stopCountdown()
    intervalId.value = setInterval(() => {
      if (remainingSeconds.value <= 0) {
        stopCountdown()
        isScheduled.value = false
        return
      }
      remainingSeconds.value -= 1
    }, 1000)
  }

  function stopCountdown() {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  async function scheduleShutdown(seconds: number) {
    if (!window.electronAPI) return

    isLoading.value = true
    errorMessage.value = ''

    try {
      const result = await window.electronAPI.scheduleShutdown(seconds)
      if (result.success) {
        isScheduled.value = true
        totalSeconds.value = seconds
        remainingSeconds.value = seconds
        targetTime.value = new Date(Date.now() + seconds * 1000)
        startCountdown()
      } else {
        errorMessage.value = result.error || '设置关机失败'
      }
    } catch (err) {
      errorMessage.value = String(err)
    } finally {
      isLoading.value = false
    }
  }

  async function cancelShutdown() {
    if (!window.electronAPI) return

    isLoading.value = true
    errorMessage.value = ''

    try {
      const result = await window.electronAPI.cancelShutdown()
      if (result.success) {
        isScheduled.value = false
        totalSeconds.value = 0
        remainingSeconds.value = 0
        targetTime.value = null
        stopCountdown()
      } else {
        errorMessage.value = result.error || '取消关机失败'
      }
    } catch (err) {
      errorMessage.value = String(err)
    } finally {
      isLoading.value = false
    }
  }

  function setFromTray(seconds: number) {
    isScheduled.value = true
    totalSeconds.value = seconds
    remainingSeconds.value = seconds
    targetTime.value = new Date(Date.now() + seconds * 1000)
    startCountdown()
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    isScheduled,
    totalSeconds,
    remainingSeconds,
    mode,
    targetTime,
    isLoading,
    errorMessage,
    formattedTime,
    progress,
    targetTimeString,
    scheduleShutdown,
    cancelShutdown,
    setFromTray,
    clearError,
  }
})
