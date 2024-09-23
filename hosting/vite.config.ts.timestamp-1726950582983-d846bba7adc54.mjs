// vite.config.ts
import { defineConfig, loadEnv } from "file:///mnt/c/Users/cpcay/Desktop/cartlite/hosting/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/cpcay/Desktop/cartlite/hosting/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/mnt/c/Users/cpcay/Desktop/cartlite/hosting";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvVXNlcnMvY3BjYXkvRGVza3RvcC9jYXJ0bGl0ZS9ob3N0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2MvVXNlcnMvY3BjYXkvRGVza3RvcC9jYXJ0bGl0ZS9ob3N0aW5nL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tbnQvYy9Vc2Vycy9jcGNheS9EZXNrdG9wL2NhcnRsaXRlL2hvc3Rpbmcvdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy50c1xyXG5cclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcsIENvbmZpZ0VudiB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfTogQ29uZmlnRW52KTogVXNlckNvbmZpZyA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcblxyXG4gIGNvbnN0IHVzZVByb2R1Y3Rpb25BcGkgPSBlbnYuVVNFX1BST0RVQ1RJT05fQVBJID09PSAndHJ1ZSc7XHJcbiAgY29uc3QgYXBpVXJsID0gdXNlUHJvZHVjdGlvbkFwaVxyXG4gICAgPyAnaHR0cHM6Ly91cy1jZW50cmFsMS1yYWJiaXQtMmJhNDcuY2xvdWRmdW5jdGlvbnMubmV0L2FwaScgLy8gUmVwbGFjZSB3aXRoIHlvdXIgYWN0dWFsIENsb3VkIEZ1bmN0aW9uIFVSTFxyXG4gICAgOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAxL3JhYmJpdC0yYmE0Ny91cy1jZW50cmFsMS9hcGknOyAvLyBMb2NhbCBlbXVsYXRvciBVUkxcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQGNvbXBvbmVudHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMnKSxcclxuICAgICAgICAnQGxheW91dHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2xheW91dHMnKSxcclxuICAgICAgICAnQGNvbnRleHQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbnRleHQnKSxcclxuICAgICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9ob29rcycpLFxyXG4gICAgICAgICdAdXRpbHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3V0aWxzJyksXHJcbiAgICAgICAgJ0BhcGknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2FwaScpLFxyXG4gICAgICAgICdAc3R5bGVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zdHlsZXMnKSxcclxuICAgICAgICAvLyBBZGQgbW9yZSBhbGlhc2VzIGFzIG5lZWRlZFxyXG4gICAgICB9LFxyXG4gICAgICBleHRlbnNpb25zOiBbJy5qcycsICcuanN4JywgJy50cycsICcudHN4J10sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFsndGFpbHdpbmRjc3MnXSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogYXBpVXJsLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcvc3RyaXBlQXBpJzoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBhcGlVcmwsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdwcm9jZXNzLmVudi5WSVRFX0FQSV9VUkwnOiBKU09OLnN0cmluZ2lmeShhcGlVcmwpLFxyXG4gICAgICAncHJvY2Vzcy5lbnYnOiBlbnYsXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGVzYnVpbGQ6IHtcclxuICAgICAgbG9hZGVyOiAnanN4JyxcclxuICAgICAgaW5jbHVkZTogL3NyY1xcLy4qXFwuanN4PyQvLFxyXG4gICAgICBleGNsdWRlOiBbXSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUE2QjtBQUMvRCxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsUUFBTSxtQkFBbUIsSUFBSSx1QkFBdUI7QUFDcEQsUUFBTSxTQUFTLG1CQUNYLDREQUNBO0FBRUosU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLFFBQ3ZELFlBQVksS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxRQUNqRCxZQUFZLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDakQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsV0FBVztBQUFBLFFBQzdDLFVBQVUsS0FBSyxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUM3QyxRQUFRLEtBQUssUUFBUSxrQ0FBVyxTQUFTO0FBQUEsUUFDekMsV0FBVyxLQUFLLFFBQVEsa0NBQVcsWUFBWTtBQUFBO0FBQUEsTUFFakQ7QUFBQSxNQUNBLFlBQVksQ0FBQyxPQUFPLFFBQVEsT0FBTyxNQUFNO0FBQUEsSUFDM0M7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxhQUFhO0FBQUEsSUFDekI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsUUFDQSxjQUFjO0FBQUEsVUFDWixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTiw0QkFBNEIsS0FBSyxVQUFVLE1BQU07QUFBQSxNQUNqRCxlQUFlO0FBQUEsSUFDakI7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
