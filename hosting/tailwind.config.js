// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.my-masonry-grid': {
          display: 'flex',
          marginLeft: '-30px',
          width: 'auto',
        },
        '.my-masonry-grid_column': {
          paddingLeft: '30px',
          backgroundClip: 'padding-box',
        },
        '.my-masonry-grid_column > div': {
          marginBottom: '30px',
        },
     
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ],
};