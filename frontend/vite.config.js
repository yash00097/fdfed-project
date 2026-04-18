import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      proxy: {
        '/backend': {
          target: env.VITE_RENDER_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss()
    ],
  }
})
