// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import type { UserConfig, ConfigEnv } from 'vite'

// export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
//   // Load env file based on `mode` in the current working directory.
//   // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
//   const env = loadEnv(mode, process.cwd(), '')
  
//   const useProductionApi = env.USE_PRODUCTION_API === 'true'
//   const apiUrl = useProductionApi 
//     ? 'https://us-central1-rabbit-2ba47.cloudfunctions.net'
//     : 'http://localhost:5000'

//   return {
//     plugins: [react()],
//     optimizeDeps: {
//       include: ['tailwindcss']
//     },
//     server: {
//       port: 3000,
//       strictPort: true,
//       proxy: {
//         '/api': {
//           target: 'http://localhost:5000',
//           changeOrigin: true,
//           secure: false,
//             },
//             '/stripeApi': {
//               target: 'http://localhost:5000',
//               changeOrigin: true,
//               secure: false,
//             }
//           },
//     },
//     define: {
//       'process.env.VITE_API_URL': JSON.stringify(apiUrl)
//     }
//   }
// });

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig, ConfigEnv } from 'vite'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const useProductionApi = env.USE_PRODUCTION_API === 'true'
  const apiUrl = useProductionApi
    ? 'https://us-central1-rabbit-2ba47.cloudfunctions.net'
    : 'http://localhost:5000'

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['tailwindcss']
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
        }
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env': env
    },
    build: {
      sourcemap: true,
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
  }
})