// src/theme.js

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Poppins, sans-serif',
  },
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        margin: 0,
        padding: 0,
        fontFamily: 'Poppins, sans-serif',
      },
    },
  },
});

export default theme;
