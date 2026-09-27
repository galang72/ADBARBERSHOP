/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna utama dari logo Tritama (Merah Shield)
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9ba',
          400: '#ec7894',
          500: '#df4c6f',
          600: '#c93055',
          700: '#a82343',
          800: '#8b1f3a',  // Merah utama logo
          900: '#771d35',
          950: '#420a18',
        },
        // Warna sekunder (Emas/Gold dari Crown)
        secondary: {
          50: '#fdf9ed',
          100: '#f8f0d5',
          200: '#f0e0ac',
          300: '#e6ca79',
          400: '#dbb04c',
          500: '#c9942e',
          600: '#b07a23',
          700: '#8b5e1e',  // Gold tua
          800: '#744b1e',
          900: '#633e1c',
          950: '#391f0e',
        },
        // Warna aksen (Biru gelap dari logo)
        accent: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#7a8fa3',
          500: '#5c6f7f',
          600: '#445768',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#1b365d',  // Navy blue dari logo
        },
        // Warna latar khusus
        cream: {
          50: '#fdfbf7',
          100: '#faf6ed',
          200: '#f5ecd5',
          300: '#ede0b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
