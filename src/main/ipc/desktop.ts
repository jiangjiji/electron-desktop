import { app, ipcMain, shell } from "electron";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export function registerDesktopIpc() {
  ipcMain.handle("getDesktopFiles", async () => {
    const desktopPath = app.getPath("desktop");
    const files: any[] = [];
    try {
      const names = readdirSync(desktopPath);
      for (const name of names) {
        const fullPath = join(desktopPath, name);
        const stat = statSync(fullPath);
        let iconDataUrl = "";
        let ext = name.split('.').pop()?.toLowerCase() || "";
        let iconTargetPath = fullPath;

        // 如果是.lnk，尝试解析目标路径
        if (ext === "lnk") {
          try {
            const shortcut = shell.readShortcutLink(fullPath);
            if (shortcut.target) {
              iconTargetPath = shortcut.target;
            }
          } catch {
            // 解析失败，iconTargetPath 仍为 .lnk 本身
          }
        }

        try {
          const icon = await app.getFileIcon(iconTargetPath, { size: "normal" });
          iconDataUrl = icon.toDataURL();
        } catch {}

        files.push({
          name,
          path: fullPath,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          ext,
          icon: iconDataUrl,
        });
      }
    } catch (e) {
      // 读取目录失败
    }
    return files;
  });
} 