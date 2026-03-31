import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import log from 'electron-log'
import { ShutdownService } from './services/shutdown'

log.initialize()
log.info('Application starting...')

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const shutdownService = new ShutdownService()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 620,
    minWidth: 400,
    minHeight: 560,
    frame: false,
    transparent: true,
    resizable: true,
    icon: path.join(__dirname, '../../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTray(): void {
  const iconPath = path.join(__dirname, '../../public/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
      },
    },
    { type: 'separator' },
    {
      label: '快速关机 (5分钟)',
      click: async () => {
        await shutdownService.scheduleShutdown(5 * 60)
        mainWindow?.webContents.send('shutdown-scheduled', { seconds: 5 * 60 })
      },
    },
    {
      label: '快速关机 (30分钟)',
      click: async () => {
        await shutdownService.scheduleShutdown(30 * 60)
        mainWindow?.webContents.send('shutdown-scheduled', { seconds: 30 * 60 })
      },
    },
    {
      label: '取消关机',
      click: async () => {
        await shutdownService.cancelShutdown()
        mainWindow?.webContents.send('shutdown-cancelled')
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        tray = null
        app.quit()
      },
    },
  ])

  tray.setToolTip('Windows 定时关机')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

// IPC Handlers
ipcMain.handle('shutdown:schedule', async (_event, seconds: number) => {
  try {
    await shutdownService.scheduleShutdown(seconds)
    return { success: true }
  } catch (error) {
    log.error('Failed to schedule shutdown:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('shutdown:cancel', async () => {
  try {
    await shutdownService.cancelShutdown()
    return { success: true }
  } catch (error) {
    log.error('Failed to cancel shutdown:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:hide', () => {
  mainWindow?.hide()
})

ipcMain.handle('window:close', () => {
  tray = null
  app.quit()
})

ipcMain.handle('shell:openExternal', (_event, url: string) => {
  shell.openExternal(url)
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  log.info('Application quitting...')
})
