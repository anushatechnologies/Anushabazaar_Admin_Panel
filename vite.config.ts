import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDevServer = command === 'serve';
  const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.anushatechnologies.com';
  const authBaseUrl = env.VITE_AUTH_BASE_URL || 'https://api.anushatechnologies.com';
  
  return {
    base: '/',
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        '/admin-panel/api': {
          target: 'https://api.anushatechnologies.com',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: 'https://api.anushatechnologies.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@features": path.resolve(__dirname, "src/features"),
        "@app": path.resolve(__dirname, "src/app"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@layouts": path.resolve(__dirname, "src/layouts"),
        "@routes": path.resolve(__dirname, "src/routes"),
        "@api": path.resolve(__dirname, "src/api"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@styles": path.resolve(__dirname, "src/styles"),
        "@types": path.resolve(__dirname, "src/types"),
        "@store": path.resolve(__dirname, "src/store"),
        "@mocks": path.resolve(__dirname, "src/mocks"),
        "@contexts": path.resolve(__dirname, "src/contexts"),
        "@": path.resolve(__dirname, "src"),
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || 'development'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_AUTH_BASE_URL': JSON.stringify(authBaseUrl),
    }
  };
});
