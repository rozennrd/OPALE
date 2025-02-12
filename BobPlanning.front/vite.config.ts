import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Charge le .env à la racine de BobPlanning

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.JPG', '**/*.PNG'], // Inclure les fichiers d'images comme assets
});
  

