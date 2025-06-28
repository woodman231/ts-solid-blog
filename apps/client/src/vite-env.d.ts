/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_ADB2C_CLIENT_ID: string;
    readonly VITE_ADB2C_TENANT_NAME: string;
    readonly VITE_ADB2C_TENANT_ID: string;
    readonly VITE_ADB2C_DOMAIN_NAME: string;
    readonly VITE_ADB2C_SIGNIN_POLICY: string;
    readonly VITE_SOCKET_URL: string;
    // Add any other env vars you need
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}