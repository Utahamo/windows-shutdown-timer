import { exec } from 'child_process'
import { promisify } from 'util'
import log from 'electron-log'

const execAsync = promisify(exec)

export class ShutdownService {
  /**
   * Schedule a system shutdown after the specified number of seconds.
   * Uses Windows `shutdown` command with the /s flag.
   */
  async scheduleShutdown(seconds: number): Promise<void> {
    if (seconds <= 0) {
      throw new Error('Shutdown time must be greater than 0 seconds')
    }
    if (seconds > 315360000) {
      throw new Error('Shutdown time must not exceed 10 years')
    }

    log.info(`Scheduling shutdown in ${seconds} seconds`)

    // Cancel any existing shutdown first
    try {
      await execAsync('shutdown /a')
    } catch {
      // No existing shutdown to cancel — ignore the error
    }

    await execAsync(`shutdown /s /t ${seconds} /c "Windows Shutdown Timer"`)
    log.info(`Shutdown scheduled successfully for ${seconds} seconds from now`)
  }

  /**
   * Cancel a previously scheduled shutdown.
   */
  async cancelShutdown(): Promise<void> {
    log.info('Cancelling shutdown')
    await execAsync('shutdown /a')
    log.info('Shutdown cancelled successfully')
  }
}
