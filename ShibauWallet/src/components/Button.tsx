import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { darkTheme } from '../theme/darkTheme'

interface ButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]]
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary)
        break
      case 'secondary':
        baseStyle.push(styles.secondary)
        break
      case 'outline':
        baseStyle.push(styles.outline)
        break
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled)
    }
    
    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]]
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText)
        break
      case 'secondary':
        baseStyle.push(styles.secondaryText)
        break
      case 'outline':
        baseStyle.push(styles.outlineText)
        break
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledText)
    }
    
    return baseStyle
  }

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? darkTheme.colors.primary : darkTheme.colors.background} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: darkTheme.borderRadius.md,
    ...darkTheme.shadows.small,
  },
  
  // Sizes
  small: {
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: darkTheme.spacing.lg,
    paddingVertical: darkTheme.spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: darkTheme.spacing.xl,
    paddingVertical: darkTheme.spacing.lg,
    minHeight: 56,
  },
  
  // Variants
  primary: {
    backgroundColor: darkTheme.colors.primary,
  },
  secondary: {
    backgroundColor: darkTheme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: darkTheme.colors.primary,
  },
  
  // Text styles
  text: {
    fontFamily: darkTheme.fonts.medium,
    textAlign: 'center',
  },
  smallText: {
    fontSize: darkTheme.fontSizes.sm,
  },
  mediumText: {
    fontSize: darkTheme.fontSizes.md,
  },
  largeText: {
    fontSize: darkTheme.fontSizes.lg,
  },
  
  // Text variants
  primaryText: {
    color: darkTheme.colors.background,
  },
  secondaryText: {
    color: darkTheme.colors.background,
  },
  outlineText: {
    color: darkTheme.colors.primary,
  },
  
  // Disabled states
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
})