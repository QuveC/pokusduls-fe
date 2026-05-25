import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(), // ← aktifkan HTTPS agar kamera bisa diakses dari IP lokal
  ],
  server: {
    host: true,   // expose ke network (0.0.0.0)
    port: 5173,
    https: true,  // wajib agar Chrome izinkan kamera
  },
});

