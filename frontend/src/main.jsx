import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme, responsiveFontSizes } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import App from './App';

const headingFont = '"Playfair Display", Georgia, serif';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D6457A',
      light: '#F58FB0',
      dark: '#B03262',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4F9D69',
      light: '#8CC9A0',
      dark: '#2F7A4A',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#FFC857',
      contrastText: '#3A2A30',
    },
    blush: {
      main: '#FDE7EE',
    },
    error: { main: '#D32F2F' },
    warning: { main: '#ED9B1F' },
    info: { main: '#3B82C4' },
    success: { main: '#2F7A4A' },
    background: {
      default: '#FFF8F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3A2A30',
      secondary: '#7A6168',
    },
    divider: '#F0DDE3',
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
    fontFamily: '"Be Vietnam Pro", "Roboto", sans-serif',
    h1: { fontFamily: headingFont, fontWeight: 700, fontSize: '3rem', lineHeight: 1.2 },
    h2: { fontFamily: headingFont, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.25 },
    h3: { fontFamily: headingFont, fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontFamily: headingFont, fontWeight: 600, fontSize: '1.375rem' },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem' },
    caption: { fontSize: '0.75rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#FFF8F5' },
        ':focus-visible': { outline: '2px solid #4F9D69', outlineOffset: 2 },
      },
    },
    MuiContainer: { defaultProps: { maxWidth: 'lg' } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, padding: '10px 24px', minHeight: 44 },
        containedPrimary: { '&:hover': { backgroundColor: '#B03262' } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(214,69,122,.08)',
          transition: 'box-shadow .2s, transform .2s',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(214,69,122,.16)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 12, backgroundColor: '#FFFFFF' } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0DDE3' },
      },
    },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
});

theme = responsiveFontSizes(theme, { factor: 2.5 });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
