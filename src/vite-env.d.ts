/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_DOCUMENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.ico" {
  const src: string;
  export default src;
}

declare module "axios" {
  interface AxiosRequestConfig {
    /** No redirigir a /login cuando el 401 es el propio login. */
    skipAuthHandler?: boolean;
    /** No adjuntar el token guardado (login). */
    skipAuthHeader?: boolean;
    _retried?: boolean;
  }
}
