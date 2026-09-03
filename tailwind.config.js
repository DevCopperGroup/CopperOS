/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Verde da marca CopperOS — canônico.
         * Valores idênticos ao `emerald` do Tailwind: o produto já usa
         * `emerald-*` em ~460 lugares e o favicon em index.html é #10B981.
         * Prefira `brand-*` em código novo; `emerald-*` continua equivalente.
         */
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399', // acento em fundo escuro (7.97:1 sobre night-800)
          500: '#10B981', // cor primária de ação
          600: '#059669',
          700: '#047857', // acento em fundo claro (5.48:1 sobre branco)
          800: '#065F46',
          900: '#064E3B',
        },

        /**
         * Superfícies do tema escuro — verde-quase-preto.
         * Consolida os 10 tons ad-hoc que existiam antes; cinco pares eram
         * imperceptíveis entre si (<1.07:1) e foram colapsados.
         * Todos garantem >=5.3:1 com gray-400 por cima.
         */
        night: {
          950: '#070F0B', // fundo da página
          900: '#0A140F', // fundo elevado
          850: '#0E1A14', // card
          800: '#16291E', // card alternativo / borda subtil
          700: '#1A3324', // borda de destaque
          600: '#2E5A42', // borda ativa / hover
        },
      },

      /**
       * Escala tipográfica.
       * O produto vivia entre 8px e 12px; o degrau mínimo passa a 12px
       * (`micro`) e o corpo de texto a 15px (`sm`), com entrelinha mais
       * generosa para leitura prolongada.
       */
      fontSize: {
        micro: ['0.75rem', { lineHeight: '1rem' }],        // 12px — badges, pills
        xs: ['0.8125rem', { lineHeight: '1.125rem' }],     // 13px — metadados
        sm: ['0.9375rem', { lineHeight: '1.375rem' }],     // 15px — corpo
        base: ['1rem', { lineHeight: '1.5rem' }],          // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glow-brand': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
      },

      minHeight: {
        touch: '2.75rem', // 44px — alvo mínimo de toque (WCAG 2.2 AA)
      },
      minWidth: {
        touch: '2.75rem',
      },
    },
  },
  plugins: [],
}
