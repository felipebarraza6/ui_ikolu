// SmartHydro Brand Identity Tokens
// Extracted from smarthydro.cl official site
// Primary: #203562 (Corporate Dark Blue)
// Accent: #CCCF07 (Yellow-Green / Lime)

export const smarthydroColors = {
  // Corporate palette - Smart Hydro brand
  primary: {
    25: '#EBF0F8',
    50: '#D6E0F0',
    100: '#ADC1E0',
    200: '#85A2D1',
    300: '#5C83C1',
    400: '#3A68AA',
    500: '#203562',  // Corporate Dark Blue
    600: '#16294A',
    700: '#0F1E3A',
    800: '#0A152A',
    900: '#050D1A',
  },
  
  // Yellow-Green / Lime accent
  accent: {
    50: '#FDFEE6',
    100: '#F8FAC4',
    200: '#F0F39A',
    300: '#E3E865',
    400: '#CCCF07',  // Yellow-Green
    500: '#B8BB06',
    600: '#9EA105',
    700: '#7F8204',
    800: '#606303',
    900: '#414302',
  },
  
  // Surface colors - glassmorphism
  surface: {
    light: 'rgba(255, 255, 255, 0.03)',
    medium: 'rgba(255, 255, 255, 0.06)',
    strong: 'rgba(255, 255, 255, 0.10)',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(32, 53, 98, 0.2)',
  },
  
  // Supporting colors
  supporting: {
    blue: '#203562',
    cyan: '#CCCF07',
    teal: '#2A9D8F',
    coral: '#F4A261',
    warm: '#E76F51',
  },
  
  // Semantic colors - Water themed
  semantic: {
    success: '#2A9D8F',  // Clean water teal
    successBg: 'rgba(42, 157, 143, 0.15)',
    successBorder: 'rgba(42, 157, 143, 0.3)',
    
    warning: '#F4A261',  // Warm coral
    warningBg: 'rgba(244, 162, 97, 0.15)',
    warningBorder: 'rgba(244, 162, 97, 0.3)',
    
    error: '#E76F51',    // Deep coral
    errorBg: 'rgba(231, 111, 81, 0.15)',
    errorBorder: 'rgba(231, 111, 81, 0.3)',
    
    info: '#3A68AA',     // Corporate blue
    infoBg: 'rgba(58, 104, 170, 0.15)',
    infoBorder: 'rgba(58, 104, 170, 0.3)',
  },
  
  // Neutral palette - Cool grays for dark theme
  neutral: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#050D1A',  // Deep background
  },
};

export const smarthydroTypography = {
  heading: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const smarthydroSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const smarthydroRadii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const smarthydroShadows = {
  none: 'none',
  sm: '0 1px 3px rgba(32, 53, 98, 0.1)',
  md: '0 4px 16px rgba(32, 53, 98, 0.12)',
  lg: '0 8px 32px rgba(32, 53, 98, 0.15)',
  xl: '0 12px 48px rgba(32, 53, 98, 0.2)',
  glow: '0 0 20px rgba(204, 207, 7, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  focus: '0 0 0 3px rgba(32, 53, 98, 0.25)',
};

export const smarthydroGradients = {
  // Corporate deep gradient
  ocean: 'linear-gradient(-45deg, #203562, #3A68AA, #4D7FBD, #85A2D1)',
  oceanDeep: 'linear-gradient(180deg, #050D1A 0%, #203562 50%, #2A4A8A 100%)',
  
  // Surface gradient - Glassmorphism base
  surface: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  surfaceHover: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
  
  // Primary gradient for KPIs
  primary: 'linear-gradient(135deg, #203562 0%, #3A68AA 100%)',
  primaryReverse: 'linear-gradient(135deg, #3A68AA 0%, #203562 100%)',
  
  // Accent gradient
  accent: 'linear-gradient(135deg, #CCCF07 0%, #B8BB06 100%)',
  accentGlow: 'linear-gradient(135deg, #F0F39A 0%, #CCCF07 50%, #B8BB06 100%)',
  
  // Teal success gradient
  success: 'linear-gradient(135deg, #2A9D8F 0%, #3DB8A8 100%)',
  
  // Coral warning gradient
  warning: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
  
  // Info gradient
  info: 'linear-gradient(135deg, #3A68AA 0%, #5C83C1 100%)',
};

export const smarthydroTransitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
};

// Combined export for easy import
export const smarthydro = {
  colors: smarthydroColors,
  typography: smarthydroTypography,
  spacing: smarthydroSpacing,
  radii: smarthydroRadii,
  shadows: smarthydroShadows,
  gradients: smarthydroGradients,
  transitions: smarthydroTransitions,
};
