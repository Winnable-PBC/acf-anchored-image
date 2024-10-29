import autoprefixer from 'autoprefixer'
import { resolve } from 'path'

export default {
    base: '/',
    build: {
        cssMinify: 'lightningcss',
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, 'src/input.js'),
            fileName: 'input',
            formats: ['iife'],
            name: 'acfAnchoredImage',
        },
        minify: 'terser',
        outDir: 'dist',
        rollupOptions: {
            output: {
                chunkFileNames: '[name]-[hash:8].js',
                entryFileNames: '[name].js',
            },
        },
        target: 'esnext',
    },
    cacheDir: resolve(__dirname, '.vite'),
    css: {
        postcss: {
            map: false,
            plugins: [autoprefixer()],
        },
    },
}
