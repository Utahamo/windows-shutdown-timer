import { contextBridge, ipcRenderer } from 'electron'

export interface ShutdownResult {
  success: boolean
  error?: string
}

export interface ElectronAPI {
  scheduleShutdown: (seconds: number) => Promise<ShutdownResult>
  cancelShutdown: () => Promise<ShutdownResult>
  minimizeWindow: () => Promise<void>
  hideWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  onShutdownScheduled: (callback: (data: { seconds: number }) => void) => () => void
  onShutdownCancelled: (callback: () => void) => () => void
}

const api: ElectronAPI = {
  scheduleShutdown: (seconds: number) =>
    ipcRenderer.invoke('shutdown:schedule', seconds),

  cancelShutdown: () =>
    ipcRenderer.invoke('shutdown:cancel'),

  minimizeWindow: () =>
    ipcRenderer.invoke('window:minimize'),

  hideWindow: () =>
    ipcRenderer.invoke('window:hide'),

  closeWindow: () =>
    ipcRenderer.invoke('window:close'),

  onShutdownScheduled: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { seconds: number }) =>
      callback(data)
    ipcRenderer.on('shutdown-scheduled', handler)
    return () => ipcRenderer.removeListener('shutdown-scheduled', handler)
  },

  onShutdownCancelled: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('shutdown-cancelled', handler)
    return () => ipcRenderer.removeListener('shutdown-cancelled', handler)
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)
