import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Required for Docker HMR
    port: 5173,
    /* proxy: {
      '^/(?!((@vite|@react|@emotion|node_modules|src|components?|assets?|styles?|hooks?|models?|pages?|services?|utils?|pages?|types?|utils?|assets|/index\.html))/)': {
        target: 'http://node-app:3000', // Use Docker service name from docker-compose.yml
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    } */
  }
})
