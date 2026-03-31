export {}

declare global {
  interface Window {
    electronAPI: {
      scheduleShutdown: (seconds: number) => Promise<{ success: boolean; error?: string }>
      cancelShutdown: () => Promise<{ success: boolean; error?: string }>
      minimizeWindow: () => Promise<void>
      hideWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      onShutdownScheduled: (callback: (data: { seconds: number }) => void) => () => void
      onShutdownCancelled: (callback: () => void) => () => void
    }
  }
}
