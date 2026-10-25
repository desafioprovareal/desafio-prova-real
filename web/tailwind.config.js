/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        grafite: {
          fundo: '#0D1117',
          cartao: '#161B22',
          elevado: '#1C2128',
          borda: '#30363D',
          sutil: '#21262D',
        },
        gelo: {
          principal: '#F0F6FC',
          secundario: '#C9D1D9',
          mutado: '#8B949E',
        },
        ciano: {
          tecnico: '#00E5FF',
          suave: 'rgba(0, 229, 255, 0.12)',
          borda: 'rgba(0, 229, 255, 0.35)',
        },
        ambar: {
          alerta: '#FFB300',
          suave: 'rgba(255, 179, 0, 0.12)',
          borda: 'rgba(255, 179, 0, 0.35)',
        },
        coral: {
          reprovado: '#FF6B6B',
          suave: 'rgba(255, 107, 107, 0.12)',
          borda: 'rgba(255, 107, 107, 0.35)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        ciano: '0 0 24px -4px rgba(0, 229, 255, 0.25)',
        ambar: '0 0 24px -4px rgba(255, 179, 0, 0.2)',
        coral: '0 0 24px -4px rgba(255, 107, 107, 0.2)',
      },
    },
  },
  plugins: [],
};
