import type { ElectronAPI } from '@electron-toolkit/preload'
import { DesktopFile } from '~/desktopData'

interface DesktopApi {
  getDesktopFiles: () => Promise<DesktopFile[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DesktopApi
  }
}
