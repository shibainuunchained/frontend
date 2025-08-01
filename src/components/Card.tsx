import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { darkTheme } from '../theme/darkTheme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'default' | 'glass' | 'elevated'
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card]
    
    switch (variant) {
      case 'glass':
        baseStyle.push(styles.glass)
        break
      case 'elevated':
        baseStyle.push(styles.elevated)
        break
      default:
        baseStyle.push(styles.default)
    }
    
    return baseStyle
  }

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: darkTheme.borderRadius.lg,
    padding: darkTheme.spacing.lg,
  },
  default: {
    backgroundColor: darkTheme.colors.cardBackground,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  glass: {
    backgroundColor: darkTheme.colors.glass,
    borderWidth: 1,
    borderColor: darkTheme.colors.glassLight,
    backdropFilter: 'blur(10px)',
  },
  elevated: {
    backgroundColor: darkTheme.colors.cardBackground,
    ...darkTheme.shadows.medium,
  },
})