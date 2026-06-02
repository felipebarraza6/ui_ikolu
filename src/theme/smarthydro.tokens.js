// SmartHydro Brand Identity Tokens
// Extracted from smarthydro.cl official site
// Primary: #203562 (Corporate Dark Blue)
// Accent: #CCCF07 (Yellow-Green / Lime)

export const smarthydroColors = {
  // Primary palette - Corporate Blue
  primary: {
    25: '#F5F6FA',
    50: '#E8EBF2',
    100: '#D1D6E5',
    200: '#A3ADCB',
    300: '#7584B1',
    400: '#4D6399',
    500: '#203562',  // PRIMARY BRAND COLOR
    600: '#1B2D54',
    700: '#152447',
    800: '#0F1B3A',
    900: '#0A1228',
  },
  
  // Accent palette - Yellow-Green (CTAs, highlights)
  accent: {
    50: '#F9F9E6',
    100: '#F0F0CC',
    200: '#E6E699',
    300: '#D9D966',
    400: '#CCCF07',  // ACCENT BRAND COLOR
    500: '#BDC00C',
    600: '#9BA00A',
    700: '#7A8008',
    800: '#596006',
    900: '#3D4204',
  },
  
  // Secondary backgrounds
  secondary: '#F0EFF4',
  secondaryLight: '#F9F9FF',
  
  // Supporting colors
  supporting: {
    blue: '#3A68AA',    // Gradients, depth
    olive: '#69812A',   // Nature/water connection
    yellow: '#FCE921',  // Bright highlights
  },
  
  // Semantic colors (mapped to brand identity)
  semantic: {
    success: '#69812A',  // Olive (naturaleza/agua)
    successBg: '#F4F7E8',
    successBorder: '#D4E0A8',
    
    warning: '#CCCF07',  // Yellow-green (coincide con marca)
    warningBg: '#F9F9E6',
    warningBorder: '#E6E699',
    
    error: '#DC2626',    // Rojo estándar
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    
    info: '#3A68AA',     // Supporting blue
    infoBg: '#EBF0F8',
    infoBorder: '#B8CCE8',
  },
  
  // Neutral palette
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D9D9D9',
    400: '#BFBFBF',
    500: '#8C8C8C',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#141414',
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
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const smarthydroShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(32, 53, 98, 0.05)',
  md: '0 4px 12px rgba(32, 53, 98, 0.08)',
  lg: '0 8px 24px rgba(32, 53, 98, 0.12)',
  xl: '0 12px 36px rgba(32, 53, 98, 0.16)',
  inner: 'inset 0 2px 4px rgba(32, 53, 98, 0.06)',
  focus: '0 0 0 3px rgba(32, 53, 98, 0.15)',
};

export const smarthydroGradients = {
  // Primary gradient for KPIs, headers
  primary: 'linear-gradient(135deg, #203562 0%, #3A68AA 100%)',
  primaryReverse: 'linear-gradient(135deg, #3A68AA 0%, #203562 100%)',
  
  // Accent gradient for CTAs, highlights
  accent: 'linear-gradient(135deg, #CCCF07 0%, #BDC00C 100%)',
  
  // Subtle gradient for cards, backgrounds
  subtle: 'linear-gradient(135deg, #F0EFF4 0%, #E8EBF2 100%)',
  
  // Success gradient (olive-based)
  success: 'linear-gradient(135deg, #69812A 0%, #7A9A32 100%)',
  
  // Info gradient (supporting blue)
  info: 'linear-gradient(135deg, #3A68AA 0%, #4D7FBD 100%)',
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
