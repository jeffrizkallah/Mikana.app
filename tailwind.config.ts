import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      // Extra small devices (small phones, folded foldables)
      'xs': '375px',
      // Small devices (phones, Samsung Fold unfolded inner)
      'sm': '640px',
      // Medium-small (large phones, small tablets, foldables)
      'fold': '752px',
      // Medium devices (tablets)
      'md': '768px',
      // Large devices (landscape tablets, small laptops)
      'lg': '1024px',
      // Extra large devices (desktops)
      'xl': '1280px',
      // 2X large devices (large desktops)
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#8b1e2e',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#FEF7EF',
          foreground: '#1a1a31',
        },
        neutral: {
          dark: '#1a1a31',
          light: '#f6f6f7',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config

