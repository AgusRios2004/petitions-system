
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
    mode: 'dark',
    primary: {
      main: '#3b82f6', // blue-500
    },
    secondary: {
      main: '#6b7280', // gray-500
    },
    error: {
      main: '#ef4444', // red-500
    },
    background: {
      default: '#030712', // gray-950 (Fondo global oscuro)
      paper: '#1f2937',   // gray-800
    },
    text: {
      primary: '#f3f4f6', // gray-100
      secondary: '#9ca3af', // gray-400
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
});

export default theme;
