import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native'
import { darkTheme } from '../theme/darkTheme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  secureTextEntry?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={darkTheme.colors.textMuted}
          selectionColor={darkTheme.colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: darkTheme.spacing.md,
  },
  label: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  inputContainer: {
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    paddingHorizontal: darkTheme.spacing.md,
  },
  inputContainerFocused: {
    borderColor: darkTheme.colors.primary,
    ...darkTheme.shadows.small,
  },
  inputContainerError: {
    borderColor: darkTheme.colors.error,
  },
  input: {
    color: darkTheme.colors.text,
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    paddingVertical: darkTheme.spacing.md,
    minHeight: 48,
  },
  error: {
    fontSize: darkTheme.fontSizes.xs,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.error,
    marginTop: darkTheme.spacing.xs,
  },
})