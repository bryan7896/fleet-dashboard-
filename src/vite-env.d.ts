interface ImportMetaEnv {
  DEV: any
  readonly VITE_API_URL: string
  readonly VITE_SIGNALR_URL: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}