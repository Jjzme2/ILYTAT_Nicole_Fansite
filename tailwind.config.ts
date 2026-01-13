import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                text: 'var(--color-text)',
                muted: 'var(--color-muted)',
                border: 'var(--color-border)',
                success: 'var(--color-success)',
                error: 'var(--color-error)',
                warning: 'var(--color-warning)',
                info: 'var(--color-info)',
            }
        }
    }
}
