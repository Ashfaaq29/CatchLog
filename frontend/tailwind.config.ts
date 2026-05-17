import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tactical Field Kit (Material You roles) — locked to DESIGN.md
        background: '#111316',
        surface: '#111316',
        'surface-dim': '#111316',
        'surface-bright': '#37393d',
        'surface-variant': '#333538',
        'surface-container-lowest': '#0c0e11',
        'surface-container-low': '#1a1c1f',
        'surface-container': '#1e2023',
        'surface-container-high': '#282a2d',
        'surface-container-highest': '#333538',
        'surface-tint': '#ffb86b',

        'on-surface': '#e2e2e6',
        'on-surface-variant': '#dac2ae',
        'on-background': '#e2e2e6',
        'inverse-surface': '#e2e2e6',
        'inverse-on-surface': '#2f3034',

        outline: '#a28d7a',
        'outline-variant': '#544434',

        primary: '#ffc68b',
        'primary-container': '#ff9f1c',
        'on-primary': '#492900',
        'on-primary-container': '#683c00',
        'inverse-primary': '#895100',
        'primary-fixed': '#ffdcbc',
        'primary-fixed-dim': '#ffb86b',
        'on-primary-fixed': '#2c1700',
        'on-primary-fixed-variant': '#683d00',

        secondary: '#e6feff',
        'on-secondary': '#003739',
        'secondary-container': '#00f4fe',
        'on-secondary-container': '#006c71',
        'secondary-fixed': '#63f7ff',
        'secondary-fixed-dim': '#00dce5',
        'on-secondary-fixed': '#002021',
        'on-secondary-fixed-variant': '#004f53',

        tertiary: '#90daff',
        'on-tertiary': '#003547',
        'tertiary-container': '#00c3fd',
        'on-tertiary-container': '#004d66',
        'tertiary-fixed': '#c0e8ff',
        'tertiary-fixed-dim': '#70d2ff',
        'on-tertiary-fixed': '#001e2b',
        'on-tertiary-fixed-variant': '#004d66',

        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        base: '8px',
        md: '16px',
        gutter: '16px',
        lg: '24px',
        'container-padding': '24px',
        xl: '40px',
      },
      fontFamily: {
        'headline-lg': ['Montserrat', 'sans-serif'],
        'headline-md': ['Montserrat', 'sans-serif'],
        'headline-sm': ['Montserrat', 'sans-serif'],
        'body-lg': ['Montserrat', 'sans-serif'],
        'body-md': ['Montserrat', 'sans-serif'],
        'data-lg': ['"JetBrains Mono"', 'monospace'],
        'data-sm': ['"JetBrains Mono"', 'monospace'],
        'label-caps': ['"JetBrains Mono"', 'monospace'],
        sans: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'data-lg': ['16px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'data-sm': ['13px', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1.0', fontWeight: '700' }],
      },
      keyframes: {
        'sonar-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'sonar-pulse': 'sonar-pulse 2s ease-out infinite',
        scan: 'scan 4s linear infinite',
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
