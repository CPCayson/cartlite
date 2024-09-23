// vite.config.ts
import { defineConfig, loadEnv } from "file:///c:/Users/cpcay/Desktop/cartlite/hosting/node_modules/vite/dist/node/index.js";
import react from "file:///c:/Users/cpcay/Desktop/cartlite/hosting/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "c:\\Users\\cpcay\\Desktop\\cartlite\\hosting";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useProductionApi = env.USE_PRODUCTION_API === "true";
  const apiUrl = useProductionApi ? "https://us-central1-rabbit-2ba47.cloudfunctions.net/api" : "http://localhost:5001/rabbit-2ba47/us-central1/api";
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@components": path.resolve(__vite_injected_original_dirname, "src/components"),
        "@layouts": path.resolve(__vite_injected_original_dirname, "src/layouts"),
        "@context": path.resolve(__vite_injected_original_dirname, "src/context"),
        "@hooks": path.resolve(__vite_injected_original_dirname, "src/hooks"),
        "@utils": path.resolve(__vite_injected_original_dirname, "src/utils"),
        "@api": path.resolve(__vite_injected_original_dirname, "src/api"),
        "@styles": path.resolve(__vite_injected_original_dirname, "src/styles")
        // Add more aliases as needed
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    optimizeDeps: {
      include: ["tailwindcss"]
    },
    server: {
      port: 3e3,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        },
        "/stripeApi": {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    define: {
      "process.env.VITE_API_URL": JSON.stringify(apiUrl),
      "process.env": env
    },
    build: {
      sourcemap: true
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.jsx?$/,
      exclude: []
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxjcGNheVxcXFxEZXNrdG9wXFxcXGNhcnRsaXRlXFxcXGhvc3RpbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcImM6XFxcXFVzZXJzXFxcXGNwY2F5XFxcXERlc2t0b3BcXFxcY2FydGxpdGVcXFxcaG9zdGluZ1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYzovVXNlcnMvY3BjYXkvRGVza3RvcC9jYXJ0bGl0ZS9ob3N0aW5nL3ZpdGUuY29uZmlnLnRzXCI7Ly8gdml0ZS5jb25maWcudHNcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBDb25maWdFbnYgfSBmcm9tICd2aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH06IENvbmZpZ0Vudik6IFVzZXJDb25maWcgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICBjb25zdCB1c2VQcm9kdWN0aW9uQXBpID0gZW52LlVTRV9QUk9EVUNUSU9OX0FQSSA9PT0gJ3RydWUnO1xyXG4gIGNvbnN0IGFwaVVybCA9IHVzZVByb2R1Y3Rpb25BcGlcclxuICAgID8gJ2h0dHBzOi8vdXMtY2VudHJhbDEtcmFiYml0LTJiYTQ3LmNsb3VkZnVuY3Rpb25zLm5ldC9hcGknIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFjdHVhbCBDbG91ZCBGdW5jdGlvbiBVUkxcclxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMS9yYWJiaXQtMmJhNDcvdXMtY2VudHJhbDEvYXBpJzsgLy8gTG9jYWwgZW11bGF0b3IgVVJMXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0Bjb21wb25lbnRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAgICAgJ0BsYXlvdXRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9sYXlvdXRzJyksXHJcbiAgICAgICAgJ0Bjb250ZXh0JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb250ZXh0JyksXHJcbiAgICAgICAgJ0Bob29rcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaG9va3MnKSxcclxuICAgICAgICAnQHV0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy91dGlscycpLFxyXG4gICAgICAgICdAYXBpJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9hcGknKSxcclxuICAgICAgICAnQHN0eWxlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzJyksXHJcbiAgICAgICAgLy8gQWRkIG1vcmUgYWxpYXNlcyBhcyBuZWVkZWRcclxuICAgICAgfSxcclxuICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLmpzeCcsICcudHMnLCAnLnRzeCddLFxyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOiBbJ3RhaWx3aW5kY3NzJ10sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IGFwaVVybCxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnL3N0cmlwZUFwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogYXBpVXJsLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAncHJvY2Vzcy5lbnYuVklURV9BUElfVVJMJzogSlNPTi5zdHJpbmdpZnkoYXBpVXJsKSxcclxuICAgICAgJ3Byb2Nlc3MuZW52JzogZW52LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBlc2J1aWxkOiB7XHJcbiAgICAgIGxvYWRlcjogJ2pzeCcsXHJcbiAgICAgIGluY2x1ZGU6IC9zcmNcXC8uKlxcLmpzeD8kLyxcclxuICAgICAgZXhjbHVkZTogW10sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUpqQixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBNkI7QUFDL0QsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFFBQU0sbUJBQW1CLElBQUksdUJBQXVCO0FBQ3BELFFBQU0sU0FBUyxtQkFDWCw0REFDQTtBQUVKLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxlQUFlLEtBQUssUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxRQUN2RCxZQUFZLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDakQsWUFBWSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLFFBQ2pELFVBQVUsS0FBSyxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUM3QyxVQUFVLEtBQUssUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDN0MsUUFBUSxLQUFLLFFBQVEsa0NBQVcsU0FBUztBQUFBLFFBQ3pDLFdBQVcsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQTtBQUFBLE1BRWpEO0FBQUEsTUFDQSxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU8sTUFBTTtBQUFBLElBQzNDO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsYUFBYTtBQUFBLElBQ3pCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsY0FBYztBQUFBLFVBQ1osUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sNEJBQTRCLEtBQUssVUFBVSxNQUFNO0FBQUEsTUFDakQsZUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
