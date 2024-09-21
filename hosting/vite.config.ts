import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { UserConfig, ConfigEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  const useProductionApi = env.USE_PRODUCTION_API === 'true';
  const apiUrl = useProductionApi
    ? 'https://us-central1-rabbit-2ba47.cloudfunctions.net/api' 
    : 'http://localhost:5001/rabbit-2ba47/us-central1/api'; 

  return {
    plugins: [
      react(),
      visualizer({
        open: true, // Automatically open the report in your browser
        gzipSize: true, // Show gzip sizes in the report
        brotliSize: true, // Show brotli sizes in the report (if relevant)
      })
    ],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@styles': path.resolve(__dirname, 'src/styles'),
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
      rollupOptions: {
        output: {
          manualChunks: {
            // Split common libraries into their own chunks
            vendor: ['react', 'react-dom'],
            firebase: ['firebase'],
            stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          },
        },
      },
    },
    esbuild: {
      loader: 'tsx', // Change loader to 'tsx' for TypeScript support
      include: /src\/.*\.(jsx?|tsx)$/, // Include both .js, .jsx, .ts, and .tsx files
      exclude: [],
    },
  };
});
