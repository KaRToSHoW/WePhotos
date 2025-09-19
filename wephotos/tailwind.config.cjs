/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deepBlue: '#07102a',
        neonCyan: '#00f7ff',
        neonBlue: '#00b3ff',
        indigoDark: '#0f1b3a',
      },
      backgroundImage: {
        'wephotos-gradient': 'linear-gradient(140deg, #06102d 0%, #08163b 50%, #0f1b3a 100%)'
      },
      boxShadow: {
        neon: '0 0 10px #00f7ff, 0 0 20px #00b3ff'
      },
      borderRadius: {
        '2xl': '1rem'
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    }
  },
  plugins: [],
}
