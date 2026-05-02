import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [tsconfigPaths(), react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        base: isProduction ? './' : '/', // relative paths in production, root in dev
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    tech: resolve(__dirname, 'tech.html'),
                    units: resolve(__dirname, 'units.html'),
                    summary: resolve(__dirname, 'summary.html'),
                    codex: resolve(__dirname, 'codex.html'),
                    mods: resolve(__dirname, 'mods.html'),
                    info: resolve(__dirname, 'info.html'),
                },
            },
        },
        server: {
            open: true,
            proxy: !isProduction
                ? {
                    '/api': {
                        target: 'http://localhost:8080',
                        changeOrigin: true,
                        secure: false,
                    },
                }
                : undefined,
        },
    };
});
