
"use client";
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#007BFF',
    },
    secondary: {
      main: '#6c757d',
    },
    error: {
      main: '#dc3545',
    },
    background: {
      default: '#F8F9FA',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
});

export default theme;
