import { ElectronAPI } from "@electron-toolkit/preload";

interface DesktopFile {
	name: string;
	path: string;
	isDirectory: boolean;
	isFile: boolean;
	ext: string;
	icon: string;
}

interface DesktopApi {
	getDesktopFiles: () => Promise<DesktopFile[]>;
}

declare global {
	interface Window {
		electron: ElectronAPI;
		api: DesktopApi;
	}
}
