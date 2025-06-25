import { app, ipcMain, shell } from 'electron'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { DesktopFile } from '~/desktopData'
import { extractFileExt, getRegistryValue } from '../common/sysUtils'

export function registerDesktopIpc() {
  ipcMain.handle('getDesktopFiles', async () => {
    const desktopFiles: DesktopFile[] = []

    const desktopPath = app.getPath('desktop')
    desktopFiles.push(...(await searchDesktopFile(desktopPath)))

    const commonDesktopPath = 'C:\\Users\\Public\\Desktop'
    desktopFiles.push(...(await searchDesktopFile(commonDesktopPath)))

    return desktopFiles
  })

  ipcMain.handle('getDesktopBackground', async () => {
    try {
      const wallpaperPath = await getWallpaperPath()
      if (wallpaperPath && existsSync(wallpaperPath)) {
        const imageBuffer = readFileSync(wallpaperPath)
        const base64 = imageBuffer.toString('base64')
        const ext = extractFileExt(wallpaperPath).toLowerCase()
        const mimeType = getMimeType(ext)
        return `data:${mimeType};base64,${base64}`
      }
      return null
    } catch (error) {
      console.error('获取桌面背景失败:', error)
      return null
    }
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

      const fileIcon = iconDataUrl
        ? iconDataUrl
        : stat.isFile()
          ? '📁'
          : ext === 'lnk'
            ? '🔗'
            : '📄'

      files.push({
        name,
        path: fullPath,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        ext,
        icon: fileIcon
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

// 获取桌面背景路径
async function getWallpaperPath(): Promise<string | null> {
  try {
    const wallpaper = await getRegistryValue('HKCU', '\\Control Panel\\Desktop', 'WallPaper')
    if (wallpaper && wallpaper !== '(default)' && existsSync(wallpaper)) {
      return wallpaper
    }

    const backgroundType = await getRegistryValue(
      'HKCU',
      '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers',
      'BackgroundType'
    )
    if (backgroundType === '1') {
      const backgroundPath = await getRegistryValue(
        'HKCU',
        '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers',
        'BackgroundImagePath'
      )
      if (backgroundPath && backgroundPath !== '(default)' && existsSync(backgroundPath)) {
        return backgroundPath
      }
    }
    return null
  } catch (error) {
    return null
  }
}

// 根据文件扩展名获取 MIME 类型
function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    gif: 'image/gif',
    webp: 'image/webp',
    tiff: 'image/tiff',
    tif: 'image/tiff'
  }
  return mimeTypes[ext] || 'image/jpeg'
}
