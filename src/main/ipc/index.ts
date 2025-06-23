import { registerDesktopIpc } from "./desktop";
import { registerOthersIpc } from "./others";

export function registerAllIpc() {
  registerDesktopIpc();

  registerOthersIpc();
} 