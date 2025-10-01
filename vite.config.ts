import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Only add define for production mode
    // In development, let Vite load from .env files naturally
    ...(mode !== 'development' && {
      define: {
        // In production: 'process.env.VAR' string gets replaced by Cloudflare Pages at build time
        'import.meta.env.VITE_API_URL': 'process.env.VITE_API_URL',
        'import.meta.env.VITE_APP_NAME': 'process.env.VITE_APP_NAME',
        'import.meta.env.VITE_APP_VERSION': 'process.env.VITE_APP_VERSION',
        'import.meta.env.VITE_NODE_ENV': 'process.env.VITE_NODE_ENV',
      },
    }),
  }

  return config
})
