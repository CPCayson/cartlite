// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { UserConfig, ConfigEnv } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  const useProductionApi = env.USE_PRODUCTION_API === 'true';
  const apiUrl = useProductionApi
    ? 'https://us-central1-rabbit-2ba47.cloudfunctions.net/api' // Replace with your actual Cloud Function URL
    : 'http://localhost:5001/rabbit-2ba47/us-central1/api'; // Local emulator URL

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        // Add more aliases as needed
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimizeDeps: {
      include: ['tailwindcss'],
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/stripeApi': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env': env,
    },
    build: {
      sourcemap: true,
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
  };
});
