import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002045',
        'primary-container': '#e8eef5',
        secondary: '#735c00',
        'secondary-container': '#fed65b',
        'on-secondary-container': '#745c00',
        'secondary-fixed': '#d4af37',
        background: '#f7fafc',
        surface: '#f7fafc',
        'surface-container': '#f8fafc',
        'surface-container-low': '#f1f5f9',
        'surface-container-lowest': '#ffffff',
        'on-surface-variant': '#64748b',
        'on-primary-container': '#cbd5e1',
        'on-background': '#0f172a'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        premium: '0 4px 15px rgba(26,54,93,0.05)'
      }
    }
  }
}
