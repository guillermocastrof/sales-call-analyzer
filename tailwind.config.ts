import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0C0C0C',
        card: '#141414',
        border: '#1E1E1E',
        accent: '#7C3AED',
        secondary: '#A0A0A0',
      },
    },
  },
  plugins: [],
}
export default config
