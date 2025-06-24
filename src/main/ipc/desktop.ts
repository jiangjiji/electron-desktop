import { app, ipcMain, shell } from 'electron'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { DesktopFile } from '~/desktopData'
import { extractFileExt } from '../common/sysUtils'

export function registerDesktopIpc() {
  ipcMain.handle('getDesktopFiles', async () => {
    const desktopFiles: DesktopFile[] = []

    const desktopPath = app.getPath('desktop')
    desktopFiles.push(...(await searchDesktopFile(desktopPath)))

    const commonDesktopPath = 'C:\\Users\\Public\\Desktop'
    desktopFiles.push(...(await searchDesktopFile(commonDesktopPath)))

    return desktopFiles
  })
}

async function searchDesktopFile(desktopPath: string) {
  const files: DesktopFile[] = []
  try {
    const names = readdirSync(desktopPath)
    for (const name of names) {
      const fullPath = join(desktopPath, name)
      const stat = statSync(fullPath)
      const ext = extractFileExt(name)
      const iconTargetPath = getInkTargetPath(fullPath, ext)
      const iconDataUrl = await getIconDataUrl(iconTargetPath)
      files.push({
        name,
        path: fullPath,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        ext,
        icon: iconDataUrl
      })
    }
  } catch (e) {
    // handle error
  }
  return files
}

function getInkTargetPath(fullPath: string, ext: string) {
  if (ext === 'lnk') {
    try {
      const shortcut = shell.readShortcutLink(fullPath)
      return shortcut.target || fullPath
    } catch {
      return fullPath
    }
  }
  return fullPath
}

async function getIconDataUrl(iconTargetPath: string) {
  try {
    const icon = await app.getFileIcon(iconTargetPath, { size: 'normal' })
    return icon.toDataURL()
  } catch {
    return ''
  }
}
