/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}

interface ImportMetaEnv {
  readonly VITE_PORT: number
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}