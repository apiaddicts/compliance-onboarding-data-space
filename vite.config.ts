import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    legacy(),
    react(),
    nodePolyfills({
      globals: { Buffer: true, process: true, global: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // for TypeScript path alias import like : @/x/y/z
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        secure: false,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/xain-tech/participant': {
        target: 'https://xain.tech/.well-known/participant.json',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/xain-tech\/participant/, '')
      },
      '/xain-tech/terms': {
        target: 'https://xain.tech/.well-known/gx-terms-and-cs.json',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/xain-tech\/terms/, '')
      },
      //'/lrn-gaiax': {
      //  target: 'https://registrationnumber.notary.lab.gaia-x.eu',
      //  changeOrigin: true,
      //  secure: true,
      //  rewrite: path => path.replace(/^\/lrn-gaiax/, ''),
      //  configure: (proxy, _options) => {
      //    proxy.on('proxyReq', (proxyReq, req, res) => {
      //      proxyReq.setHeader('Accept', 'application/json');
      //    });
      //  },
      //},
      '/verifiable': {
        target: "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/verifiable/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Accept', 'application/json');
          });
        },
      }
    }
  }
})
