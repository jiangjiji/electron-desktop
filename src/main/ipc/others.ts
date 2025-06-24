import { ipcMain } from 'electron'
// IPC test

export function registerOthersIpc() {
  ipcMain.on('ping', () => console.log('pong'))
}
