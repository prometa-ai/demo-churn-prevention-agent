import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    prometa: {
      // Turkuaz/yeşil tonları
      50: '#e6fff9',
      100: '#b3fff0',
      200: '#80ffe6',
      300: '#4dffdc',
      400: '#1affd2',
      500: '#00cc9f', // Ana turkuaz
      600: '#19B798', // Logo turkuazı
      700: '#008c6b',
      800: '#006b51',
      900: '#004d3a',
    },
    prometaOrange: {
      // Turuncu tonları
      50: '#fff2e6',
      100: '#ffd9b3',
      200: '#ffc080',
      300: '#ffa64d',
      400: '#ff8c1a',
      500: '#FF5722', // Ana turuncu
      600: '#FF4713', // Logo turuncu
      700: '#b33000',
      800: '#802300',
      900: '#401200',
    },
  },
  fonts: {
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'prometa.600',
          color: 'white',
          _hover: {
            bg: 'prometa.700',
          },
        },
        secondary: {
          bg: 'prometaOrange.500',
          color: 'white',
          _hover: {
            bg: 'prometaOrange.600',
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: 'prometa.600',
              borderColor: 'prometa.600',
              borderBottomColor: 'transparent',
            },
          },
        },
      },
    },
    Badge: {
      variants: {
        solid: {
          bg: 'prometa.600',
        },
      },
      defaultProps: {
        colorScheme: 'prometa',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default theme; 