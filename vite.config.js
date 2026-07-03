import { resolve, extname } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import sharp from 'sharp';
import { optimize } from 'svgo';

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
            async closeBundle() {
                const copyDir = async (src, dest, optimizeImages = false) => {
                    try {
                        if (!fs.existsSync(src)) return;

                        fs.mkdirSync(dest, { recursive: true });
                        const entries = fs.readdirSync(src, { withFileTypes: true });

                        for (const entry of entries) {
                            const srcPath = resolve(src, entry.name);
                            const destPath = resolve(dest, entry.name);

                            if (entry.isDirectory()) {
                                await copyDir(srcPath, destPath, optimizeImages);
                            } else {
                                const ext = extname(entry.name).toLowerCase();

                                if (optimizeImages && ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && entry.name !== 'noise.png') {
                                    try {
                                        let pipeline = sharp(srcPath).resize({ width: 1000, withoutEnlargement: true });
                                        if (ext === '.png') {
                                            pipeline = pipeline.png({ quality: 80, compressionLevel: 9, palette: true });
                                        } else if (['.jpg', '.jpeg'].includes(ext)) {
                                            pipeline = pipeline.jpeg({ quality: 80, progressive: true });
                                        } else if (ext === '.webp') {
                                            pipeline = pipeline.webp({ quality: 80 });
                                        }
                                        await pipeline.toFile(destPath);
                                        const srcSize = fs.statSync(srcPath).size;
                                        const destSize = fs.statSync(destPath).size;
                                        console.log(`Optimized ${entry.name}: ${(srcSize / 1024).toFixed(1)}KB -> ${(destSize / 1024).toFixed(1)}KB`);
                                    } catch (err) {
                                        console.error(`Failed to optimize ${entry.name}, copying original:`, err);
                                        fs.copyFileSync(srcPath, destPath);
                                    }
                                } else if (optimizeImages && ext === '.svg') {
                                    try {
                                        const svgContent = fs.readFileSync(srcPath, 'utf8');
                                        const result = optimize(svgContent, {
                                            path: srcPath,
                                            multipass: true,
                                        });
                                        fs.writeFileSync(destPath, result.data, 'utf8');
                                        const srcSize = fs.statSync(srcPath).size;
                                        const destSize = fs.statSync(destPath).size;
                                        console.log(`Optimized SVG ${entry.name}: ${(srcSize / 1024).toFixed(1)}KB -> ${(destSize / 1024).toFixed(1)}KB`);
                                    } catch (err) {
                                        console.error(`Failed to optimize SVG ${entry.name}, copying original:`, err);
                                        fs.copyFileSync(srcPath, destPath);
                                    }
                                } else {
                                    fs.copyFileSync(srcPath, destPath);
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error copying ${src} to ${dest}:`, err);
                    }
                };

                await copyDir(resolve(__dirname, 'data'), resolve(__dirname, 'dist/data'), false);
                await copyDir(resolve(__dirname, 'assets'), resolve(__dirname, 'dist/assets'), true);
            },
        },
    ],
});
