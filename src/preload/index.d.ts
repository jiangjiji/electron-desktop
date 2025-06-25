import type { ElectronAPI } from '@electron-toolkit/preload'
import { DesktopFile } from '~/desktopData'

interface DesktopApi {
  getDesktopFiles: () => Promise<DesktopFile[]>
  getDesktopBackground: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DesktopApi
  }
}
