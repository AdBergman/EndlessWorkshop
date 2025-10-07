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
