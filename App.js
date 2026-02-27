import { StatusBar } from 'expo-status-bar';
import React, { useContext } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import ExpenseScreen from './src/screens/ExpenseScreen';
import AuthScreen from './src/screens/AuthScreen'; // ← ADD THIS LINE

function MainApp() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6f42c1" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <ExpenseScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}