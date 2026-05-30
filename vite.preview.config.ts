import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 把整个预览打包成单个 HTML 文件,可直接用浏览器打开(file://)。
export default defineConfig({
  root: 'preview',
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../preview-dist',
    emptyOutDir: true,
  },
})
