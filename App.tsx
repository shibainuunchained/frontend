import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

import { LoginScreen } from './src/screens/LoginScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { SendScreen } from './src/screens/SendScreen'
import { ReceiveScreen } from './src/screens/ReceiveScreen'
import { TransactionHistoryScreen } from './src/screens/TransactionHistoryScreen'

import { authService } from './src/services/authService'
import { darkTheme } from './src/theme/darkTheme'

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated()
      setIsAuthenticated(authenticated)
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={darkTheme.colors.background} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: darkTheme.colors.primary,
            background: darkTheme.colors.background,
            card: darkTheme.colors.cardBackground,
            text: darkTheme.colors.text,
            border: darkTheme.colors.border,
            notification: darkTheme.colors.secondary,
          },
        }}
      >
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
          screenOptions={{
            headerStyle: {
              backgroundColor: darkTheme.colors.background,
              borderBottomWidth: 1,
              borderBottomColor: darkTheme.colors.border,
            },
            headerTintColor: darkTheme.colors.text,
            headerTitleStyle: {
              fontFamily: darkTheme.fonts.heading,
              fontSize: darkTheme.fontSizes.lg,
            },
            headerBackTitleVisible: false,
          }}
        >
          {/* Auth Screens */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />

          {/* Main App Screens */}
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              title: 'Shibau Wallet',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Send" 
            component={SendScreen} 
            options={{ 
              title: 'Send Transaction',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen 
            name="Receive" 
            component={ReceiveScreen} 
            options={{ 
              title: 'Receive Crypto',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen 
            name="History" 
            component={TransactionHistoryScreen} 
            options={{ 
              title: 'Transaction History',
              headerBackTitle: 'Back',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkTheme.colors.background,
  },
})
