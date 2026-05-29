import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                univExtensions: resolve(__dirname, 'univ-extensions/index.html'),
            },
        },
    },
    plugins: [
        {
            name: 'copy-static-dirs',
            closeBundle() {
                const copyDir = (src, dest) => {
                    try {
                        if (fs.existsSync(src)) {
                            fs.cpSync(src, dest, { recursive: true });
                            console.log(`Successfully copied ${src} to ${dest}`);
                        }
                    } catch (err) {
                        console.error(`Error copying ${src} to ${dest}:`, err);
                    }
                };
                copyDir(resolve(__dirname, 'data'), resolve(__dirname, 'dist/data'));
                copyDir(resolve(__dirname, 'assets'), resolve(__dirname, 'dist/assets'));
            },
        },
    ],
});
