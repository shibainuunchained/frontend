export const darkTheme = {
  colors: {
    // Primary colors
    background: '#0a0a0a',
    surface: '#1a1a1a',
    primary: '#d4af37', // Golden
    secondary: '#ff9100', // Bright orange
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    
    // UI colors
    border: '#333333',
    cardBackground: '#151515',
    inputBackground: '#1f1f1f',
    
    // Status colors
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    
    // Glassmorphism
    glass: 'rgba(255, 255, 255, 0.05)',
    glassLight: 'rgba(255, 255, 255, 0.1)',
    
    // Shadows
    shadowColor: '#000000',
  },
  
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
    heading: 'Poppins-Bold',
  },
  
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
}

export type Theme = typeof darkTheme